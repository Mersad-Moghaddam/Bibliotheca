package reminderService

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"go.uber.org/zap"
	"negar-backend/models/reminderDelivery"
	"negar-backend/pkg/reminders"
	"negar-backend/repositories"
)

type Sender interface {
	SendReminder(ctx context.Context, userID string, scheduledFor time.Time, payload map[string]any) error
}

type LogSender struct{ logger *zap.Logger }

func NewLogSender(logger *zap.Logger) *LogSender { return &LogSender{logger: logger} }

func (s *LogSender) SendReminder(_ context.Context, userID string, scheduledFor time.Time, payload map[string]any) error {
	s.logger.Info("reminder_dispatched", zap.String("user_id", userID), zap.Time("scheduled_for", scheduledFor), zap.Any("payload", payload))
	return nil
}

type Service struct {
	users      repositories.UserRepository
	deliveries repositories.ReminderDeliveryRepository
	sender     Sender
	logger     *zap.Logger
	maxRetries int
}

func New(users repositories.UserRepository, deliveries repositories.ReminderDeliveryRepository, sender Sender, logger *zap.Logger) *Service {
	return &Service{users: users, deliveries: deliveries, sender: sender, logger: logger, maxRetries: 3}
}

func (s *Service) Tick(ctx context.Context, now time.Time) {
	s.scheduleDue(ctx, now)
	s.dispatch(ctx, now)
}

func (s *Service) scheduleDue(ctx context.Context, now time.Time) {
	users, err := s.users.ListReminderEnabled(ctx)
	if err != nil {
		s.logger.Warn("reminder_schedule_users_failed", zap.Error(err))
		return
	}
	for _, u := range users {
		slot, due := reminders.DueSlot(now, u.ReminderEnabled, u.ReminderTime, u.ReminderFrequency, u.ReminderTimezone, 5*time.Minute)
		if !due {
			continue
		}
		payload := map[string]any{"kind": "reading_reminder", "frequency": u.ReminderFrequency, "timezone": u.ReminderTimezone}
		payloadJSON, _ := json.Marshal(payload)
		idempotency := reminders.ReminderIdempotencyKey(u.ID.String(), "in_app", slot)
		_, err = s.deliveries.CreatePending(ctx, &reminderDelivery.ReminderDelivery{
			UserID:         u.ID,
			Channel:        "in_app",
			ScheduledFor:   slot,
			Status:         reminderDelivery.StatusPending,
			NextAttemptAt:  &now,
			IdempotencyKey: idempotency,
			Payload:        payloadJSON,
		})
		if err != nil {
			s.logger.Warn("reminder_schedule_create_failed", zap.Error(err), zap.String("user_id", u.ID.String()))
		}
	}
}

func (s *Service) dispatch(ctx context.Context, now time.Time) {
	items, err := s.deliveries.ListDispatchable(ctx, now, 100)
	if err != nil {
		s.logger.Warn("reminder_dispatch_query_failed", zap.Error(err))
		return
	}
	for _, item := range items {
		_ = s.deliveries.MarkProcessing(ctx, item.ID)
		payload := map[string]any{}
		_ = json.Unmarshal(item.Payload, &payload)
		err := s.sender.SendReminder(ctx, item.UserID.String(), item.ScheduledFor, payload)
		if err == nil {
			_ = s.deliveries.MarkSent(ctx, item.ID, now)
			continue
		}
		attempts := item.Attempts + 1
		if attempts >= s.maxRetries {
			nextAttempt := now.Add(24 * time.Hour)
			_ = s.deliveries.MarkFailed(ctx, item.ID, nextAttempt, truncateError(err))
			continue
		}
		backoff := time.Duration(attempts*attempts) * time.Minute
		nextAttempt := now.Add(backoff)
		_ = s.deliveries.MarkFailed(ctx, item.ID, nextAttempt, truncateError(err))
	}
}

func truncateError(err error) string {
	if err == nil {
		return ""
	}
	msg := strings.TrimSpace(err.Error())
	if msg == "" {
		return "unknown error"
	}
	if len(msg) > 255 {
		return msg[:255]
	}
	return msg
}

var ErrNoSender = errors.New("no reminder sender configured")

func ValidateSender(sender Sender) error {
	if sender == nil {
		return fmt.Errorf("%w", ErrNoSender)
	}
	return nil
}
