package authService

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"negar-backend/models/user"
	"negar-backend/statics/customErr"
)

type fakeUserRepo struct {
	byEmail  map[string]*user.User
	byMobile map[string]*user.User
	created  []*user.User
}

func (f *fakeUserRepo) Create(_ context.Context, u *user.User) error {
	if f.byEmail == nil {
		f.byEmail = map[string]*user.User{}
	}
	if f.byMobile == nil {
		f.byMobile = map[string]*user.User{}
	}
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	if u.Email != nil {
		f.byEmail[*u.Email] = u
	}
	if u.MobileNumber != nil {
		f.byMobile[*u.MobileNumber] = u
	}
	f.created = append(f.created, u)
	return nil
}

func (f *fakeUserRepo) GetByEmail(_ context.Context, email string) (*user.User, error) {
	u, ok := f.byEmail[email]
	if !ok {
		return nil, gorm.ErrRecordNotFound
	}
	return u, nil
}

func (f *fakeUserRepo) GetByMobile(_ context.Context, mobile string) (*user.User, error) {
	u, ok := f.byMobile[mobile]
	if !ok {
		return nil, gorm.ErrRecordNotFound
	}
	return u, nil
}

func (f *fakeUserRepo) GetByID(_ context.Context, id uuid.UUID) (*user.User, error) {
	for _, u := range f.created {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}
func (f *fakeUserRepo) Update(_ context.Context, _ *user.User) error {
	return errors.New("not implemented")
}
func (f *fakeUserRepo) ListReminderEnabled(_ context.Context) ([]user.User, error) {
	return nil, nil
}

type fakeAuthRepo struct {
	tokens map[string]string
}

func (f *fakeAuthRepo) SetRefreshToken(_ context.Context, tokenID, userID string, _ int64) error {
	if f.tokens == nil {
		f.tokens = map[string]string{}
	}
	f.tokens[tokenID] = userID
	return nil
}

func (f *fakeAuthRepo) GetRefreshTokenUser(_ context.Context, tokenID string) (string, error) {
	uid, ok := f.tokens[tokenID]
	if !ok {
		return "", errors.New("not found")
	}
	return uid, nil
}

func (f *fakeAuthRepo) DeleteRefreshToken(_ context.Context, tokenID string) error {
	delete(f.tokens, tokenID)
	return nil
}

func (f *fakeAuthRepo) DeleteRefreshTokensByUser(_ context.Context, _ string) error { return nil }

func (f *fakeAuthRepo) CheckRateLimit(_ context.Context, _ string, _ int64, _ int64) (bool, int64, error) {
	return true, 2, nil
}

func newAuthServiceForTest(users *fakeUserRepo, auth *fakeAuthRepo) *Service {
	return New(users, auth, "test-secret", time.Minute, time.Hour, time.Minute, 3)
}

func TestRegisterLoginAndRefresh(t *testing.T) {
	t.Parallel()

	users := &fakeUserRepo{byEmail: map[string]*user.User{}, byMobile: map[string]*user.User{}}
	auth := &fakeAuthRepo{tokens: map[string]string{}}
	svc := newAuthServiceForTest(users, auth)

	email := "ADA@Example.com "
	created, err := svc.Register(context.Background(), "Ada", "09123456789", "12345678", email)
	if err != nil {
		t.Fatalf("register failed: %v", err)
	}
	if created.MobileNumber == nil || *created.MobileNumber != "+989123456789" {
		t.Fatalf("expected normalized mobile, got %+v", created.MobileNumber)
	}
	if created.Email == nil || *created.Email != "ada@example.com" {
		t.Fatalf("expected normalized email, got %+v", created.Email)
	}

	loggedInUser, pair, _, err := svc.Login(context.Background(), "127.0.0.1", "+989123456789", "12345678")
	if err != nil {
		t.Fatalf("login failed: %v", err)
	}
	if loggedInUser.ID == uuid.Nil {
		t.Fatal("expected user id to be assigned")
	}
	if pair.AccessToken == "" || pair.RefreshToken == "" {
		t.Fatal("expected access and refresh tokens")
	}

	refreshed, err := svc.Refresh(context.Background(), pair.RefreshToken)
	if err != nil {
		t.Fatalf("refresh failed: %v", err)
	}
	if refreshed.AccessToken == "" || refreshed.RefreshToken == "" {
		t.Fatal("expected new token pair")
	}
}

func TestRegisterRejectsInvalidInput(t *testing.T) {
	t.Parallel()

	svc := newAuthServiceForTest(&fakeUserRepo{byEmail: map[string]*user.User{}, byMobile: map[string]*user.User{}}, &fakeAuthRepo{})
	_, err := svc.Register(context.Background(), "", "", "", "")
	if !errors.Is(err, customErr.ErrBadRequest) {
		t.Fatalf("expected bad request error, got %v", err)
	}
}

func TestRegisterDuplicateMobileReturnsConflict(t *testing.T) {
	t.Parallel()

	users := &fakeUserRepo{
		byEmail: map[string]*user.User{
			"ada@example.com": {
				ID:           uuid.New(),
				Name:         "Ada",
				Email:        stringPtr("ada@example.com"),
				MobileNumber: stringPtr("+989123456789"),
				PasswordHash: "hashed",
			},
		},
		byMobile: map[string]*user.User{
			"+989123456789": {
				ID:           uuid.New(),
				Name:         "Ada",
				Email:        stringPtr("ada@example.com"),
				MobileNumber: stringPtr("+989123456789"),
				PasswordHash: "hashed",
			},
		},
	}
	svc := newAuthServiceForTest(users, &fakeAuthRepo{})
	_, err := svc.Register(context.Background(), "Ada", "09123456789", "12345678", "")
	if !errors.Is(err, customErr.ErrMobileAlreadyExists) {
		t.Fatalf("expected mobile exists error, got %v", err)
	}
}

func TestRegisterDuplicateEmailReturnsConflict(t *testing.T) {
	t.Parallel()

	users := &fakeUserRepo{
		byEmail: map[string]*user.User{
			"ada@example.com": {
				ID:           uuid.New(),
				Name:         "Ada",
				Email:        stringPtr("ada@example.com"),
				MobileNumber: stringPtr("+989122222222"),
				PasswordHash: "hashed",
			},
		},
		byMobile: map[string]*user.User{},
	}
	svc := newAuthServiceForTest(users, &fakeAuthRepo{})
	_, err := svc.Register(context.Background(), "Ada", "09123456789", "12345678", "ada@example.com")
	if !errors.Is(err, customErr.ErrEmailAlreadyExists) {
		t.Fatalf("expected email exists error, got %v", err)
	}
}

func TestLoginInvalidCredentials(t *testing.T) {
	t.Parallel()

	mobile := "+989123456789"
	users := &fakeUserRepo{
		byEmail: map[string]*user.User{},
		byMobile: map[string]*user.User{
			mobile: {
				ID:           uuid.New(),
				Name:         "Ada",
				MobileNumber: &mobile,
				PasswordHash: "$2a$10$invalid",
			},
		},
	}
	auth := &fakeAuthRepo{}
	svc := newAuthServiceForTest(users, auth)
	_, _, _, err := svc.Login(context.Background(), "127.0.0.1", "09123456789", "654321")
	if !errors.Is(err, customErr.ErrInvalidCredentials) {
		t.Fatalf("expected invalid credentials error, got %v", err)
	}
}

func TestLoginWithEmailIdentifierFails(t *testing.T) {
	t.Parallel()

	users := &fakeUserRepo{byEmail: map[string]*user.User{}, byMobile: map[string]*user.User{}}
	auth := &fakeAuthRepo{}
	svc := newAuthServiceForTest(users, auth)
	_, _, _, err := svc.Login(context.Background(), "127.0.0.1", "ada@example.com", "12345678")
	if !errors.Is(err, customErr.ErrInvalidCredentials) {
		t.Fatalf("expected invalid credentials for email login, got %v", err)
	}
}

func TestRefreshInvalidToken(t *testing.T) {
	t.Parallel()

	svc := newAuthServiceForTest(&fakeUserRepo{byEmail: map[string]*user.User{}, byMobile: map[string]*user.User{}}, &fakeAuthRepo{})
	_, err := svc.Refresh(context.Background(), "not-a-jwt")
	if !errors.Is(err, customErr.ErrInvalidRefreshToken) {
		t.Fatalf("expected invalid refresh token error, got %v", err)
	}
}

func stringPtr(value string) *string { return &value }
