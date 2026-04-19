package repositories

import (
	"context"

	"gorm.io/gorm"
	"negar-backend/models/auditEvent"
)

type auditRepo struct{ db *gorm.DB }

func NewAuditRepo(db *gorm.DB) AuditRepository { return &auditRepo{db: db} }

func (r *auditRepo) Create(ctx context.Context, event *auditEvent.AuditEvent) error {
	return r.db.WithContext(ctx).Create(event).Error
}
