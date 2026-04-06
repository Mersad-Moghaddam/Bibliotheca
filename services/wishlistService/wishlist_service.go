package wishlistService

import (
	"context"

	"github.com/google/uuid"
	"libro-backend/models/purchaseLink"
	"libro-backend/models/wishlist"
	"libro-backend/repositories"
	"libro-backend/statics/customErr"
)

type Service struct {
	wishlist repositories.WishlistRepository
	links    repositories.PurchaseLinkRepository
}

func New(wishlistRepo repositories.WishlistRepository, linkRepo repositories.PurchaseLinkRepository) *Service {
	return &Service{wishlist: wishlistRepo, links: linkRepo}
}

func (s *Service) List(ctx context.Context, userID uuid.UUID) ([]wishlist.Wishlist, error) {
	return s.wishlist.List(ctx, userID)
}
func (s *Service) Create(ctx context.Context, w *wishlist.Wishlist) error {
	if w.Title == "" || w.Author == "" {
		return customErr.ErrBadRequest
	}
	return s.wishlist.Create(ctx, w)
}
func (s *Service) Get(ctx context.Context, userID, id uuid.UUID) (*wishlist.Wishlist, error) {
	return s.wishlist.GetByID(ctx, userID, id)
}
func (s *Service) Update(ctx context.Context, w *wishlist.Wishlist) error {
	if w.Title == "" || w.Author == "" {
		return customErr.ErrBadRequest
	}
	return s.wishlist.Update(ctx, w)
}
func (s *Service) Delete(ctx context.Context, userID, id uuid.UUID) error {
	return s.wishlist.Delete(ctx, userID, id)
}
func (s *Service) AddLink(ctx context.Context, link *purchaseLink.PurchaseLink) error {
	if link.Label == "" || link.URL == "" {
		return customErr.ErrBadRequest
	}
	return s.links.Create(ctx, link)
}
func (s *Service) UpdateLink(ctx context.Context, userID, wishlistID, linkID uuid.UUID, label, url string) (*purchaseLink.PurchaseLink, error) {
	if label == "" || url == "" {
		return nil, customErr.ErrBadRequest
	}
	return s.links.Update(ctx, userID, wishlistID, linkID, label, url)
}
func (s *Service) DeleteLink(ctx context.Context, userID, wishlistID, linkID uuid.UUID) error {
	return s.links.Delete(ctx, userID, wishlistID, linkID)
}
