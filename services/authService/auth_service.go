package authService

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"libro-backend/models/auth"
	"libro-backend/models/user"
	"libro-backend/pkg/security"
	"libro-backend/repositories"
	"libro-backend/statics/customErr"
)

type Service struct {
	users      repositories.UserRepository
	auth       repositories.AuthRepository
	jwtSecret  string
	accessTTL  time.Duration
	refreshTTL time.Duration
	rateMax    int64
	rateWindow time.Duration
}

func New(users repositories.UserRepository, authRepo repositories.AuthRepository, jwtSecret string, accessTTL, refreshTTL, rateWindow time.Duration, rateMax int64) *Service {
	return &Service{users: users, auth: authRepo, jwtSecret: jwtSecret, accessTTL: accessTTL, refreshTTL: refreshTTL, rateWindow: rateWindow, rateMax: rateMax}
}

func (s *Service) Register(ctx context.Context, name, email, password string) (*user.User, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if name == "" || email == "" || len(password) < 6 {
		return nil, customErr.ErrBadRequest
	}
	_, err := s.users.GetByEmail(ctx, email)
	if err == nil {
		return nil, customErr.ErrConflict
	}
	if err != nil && !errorsIsRecordNotFound(err) {
		return nil, err
	}
	hash, err := security.HashPassword(password)
	if err != nil {
		return nil, err
	}
	u := &user.User{Name: name, Email: email, PasswordHash: hash}
	return u, s.users.Create(ctx, u)
}

func (s *Service) Login(ctx context.Context, ip, email, password string) (*user.User, *auth.TokenPair, error) {
	ok, err := s.auth.CheckRateLimit(ctx, fmt.Sprintf("auth:login:%s", ip), s.rateMax, int64(s.rateWindow.Seconds()))
	if err != nil {
		return nil, nil, err
	}
	if !ok {
		return nil, nil, customErr.ErrRateLimited
	}
	u, err := s.users.GetByEmail(ctx, strings.ToLower(strings.TrimSpace(email)))
	if err != nil || security.ComparePassword(u.PasswordHash, password) != nil {
		return nil, nil, customErr.ErrUnauthorized
	}
	t, err := s.createTokens(ctx, u.ID.String())
	return u, t, err
}

func (s *Service) Refresh(ctx context.Context, refreshToken string) (*auth.TokenPair, error) {
	claims, err := security.ParseToken(s.jwtSecret, refreshToken)
	if err != nil || claims.Type != "refresh" {
		return nil, customErr.ErrUnauthorized
	}
	uid, err := s.auth.GetRefreshTokenUser(ctx, claims.TokenID)
	if err != nil || uid != claims.UserID {
		return nil, customErr.ErrUnauthorized
	}
	_ = s.auth.DeleteRefreshToken(ctx, claims.TokenID)
	return s.createTokens(ctx, claims.UserID)
}

func (s *Service) Logout(ctx context.Context, refreshToken string) {
	claims, err := security.ParseToken(s.jwtSecret, refreshToken)
	if err == nil && claims.Type == "refresh" {
		_ = s.auth.DeleteRefreshToken(ctx, claims.TokenID)
	}
}

func (s *Service) createTokens(ctx context.Context, userID string) (*auth.TokenPair, error) {
	tokenID := uuid.NewString()
	access, err := security.GenerateToken(s.jwtSecret, userID, "", "access", s.accessTTL)
	if err != nil {
		return nil, err
	}
	refresh, err := security.GenerateToken(s.jwtSecret, userID, tokenID, "refresh", s.refreshTTL)
	if err != nil {
		return nil, err
	}
	if err = s.auth.SetRefreshToken(ctx, tokenID, userID, int64(s.refreshTTL.Seconds())); err != nil {
		return nil, err
	}
	return &auth.TokenPair{AccessToken: access, RefreshToken: refresh}, nil
}

func errorsIsRecordNotFound(err error) bool { return err == gorm.ErrRecordNotFound }
