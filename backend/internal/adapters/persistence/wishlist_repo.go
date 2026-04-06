package persistence

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"libro-backend/internal/domain"
	"libro-backend/pkg/apperror"
)

type WishlistRepository struct{ db *gorm.DB }

func NewWishlistRepository(db *gorm.DB) *WishlistRepository { return &WishlistRepository{db: db} }

func (r *WishlistRepository) List(ctx context.Context, userID uuid.UUID) ([]domain.WishlistItem, error) {
	var items []domain.WishlistItem
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Preload("PurchaseLinks").Order("updated_at DESC").Find(&items).Error
	return items, err
}
func (r *WishlistRepository) Create(ctx context.Context, item *domain.WishlistItem) error {
	return r.db.WithContext(ctx).Create(item).Error
}
func (r *WishlistRepository) GetByID(ctx context.Context, userID, id uuid.UUID) (*domain.WishlistItem, error) {
	var item domain.WishlistItem
	err := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", id, userID).Preload("PurchaseLinks").First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}
func (r *WishlistRepository) Update(ctx context.Context, item *domain.WishlistItem) error {
	return r.db.WithContext(ctx).Save(item).Error
}
func (r *WishlistRepository) Delete(ctx context.Context, userID, id uuid.UUID) error {
	res := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", id, userID).Delete(&domain.WishlistItem{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return apperror.ErrNotFound
	}
	return nil
}
func (r *WishlistRepository) CreateLink(ctx context.Context, link *domain.PurchaseLink) error {
	return r.db.WithContext(ctx).Create(link).Error
}
func (r *WishlistRepository) UpdateLink(ctx context.Context, userID, wishlistID, linkID uuid.UUID, label, url string) (*domain.PurchaseLink, error) {
	if _, err := r.GetByID(ctx, userID, wishlistID); err != nil {
		return nil, err
	}
	var l domain.PurchaseLink
	if err := r.db.WithContext(ctx).Where("id = ? AND wishlist_item_id = ?", linkID, wishlistID).First(&l).Error; err != nil {
		return nil, err
	}
	l.Label, l.URL = label, url
	return &l, r.db.WithContext(ctx).Save(&l).Error
}
func (r *WishlistRepository) DeleteLink(ctx context.Context, userID, wishlistID, linkID uuid.UUID) error {
	if _, err := r.GetByID(ctx, userID, wishlistID); err != nil {
		return err
	}
	res := r.db.WithContext(ctx).Where("id = ? AND wishlist_item_id = ?", linkID, wishlistID).Delete(&domain.PurchaseLink{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return apperror.ErrNotFound
	}
	return nil
}
