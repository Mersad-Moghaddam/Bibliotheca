package application

import (
	"context"

	"github.com/google/uuid"
	"libro-backend/internal/domain"
	"libro-backend/internal/ports"
	"libro-backend/pkg/apperror"
	"libro-backend/pkg/utils"
)

type UserService struct{ repo ports.UserRepository }

func NewUserService(repo ports.UserRepository) *UserService { return &UserService{repo: repo} }
func (s *UserService) Get(ctx context.Context, userID uuid.UUID) (*domain.User, error) {
	return s.repo.GetByID(ctx, userID)
}
func (s *UserService) UpdateName(ctx context.Context, userID uuid.UUID, name string) (*domain.User, error) {
	if name == "" {
		return nil, apperror.ErrBadRequest
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
		return apperror.ErrBadRequest
	}
	u, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	if utils.ComparePassword(u.PasswordHash, currentPassword) != nil {
		return apperror.ErrUnauthorized
	}
	h, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}
	u.PasswordHash = h
	return s.repo.Update(ctx, u)
}
