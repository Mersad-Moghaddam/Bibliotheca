package application

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"libro-backend/internal/domain"
	"libro-backend/internal/ports"
	"libro-backend/pkg/apperror"
	"libro-backend/pkg/utils"
)

type AuthService struct {
	users      ports.UserRepository
	sessions   ports.SessionStore
	jwtSecret  string
	accessTTL  time.Duration
	refreshTTL time.Duration
	rateMax    int64
	rateWindow time.Duration
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func NewAuthService(users ports.UserRepository, sessions ports.SessionStore, jwtSecret string, accessTTL, refreshTTL, rateWindow time.Duration, rateMax int64) *AuthService {
	return &AuthService{users: users, sessions: sessions, jwtSecret: jwtSecret, accessTTL: accessTTL, refreshTTL: refreshTTL, rateMax: rateMax, rateWindow: rateWindow}
}

func (s *AuthService) Register(ctx context.Context, name, email, password string) (*domain.User, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if name == "" || email == "" || len(password) < 6 {
		return nil, apperror.ErrBadRequest
	}
	_, err := s.users.GetByEmail(ctx, email)
	if err == nil {
		return nil, apperror.ErrConflict
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	hash, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}
	user := &domain.User{Name: name, Email: email, PasswordHash: hash}
	if err = s.users.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) Login(ctx context.Context, ip, email, password string) (*domain.User, *TokenPair, error) {
	ok, err := s.sessions.CheckRateLimit(ctx, fmt.Sprintf("auth:login:%s", ip), s.rateMax, int64(s.rateWindow.Seconds()))
	if err != nil {
		return nil, nil, err
	}
	if !ok {
		return nil, nil, apperror.ErrRateLimited
	}
	user, err := s.users.GetByEmail(ctx, strings.ToLower(strings.TrimSpace(email)))
	if err != nil || utils.ComparePassword(user.PasswordHash, password) != nil {
		return nil, nil, apperror.ErrUnauthorized
	}
	tp, err := s.createTokens(ctx, user.ID.String())
	if err != nil {
		return nil, nil, err
	}
	return user, tp, nil
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*TokenPair, error) {
	claims, err := utils.ParseToken(s.jwtSecret, refreshToken)
	if err != nil || claims.Type != "refresh" {
		return nil, apperror.ErrUnauthorized
	}
	uid, err := s.sessions.GetRefreshTokenUser(ctx, claims.TokenID)
	if err != nil || uid != claims.UserID {
		return nil, apperror.ErrUnauthorized
	}
	_ = s.sessions.DeleteRefreshToken(ctx, claims.TokenID)
	return s.createTokens(ctx, claims.UserID)
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) {
	claims, err := utils.ParseToken(s.jwtSecret, refreshToken)
	if err == nil && claims.Type == "refresh" {
		_ = s.sessions.DeleteRefreshToken(ctx, claims.TokenID)
	}
}

func (s *AuthService) createTokens(ctx context.Context, userID string) (*TokenPair, error) {
	tokenID := uuid.NewString()
	access, err := utils.GenerateToken(s.jwtSecret, userID, "", "access", s.accessTTL)
	if err != nil {
		return nil, err
	}
	refresh, err := utils.GenerateToken(s.jwtSecret, userID, tokenID, "refresh", s.refreshTTL)
	if err != nil {
		return nil, err
	}
	if err = s.sessions.SetRefreshToken(ctx, tokenID, userID, int64(s.refreshTTL.Seconds())); err != nil {
		return nil, err
	}
	return &TokenPair{AccessToken: access, RefreshToken: refresh}, nil
}
