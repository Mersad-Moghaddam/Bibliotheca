package repositories

import (
	"context"

	"github.com/google/uuid"
	"libro-backend/models/book"
	"libro-backend/models/purchaseLink"
	"libro-backend/models/user"
	"libro-backend/models/wishlist"
)

type BookFilter struct {
	Search string
	Status string
}

type AuthRepository interface {
	SetRefreshToken(ctx context.Context, tokenID, userID string, ttlSeconds int64) error
	GetRefreshTokenUser(ctx context.Context, tokenID string) (string, error)
	DeleteRefreshToken(ctx context.Context, tokenID string) error
	CheckRateLimit(ctx context.Context, key string, max int64, windowSeconds int64) (bool, error)
}

type UserRepository interface {
	Create(ctx context.Context, u *user.User) error
	GetByEmail(ctx context.Context, email string) (*user.User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*user.User, error)
	Update(ctx context.Context, u *user.User) error
}

type BookRepository interface {
	List(ctx context.Context, userID uuid.UUID, filter BookFilter) ([]book.Book, error)
	Create(ctx context.Context, b *book.Book) error
	GetByID(ctx context.Context, userID, bookID uuid.UUID) (*book.Book, error)
	Update(ctx context.Context, b *book.Book) error
	Delete(ctx context.Context, userID, bookID uuid.UUID) error
	SummaryCounts(ctx context.Context, userID uuid.UUID) (map[string]int64, error)
	Recent(ctx context.Context, userID uuid.UUID, limit int) ([]book.Book, error)
}

type WishlistRepository interface {
	List(ctx context.Context, userID uuid.UUID) ([]wishlist.Wishlist, error)
	Create(ctx context.Context, w *wishlist.Wishlist) error
	GetByID(ctx context.Context, userID, id uuid.UUID) (*wishlist.Wishlist, error)
	Update(ctx context.Context, w *wishlist.Wishlist) error
	Delete(ctx context.Context, userID, id uuid.UUID) error
}

type PurchaseLinkRepository interface {
	Create(ctx context.Context, link *purchaseLink.PurchaseLink) error
	Update(ctx context.Context, userID, wishlistID, linkID uuid.UUID, label, url string) (*purchaseLink.PurchaseLink, error)
	Delete(ctx context.Context, userID, wishlistID, linkID uuid.UUID) error
}

type ReadingProgressRepository interface {
	UpdateCurrentPage(ctx context.Context, userID, bookID uuid.UUID, currentPage int) (*book.Book, error)
}
