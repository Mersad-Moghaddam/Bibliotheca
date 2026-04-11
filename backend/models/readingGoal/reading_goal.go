package readingGoal

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReadingGoal struct {
	ID        uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"type:char(36);index;not null" json:"userId"`
	Period    string    `gorm:"type:varchar(20);not null;index" json:"period"`
	PagesGoal int       `gorm:"not null;default:0" json:"pagesGoal"`
	BooksGoal int       `gorm:"not null;default:0" json:"booksGoal"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (g *ReadingGoal) BeforeCreate(tx *gorm.DB) error {
	if g.ID == uuid.Nil {
		g.ID = uuid.New()
	}
	return nil
}
