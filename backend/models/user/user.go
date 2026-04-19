package user

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	RoleReader = "reader"
	RoleAdmin  = "admin"
)

type User struct {
	ID                uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	Name              string    `gorm:"size:120;not null" json:"name"`
	Email             string    `gorm:"size:160;uniqueIndex;not null" json:"email"`
	PasswordHash      string    `gorm:"size:255;not null" json:"-"`
	Role              string    `gorm:"size:24;not null;default:'reader'" json:"role"`
	ReminderEnabled   bool      `gorm:"not null;default:false" json:"reminderEnabled"`
	ReminderTime      string    `gorm:"size:5;not null;default:'20:00'" json:"reminderTime"`
	ReminderFrequency string    `gorm:"size:20;not null;default:'daily'" json:"reminderFrequency"`
	ReminderTimezone  string    `gorm:"size:64;not null;default:'UTC'" json:"reminderTimezone"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	if u.Role == "" {
		u.Role = RoleReader
	}
	if u.ReminderTime == "" {
		u.ReminderTime = "20:00"
	}
	if u.ReminderFrequency == "" {
		u.ReminderFrequency = "daily"
	}
	if u.ReminderTimezone == "" {
		u.ReminderTimezone = "UTC"
	}
	return nil
}
