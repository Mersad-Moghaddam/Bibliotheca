package book

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Book struct {
	ID          uuid.UUID  `gorm:"type:char(36);primaryKey" json:"id"`
	UserID      uuid.UUID  `gorm:"type:char(36);index;not null" json:"userId"`
	Title       string     `gorm:"size:200;not null" json:"title"`
	Author      string     `gorm:"size:200;not null" json:"author"`
	TotalPages  int        `gorm:"not null" json:"totalPages"`
	Status      string     `gorm:"type:varchar(30);not null;index" json:"status"`
	CurrentPage *int       `json:"currentPage"`
	CompletedAt *time.Time `json:"completedAt"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

func (b *Book) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}
