package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"negar-backend/models/wishlist"
	"negar-backend/statics/customErr"
)

type wishlistRepo struct{ db *gorm.DB }

func NewWishlistRepo(db *gorm.DB) WishlistRepository { return &wishlistRepo{db: db} }

func (r *wishlistRepo) List(ctx context.Context, userID uuid.UUID, filter WishlistFilter) ([]wishlist.Wishlist, int64, error) {
	q := r.db.WithContext(ctx).Model(&wishlist.Wishlist{}).Where("user_id = ?", userID)
	if filter.Search != "" {
		q = q.Where("title LIKE ? OR author LIKE ?", "%"+filter.Search+"%", "%"+filter.Search+"%")
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	orderBy := "updated_at"
	if filter.SortBy != "" {
		orderBy = filter.SortBy
	}
	order := "DESC"
	if filter.Order != "" {
		order = filter.Order
	}
	query := q.Preload("PurchaseLinks").Order(fmt.Sprintf("%s %s", orderBy, order))
	if filter.Limit > 0 {
		query = query.Offset((filter.Page - 1) * filter.Limit).Limit(filter.Limit)
	}
	var items []wishlist.Wishlist
	err := query.Find(&items).Error
	return items, total, err
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
