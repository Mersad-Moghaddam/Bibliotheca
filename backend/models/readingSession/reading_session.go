package readingSession

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReadingSession struct {
	ID        uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"type:char(36);index;not null" json:"userId"`
	BookID    uuid.UUID `gorm:"type:char(36);index;not null" json:"bookId"`
	Date      time.Time `gorm:"type:date;not null;index" json:"date"`
	Duration  int       `gorm:"not null" json:"duration"`
	PagesRead int       `gorm:"not null" json:"pagesRead"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (s *ReadingSession) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
