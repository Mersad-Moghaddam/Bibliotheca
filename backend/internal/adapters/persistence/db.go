package persistence

import (
	"bibliotheca/backend/internal/domain"
	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(&domain.User{}, &domain.Book{}, &domain.WishlistItem{}, &domain.PurchaseLink{})
}
