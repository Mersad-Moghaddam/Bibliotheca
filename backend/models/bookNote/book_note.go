package bookNote

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BookNote struct {
	ID        uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"type:char(36);index;not null" json:"userId"`
	BookID    uuid.UUID `gorm:"type:char(36);index;not null" json:"bookId"`
	Note      string    `gorm:"type:text;not null" json:"note"`
	Highlight *string   `gorm:"type:text" json:"highlight"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (n *BookNote) BeforeCreate(tx *gorm.DB) error {
	if n.ID == uuid.Nil {
		n.ID = uuid.New()
	}
	return nil
}
