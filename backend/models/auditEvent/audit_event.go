package auditEvent

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuditEvent struct {
	ID           uuid.UUID  `gorm:"type:char(36);primaryKey" json:"id"`
	ActorUserID  uuid.UUID  `gorm:"type:char(36);not null;index:idx_audit_actor_created,priority:1" json:"actorUserId"`
	ActorRole    string     `gorm:"size:24;not null" json:"actorRole"`
	Action       string     `gorm:"size:80;not null;index:idx_audit_action_created,priority:1" json:"action"`
	ResourceType string     `gorm:"size:40;not null" json:"resourceType"`
	ResourceID   *uuid.UUID `gorm:"type:char(36)" json:"resourceId,omitempty"`
	Metadata     []byte     `gorm:"type:json" json:"metadata,omitempty"`
	IPAddress    string     `gorm:"size:64" json:"ipAddress,omitempty"`
	UserAgent    string     `gorm:"size:255" json:"userAgent,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
}

func (a *AuditEvent) BeforeCreate(_ *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
