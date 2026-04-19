package reminderDelivery

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Status string

const (
	StatusPending    Status = "pending"
	StatusProcessing Status = "processing"
	StatusSent       Status = "sent"
	StatusFailed     Status = "failed"
)

type ReminderDelivery struct {
	ID             uuid.UUID  `gorm:"type:char(36);primaryKey" json:"id"`
	UserID         uuid.UUID  `gorm:"type:char(36);index:idx_reminder_deliveries_user,priority:1;not null" json:"userId"`
	Channel        string     `gorm:"size:24;not null" json:"channel"`
	ScheduledFor   time.Time  `gorm:"not null" json:"scheduledFor"`
	Status         Status     `gorm:"size:24;not null;index:idx_reminder_deliveries_dispatch,priority:1" json:"status"`
	Attempts       int        `gorm:"not null;default:0" json:"attempts"`
	LastError      *string    `gorm:"size:255" json:"lastError,omitempty"`
	NextAttemptAt  *time.Time `gorm:"index:idx_reminder_deliveries_dispatch,priority:2" json:"nextAttemptAt,omitempty"`
	SentAt         *time.Time `json:"sentAt,omitempty"`
	IdempotencyKey string     `gorm:"size:191;not null;uniqueIndex:uq_reminder_deliveries_key" json:"idempotencyKey"`
	Payload        []byte     `gorm:"type:json" json:"payload,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

func (d *ReminderDelivery) BeforeCreate(_ *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return nil
}
