package persistence

import (
	"gorm.io/gorm"
	"libro-backend/internal/domain"
)

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(&domain.User{}, &domain.Book{}, &domain.WishlistItem{}, &domain.PurchaseLink{})
}
