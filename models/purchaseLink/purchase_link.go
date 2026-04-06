package purchaseLink

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PurchaseLink struct {
	ID         uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	WishlistID uuid.UUID `gorm:"type:char(36);index;not null" json:"wishlistId"`
	Label      string    `gorm:"size:120;not null" json:"label"`
	URL        string    `gorm:"size:500;not null" json:"url"`
	Alias      string    `gorm:"size:120;not null" json:"alias"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

func (p *PurchaseLink) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
