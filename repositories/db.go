package repositories

import (
	"gorm.io/gorm"
	"libro-backend/models/book"
	"libro-backend/models/purchaseLink"
	"libro-backend/models/user"
	"libro-backend/models/wishlist"
)

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(&user.User{}, &book.Book{}, &wishlist.Wishlist{}, &purchaseLink.PurchaseLink{})
}
