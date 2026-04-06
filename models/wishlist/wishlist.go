package wishlist

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"libro-backend/models/purchaseLink"
)

type Wishlist struct {
	ID            uuid.UUID                   `gorm:"type:char(36);primaryKey" json:"id"`
	UserID        uuid.UUID                   `gorm:"type:char(36);index;not null" json:"userId"`
	Title         string                      `gorm:"size:200;not null" json:"title"`
	Author        string                      `gorm:"size:200;not null" json:"author"`
	ExpectedPrice *float64                    `json:"expectedPrice"`
	Notes         *string                     `gorm:"type:text" json:"notes"`
	PurchaseLinks []purchaseLink.PurchaseLink `gorm:"foreignKey:WishlistID;constraint:OnDelete:CASCADE" json:"purchaseLinks"`
	CreatedAt     time.Time                   `json:"createdAt"`
	UpdatedAt     time.Time                   `json:"updatedAt"`
}

func (w *Wishlist) BeforeCreate(tx *gorm.DB) error {
	if w.ID == uuid.Nil {
		w.ID = uuid.New()
	}
	return nil
}
