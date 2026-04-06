package authService

import (
	"context"

	"github.com/google/uuid"
	"libro-backend/models/user"
	"libro-backend/pkg/security"
	"libro-backend/repositories"
	"libro-backend/statics/customErr"
)

type UserService struct{ repo repositories.UserRepository }

func NewUserService(repo repositories.UserRepository) *UserService { return &UserService{repo: repo} }
func (s *UserService) Get(ctx context.Context, userID uuid.UUID) (*user.User, error) {
	return s.repo.GetByID(ctx, userID)
}
func (s *UserService) UpdateName(ctx context.Context, userID uuid.UUID, name string) (*user.User, error) {
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
	if len(newPassword) < 6 {
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
