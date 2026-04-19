package authService

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"negar-backend/models/user"
	"negar-backend/pkg/reminders"
	"negar-backend/pkg/security"
	"negar-backend/pkg/validation"
	"negar-backend/repositories"
	"negar-backend/statics/customErr"
)

type UserService struct{ repo repositories.UserRepository }

func NewUserService(repo repositories.UserRepository) *UserService { return &UserService{repo: repo} }
func (s *UserService) Get(ctx context.Context, userID uuid.UUID) (*user.User, error) {
	return s.repo.GetByID(ctx, userID)
}
func (s *UserService) UpdateName(ctx context.Context, userID uuid.UUID, name string) (*user.User, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, customErr.ErrBadRequest
	}
	u, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	u.Name = name
	return u, s.repo.Update(ctx, u)
}
func (s *UserService) UpdatePassword(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error {
	if len(newPassword) < validation.MinPasswordLength || len(newPassword) > validation.MaxPasswordLength {
		return customErr.ErrBadRequest
	}
	u, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	if security.ComparePassword(u.PasswordHash, currentPassword) != nil {
		return customErr.ErrUnauthorized
	}
	h, err := security.HashPassword(newPassword)
	if err != nil {
		return err
	}
	u.PasswordHash = h
	return s.repo.Update(ctx, u)
}

func (s *UserService) UpdateReminderSettings(ctx context.Context, userID uuid.UUID, enabled bool, reminderTime, frequency string) (*user.User, error) {
	reminderTime, frequency, ok := reminders.NormalizeAndValidateSettings(reminderTime, frequency)
	if !ok {
		return nil, customErr.ErrBadRequest
	}
	u, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	u.ReminderEnabled = enabled
	u.ReminderTime = reminderTime
	u.ReminderFrequency = frequency
	return u, s.repo.Update(ctx, u)
}
