package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"libro-backend/models/wishlist"
	"libro-backend/statics/customErr"
)

type wishlistRepo struct{ db *gorm.DB }

func NewWishlistRepo(db *gorm.DB) WishlistRepository { return &wishlistRepo{db: db} }

func (r *wishlistRepo) List(ctx context.Context, userID uuid.UUID) ([]wishlist.Wishlist, error) {
	var items []wishlist.Wishlist
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Preload("PurchaseLinks").Order("updated_at DESC").Find(&items).Error
	return items, err
}
func (r *wishlistRepo) Create(ctx context.Context, w *wishlist.Wishlist) error {
	return r.db.WithContext(ctx).Create(w).Error
}
func (r *wishlistRepo) GetByID(ctx context.Context, userID, id uuid.UUID) (*wishlist.Wishlist, error) {
	var w wishlist.Wishlist
	err := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", id, userID).Preload("PurchaseLinks").First(&w).Error
	if err != nil {
		return nil, err
	}
	return &w, nil
}
func (r *wishlistRepo) Update(ctx context.Context, w *wishlist.Wishlist) error {
	return r.db.WithContext(ctx).Save(w).Error
}
func (r *wishlistRepo) Delete(ctx context.Context, userID, id uuid.UUID) error {
	res := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", id, userID).Delete(&wishlist.Wishlist{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return customErr.ErrNotFound
	}
	return nil
}
