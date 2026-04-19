package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"negar-backend/models/reminderDelivery"
)

type reminderDeliveryRepo struct{ db *gorm.DB }

func NewReminderDeliveryRepo(db *gorm.DB) ReminderDeliveryRepository {
	return &reminderDeliveryRepo{db: db}
}

func (r *reminderDeliveryRepo) CreatePending(ctx context.Context, delivery *reminderDelivery.ReminderDelivery) (bool, error) {
	res := r.db.WithContext(ctx).Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "idempotency_key"}}, DoNothing: true}).Create(delivery)
	return res.RowsAffected > 0, res.Error
}

func (r *reminderDeliveryRepo) ListDispatchable(ctx context.Context, now time.Time, limit int) ([]reminderDelivery.ReminderDelivery, error) {
	if limit <= 0 {
		limit = 100
	}
	var rows []reminderDelivery.ReminderDelivery
	err := r.db.WithContext(ctx).
		Where("(status = ? AND (next_attempt_at IS NULL OR next_attempt_at <= ?)) OR (status = ? AND next_attempt_at <= ?)", reminderDelivery.StatusPending, now, reminderDelivery.StatusFailed, now).
		Order("scheduled_for asc").
		Limit(limit).
		Find(&rows).Error
	return rows, err
}

func (r *reminderDeliveryRepo) MarkProcessing(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Model(&reminderDelivery.ReminderDelivery{}).
		Where("id = ?", id).
		Updates(map[string]any{"status": reminderDelivery.StatusProcessing, "updated_at": time.Now()}).Error
}

func (r *reminderDeliveryRepo) MarkSent(ctx context.Context, id uuid.UUID, sentAt time.Time) error {
	return r.db.WithContext(ctx).Model(&reminderDelivery.ReminderDelivery{}).
		Where("id = ?", id).
		Updates(map[string]any{"status": reminderDelivery.StatusSent, "sent_at": sentAt, "last_error": nil, "next_attempt_at": nil, "updated_at": time.Now()}).Error
}

func (r *reminderDeliveryRepo) MarkFailed(ctx context.Context, id uuid.UUID, nextAttempt time.Time, lastErr string) error {
	return r.db.WithContext(ctx).Model(&reminderDelivery.ReminderDelivery{}).
		Where("id = ?", id).
		Updates(map[string]any{"status": reminderDelivery.StatusFailed, "last_error": lastErr, "next_attempt_at": nextAttempt, "updated_at": time.Now(), "attempts": gorm.Expr("attempts + 1")}).Error
}
