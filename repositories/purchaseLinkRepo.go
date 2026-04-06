package repositories

import (
	"context"
	"net/url"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"libro-backend/models/purchaseLink"
)

type purchaseLinkRepo struct {
	db       *gorm.DB
	wishlist WishlistRepository
}

func NewPurchaseLinkRepo(db *gorm.DB, wishlist WishlistRepository) PurchaseLinkRepository {
	return &purchaseLinkRepo{db: db, wishlist: wishlist}
}

func (r *purchaseLinkRepo) Create(ctx context.Context, link *purchaseLink.PurchaseLink) error {
	if link.Alias == "" {
		link.Alias = extractAlias(link.URL)
	}
	return r.db.WithContext(ctx).Create(link).Error
}
func (r *purchaseLinkRepo) Update(ctx context.Context, userID, wishlistID, linkID uuid.UUID, label, rawURL string) (*purchaseLink.PurchaseLink, error) {
	if _, err := r.wishlist.GetByID(ctx, userID, wishlistID); err != nil {
		return nil, err
	}
	var l purchaseLink.PurchaseLink
	if err := r.db.WithContext(ctx).Where("id = ? AND wishlist_id = ?", linkID, wishlistID).First(&l).Error; err != nil {
		return nil, err
	}
	l.Label = label
	l.URL = rawURL
	l.Alias = extractAlias(rawURL)
	return &l, r.db.WithContext(ctx).Save(&l).Error
}
func (r *purchaseLinkRepo) Delete(ctx context.Context, userID, wishlistID, linkID uuid.UUID) error {
	if _, err := r.wishlist.GetByID(ctx, userID, wishlistID); err != nil {
		return err
	}
	return r.db.WithContext(ctx).Where("id = ? AND wishlist_id = ?", linkID, wishlistID).Delete(&purchaseLink.PurchaseLink{}).Error
}

func extractAlias(raw string) string {
	u, err := url.Parse(raw)
	if err != nil || u.Host == "" {
		return "website"
	}
	host := strings.TrimPrefix(strings.TrimPrefix(strings.ToLower(u.Host), "www."), "m.")
	parts := strings.Split(host, ".")
	if len(parts) > 0 && parts[0] != "" {
		return parts[0]
	}
	return "website"
}
