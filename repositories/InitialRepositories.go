package repositories

import "libro-backend/repositories/initRepositories"

type InitialRepositories struct {
	Auth         AuthRepository
	User         UserRepository
	Book         BookRepository
	Wishlist     WishlistRepository
	PurchaseLink PurchaseLinkRepository
	Reading      ReadingProgressRepository
	Limiter      RequestLimiterRepository
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
		Reading:      NewReadingProgressRepo(bookRepo),
		Limiter:      NewRequestLimiterRepo(),
	}
}
