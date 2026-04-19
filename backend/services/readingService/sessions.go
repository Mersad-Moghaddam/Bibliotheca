package readingService

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"negar-backend/models/book"
	"negar-backend/models/readingSession"
	"negar-backend/statics/customErr"
)

func (s *Service) UpdateProgress(ctx context.Context, userID, bookID uuid.UUID, currentPage int) (*book.Book, error) {
	return s.repo.UpdateCurrentPage(ctx, userID, bookID, currentPage)
}

func (s *Service) CreateSession(ctx context.Context, session *readingSession.ReadingSession) error {
	if session.Duration <= 0 || session.PagesRead < 0 {
		return customErr.ErrBadRequest
	}
	if session.Date.IsZero() {
		session.Date = time.Now()
	}
	return s.repo.CreateSession(ctx, session)
}

func (s *Service) RecentSessions(ctx context.Context, userID uuid.UUID, bookID string, limit int) ([]readingSession.ReadingSession, error) {
	var parsedBookID *uuid.UUID
	if bookID != "" {
		id, err := uuid.Parse(bookID)
		if err != nil {
			return nil, customErr.ErrBadRequest
		}
		parsedBookID = &id
	}
	return s.repo.ListSessions(ctx, userID, parsedBookID, limit)
}

func IsNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}
