package repositories

import (
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
	"negar-backend/repositories/initRepositories"
)

type InitialRepositories struct {
	Auth         AuthRepository
	User         UserRepository
	Book         BookRepository
	Wishlist     WishlistRepository
	PurchaseLink PurchaseLinkRepository
	Reading      ReadingProgressRepository
	db           *gorm.DB
	redis        *redis.Client
}

func NewInitialRepositories(deps *initRepositories.Dependencies) *InitialRepositories {
	userRepo := NewUserRepo(deps.DB)
	bookRepo := NewBookRepo(deps.DB)
	wishlistRepo := NewWishlistRepo(deps.DB)
	purchaseRepo := NewPurchaseLinkRepo(deps.DB, wishlistRepo)

	return &InitialRepositories{
		Auth:         NewAuthRepo(deps.Redis),
		User:         userRepo,
		Book:         bookRepo,
		Wishlist:     wishlistRepo,
		PurchaseLink: purchaseRepo,
		Reading:      NewReadingProgressRepo(deps.DB, bookRepo),
		db:           deps.DB,
		redis:        deps.Redis,
	}
}

func (ir *InitialRepositories) DB() *gorm.DB {
	return ir.db
}

func (ir *InitialRepositories) Redis() *redis.Client {
	return ir.redis
}
