package auditService

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/google/uuid"
	"negar-backend/models/auditEvent"
	"negar-backend/repositories"
)

type RecordInput struct {
	ActorUserID  uuid.UUID
	ActorRole    string
	Action       string
	ResourceType string
	ResourceID   *uuid.UUID
	Metadata     map[string]any
	IPAddress    string
	UserAgent    string
}

type Service struct{ repo repositories.AuditRepository }

func New(repo repositories.AuditRepository) *Service { return &Service{repo: repo} }

func (s *Service) Record(ctx context.Context, in RecordInput) error {
	if in.ActorUserID == uuid.Nil || strings.TrimSpace(in.Action) == "" || strings.TrimSpace(in.ResourceType) == "" {
		return nil
	}
	payload, err := json.Marshal(in.Metadata)
	if err != nil {
		payload = []byte("{}")
	}
	event := &auditEvent.AuditEvent{
		ActorUserID:  in.ActorUserID,
		ActorRole:    strings.TrimSpace(in.ActorRole),
		Action:       strings.TrimSpace(in.Action),
		ResourceType: strings.TrimSpace(in.ResourceType),
		ResourceID:   in.ResourceID,
		Metadata:     payload,
		IPAddress:    strings.TrimSpace(in.IPAddress),
		UserAgent:    strings.TrimSpace(in.UserAgent),
	}
	return s.repo.Create(ctx, event)
}
