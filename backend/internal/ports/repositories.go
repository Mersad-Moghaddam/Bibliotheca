package ports

import (
	"context"

	"github.com/google/uuid"
	"libro-backend/internal/domain"
)

type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) error
}

type BookFilter struct {
	Search string
	Status string
}

type BookRepository interface {
	List(ctx context.Context, userID uuid.UUID, filter BookFilter) ([]domain.Book, error)
	Create(ctx context.Context, book *domain.Book) error
	GetByID(ctx context.Context, userID, bookID uuid.UUID) (*domain.Book, error)
	Update(ctx context.Context, book *domain.Book) error
	Delete(ctx context.Context, userID, bookID uuid.UUID) error
	SummaryCounts(ctx context.Context, userID uuid.UUID) (map[string]int64, error)
	Recent(ctx context.Context, userID uuid.UUID, limit int) ([]domain.Book, error)
}

type WishlistRepository interface {
	List(ctx context.Context, userID uuid.UUID) ([]domain.WishlistItem, error)
	Create(ctx context.Context, item *domain.WishlistItem) error
	GetByID(ctx context.Context, userID, id uuid.UUID) (*domain.WishlistItem, error)
	Update(ctx context.Context, item *domain.WishlistItem) error
	Delete(ctx context.Context, userID, id uuid.UUID) error
	CreateLink(ctx context.Context, link *domain.PurchaseLink) error
	UpdateLink(ctx context.Context, userID, wishlistID, linkID uuid.UUID, label, url string) (*domain.PurchaseLink, error)
	DeleteLink(ctx context.Context, userID, wishlistID, linkID uuid.UUID) error
}

type SessionStore interface {
	SetRefreshToken(ctx context.Context, tokenID, userID string, ttlSeconds int64) error
	GetRefreshTokenUser(ctx context.Context, tokenID string) (string, error)
	DeleteRefreshToken(ctx context.Context, tokenID string) error
	CheckRateLimit(ctx context.Context, key string, max int64, windowSeconds int64) (bool, error)
}
