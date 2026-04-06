package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BookStatus string

const (
	BookStatusCurrentlyReading BookStatus = "currently_reading"
	BookStatusFinished         BookStatus = "finished"
	BookStatusNextToRead       BookStatus = "next_to_read"
)

type User struct {
	ID           uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	Name         string    `gorm:"size:120;not null" json:"name"`
	Email        string    `gorm:"size:160;uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Book struct {
	ID          uuid.UUID  `gorm:"type:char(36);primaryKey" json:"id"`
	UserID      uuid.UUID  `gorm:"type:char(36);index;not null" json:"user_id"`
	Title       string     `gorm:"size:200;not null" json:"title"`
	Author      string     `gorm:"size:200;not null" json:"author"`
	TotalPages  int        `gorm:"not null" json:"total_pages"`
	Status      BookStatus `gorm:"type:varchar(30);not null;index" json:"status"`
	CurrentPage *int       `json:"current_page"`
	CompletedAt *time.Time `json:"completed_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type WishlistItem struct {
	ID            uuid.UUID      `gorm:"type:char(36);primaryKey" json:"id"`
	UserID        uuid.UUID      `gorm:"type:char(36);index;not null" json:"user_id"`
	Title         string         `gorm:"size:200;not null" json:"title"`
	Author        string         `gorm:"size:200;not null" json:"author"`
	ExpectedPrice *float64       `json:"expected_price"`
	Notes         *string        `gorm:"type:text" json:"notes"`
	PurchaseLinks []PurchaseLink `gorm:"constraint:OnDelete:CASCADE" json:"purchase_links"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
}

type PurchaseLink struct {
	ID             uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	WishlistItemID uuid.UUID `gorm:"type:char(36);index;not null" json:"wishlist_item_id"`
	Label          string    `gorm:"size:120;not null" json:"label"`
	URL            string    `gorm:"size:500;not null" json:"url"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

func (b *Book) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

func (w *WishlistItem) BeforeCreate(tx *gorm.DB) error {
	if w.ID == uuid.Nil {
		w.ID = uuid.New()
	}
	return nil
}

func (p *PurchaseLink) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
