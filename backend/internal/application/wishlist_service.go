package application

import (
	"context"

	"bibliotheca/backend/internal/domain"
	"bibliotheca/backend/internal/ports"
	"bibliotheca/backend/pkg/apperror"
	"github.com/google/uuid"
)

type WishlistService struct{ repo ports.WishlistRepository }

func NewWishlistService(repo ports.WishlistRepository) *WishlistService {
	return &WishlistService{repo: repo}
}

func (s *WishlistService) List(ctx context.Context, userID uuid.UUID) ([]domain.WishlistItem, error) {
	return s.repo.List(ctx, userID)
}
func (s *WishlistService) Create(ctx context.Context, item *domain.WishlistItem) error {
	if item.Title == "" || item.Author == "" {
		return apperror.ErrBadRequest
	}
	return s.repo.Create(ctx, item)
}
func (s *WishlistService) Get(ctx context.Context, userID, id uuid.UUID) (*domain.WishlistItem, error) {
	return s.repo.GetByID(ctx, userID, id)
}
func (s *WishlistService) Update(ctx context.Context, item *domain.WishlistItem) error {
	if item.Title == "" || item.Author == "" {
		return apperror.ErrBadRequest
	}
	return s.repo.Update(ctx, item)
}
func (s *WishlistService) Delete(ctx context.Context, userID, id uuid.UUID) error {
	return s.repo.Delete(ctx, userID, id)
}
func (s *WishlistService) AddLink(ctx context.Context, link *domain.PurchaseLink) error {
	if link.Label == "" || link.URL == "" {
		return apperror.ErrBadRequest
	}
	return s.repo.CreateLink(ctx, link)
}
func (s *WishlistService) UpdateLink(ctx context.Context, userID, wishlistID, linkID uuid.UUID, label, url string) (*domain.PurchaseLink, error) {
	if label == "" || url == "" {
		return nil, apperror.ErrBadRequest
	}
	return s.repo.UpdateLink(ctx, userID, wishlistID, linkID, label, url)
}
func (s *WishlistService) DeleteLink(ctx context.Context, userID, wishlistID, linkID uuid.UUID) error {
	return s.repo.DeleteLink(ctx, userID, wishlistID, linkID)
}
