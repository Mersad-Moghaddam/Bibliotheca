package authService

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"negar-backend/models/auth"
	"negar-backend/models/user"
	"negar-backend/pkg/security"
	"negar-backend/pkg/validation"
	"negar-backend/repositories"
	"negar-backend/statics/customErr"
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
	name = strings.TrimSpace(name)
	email = strings.TrimSpace(strings.ToLower(email))
	if name == "" || email == "" || len(password) < validation.MinPasswordLength || len(password) > validation.MaxPasswordLength {
		return nil, customErr.ErrBadRequest
	}
	_, err := s.users.GetByEmail(ctx, email)
	if err == nil {
		return nil, customErr.ErrEmailAlreadyExists
	}
	if err != nil && !errorsIsRecordNotFound(err) {
		return nil, err
	}
	hash, err := security.HashPassword(password)
	if err != nil {
		return nil, err
	}
	u := &user.User{Name: name, Email: email, PasswordHash: hash}
	if err = s.users.Create(ctx, u); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return nil, customErr.ErrEmailAlreadyExists
		}
		if isMySQLDuplicateEntry(err) {
			return nil, customErr.ErrEmailAlreadyExists
		}
		return nil, err
	}
	return u, nil
}

func (s *Service) Login(ctx context.Context, ip, email, password string) (*user.User, *auth.TokenPair, int64, error) {
	ok, remaining, err := s.auth.CheckRateLimit(ctx, fmt.Sprintf("auth:login:%s", ip), s.rateMax, int64(s.rateWindow.Seconds()))
	if err != nil {
		return nil, nil, 0, err
	}
	if !ok {
		return nil, nil, 0, customErr.ErrRateLimited
	}
	u, err := s.users.GetByEmail(ctx, strings.ToLower(strings.TrimSpace(email)))
	if err != nil || security.ComparePassword(u.PasswordHash, password) != nil {
		return nil, nil, remaining, customErr.ErrInvalidCredentials
	}
	if err = s.auth.DeleteRefreshTokensByUser(ctx, u.ID.String()); err != nil {
		return nil, nil, remaining, err
	}
	t, err := s.createTokens(ctx, u.ID.String(), u.Role)
	return u, t, remaining, err
}

func (s *Service) Refresh(ctx context.Context, refreshToken string) (*auth.TokenPair, error) {
	claims, err := security.ParseToken(s.jwtSecret, refreshToken)
	if err != nil || claims.Type != "refresh" {
		return nil, customErr.ErrInvalidRefreshToken
	}
	uid, err := s.auth.GetRefreshTokenUser(ctx, claims.TokenID)
	if err != nil || uid != claims.UserID {
		return nil, customErr.ErrInvalidRefreshToken
	}
	_ = s.auth.DeleteRefreshToken(ctx, claims.TokenID)
	u, userErr := s.users.GetByID(ctx, uuid.MustParse(claims.UserID))
	if userErr != nil {
		return nil, customErr.ErrInvalidRefreshToken
	}
	return s.createTokens(ctx, claims.UserID, u.Role)
}

func (s *Service) Logout(ctx context.Context, refreshToken string) {
	claims, err := security.ParseToken(s.jwtSecret, refreshToken)
	if err == nil && claims.Type == "refresh" {
		_ = s.auth.DeleteRefreshToken(ctx, claims.TokenID)
	}
}

func (s *Service) createTokens(ctx context.Context, userID, role string) (*auth.TokenPair, error) {
	tokenID := uuid.NewString()
	access, err := security.GenerateToken(s.jwtSecret, userID, role, "", "access", s.accessTTL)
	if err != nil {
		return nil, err
	}
	refresh, err := security.GenerateToken(s.jwtSecret, userID, role, tokenID, "refresh", s.refreshTTL)
	if err != nil {
		return nil, err
	}
	if err = s.auth.SetRefreshToken(ctx, tokenID, userID, int64(s.refreshTTL.Seconds())); err != nil {
		return nil, err
	}
	return &auth.TokenPair{AccessToken: access, RefreshToken: refresh}, nil
}

func errorsIsRecordNotFound(err error) bool { return err == gorm.ErrRecordNotFound }

func isMySQLDuplicateEntry(err error) bool {
	return strings.Contains(strings.ToLower(err.Error()), "duplicate entry")
}
