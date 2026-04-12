package readingGoal

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReadingGoal struct {
	ID          uuid.UUID  `gorm:"type:char(36);primaryKey" json:"id"`
	UserID      uuid.UUID  `gorm:"type:char(36);index;not null" json:"userId"`
	Period      string     `gorm:"type:varchar(20);not null;index" json:"period"`
	TargetPages *int       `gorm:"column:pages_goal" json:"targetPages,omitempty"`
	TargetBooks *int       `gorm:"column:books_goal" json:"targetBooks,omitempty"`
	Source      string     `gorm:"type:varchar(32);not null;default:manual" json:"source"`
	StartDate   *time.Time `gorm:"type:date" json:"startDate,omitempty"`
	EndDate     *time.Time `gorm:"type:date" json:"endDate,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

func (g *ReadingGoal) BeforeCreate(tx *gorm.DB) error {
	if g.ID == uuid.Nil {
		g.ID = uuid.New()
	}
	if g.Source == "" {
		g.Source = "manual"
	}
	return nil
}
