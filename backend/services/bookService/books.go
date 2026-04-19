package bookService

import (
	"context"
	"time"

	"github.com/google/uuid"
	"negar-backend/models/book"
	"negar-backend/models/bookNote"
	"negar-backend/repositories"
	"negar-backend/statics/constants"
	"negar-backend/statics/customErr"
)

func (s *Service) List(ctx context.Context, userID uuid.UUID, filter repositories.BookFilter) ([]book.Book, int64, error) {
	return s.repo.List(ctx, userID, filter)
}

func (s *Service) Create(ctx context.Context, b *book.Book) error {
	if b.Title == "" || b.Author == "" || b.TotalPages <= 0 {
		return customErr.ErrBadRequest
	}
	if b.Status == "" {
		b.Status = constants.BookStatusNextToRead
	}
	if b.Status == constants.BookStatusCurrentlyRead && b.CurrentPage == nil {
		v := 0
		b.CurrentPage = &v
	}
	if b.Status == constants.BookStatusFinished {
		now := time.Now()
		b.CompletedAt = &now
		b.CurrentPage = &b.TotalPages
	}
	if b.Status == constants.BookStatusInLibrary {
		b.CurrentPage = nil
		b.CompletedAt = nil
	}
	return s.repo.Create(ctx, b)
}

func (s *Service) Get(ctx context.Context, userID, id uuid.UUID) (*book.Book, error) {
	return s.repo.GetByID(ctx, userID, id)
}

func (s *Service) Delete(ctx context.Context, userID, id uuid.UUID) error {
	return s.repo.Delete(ctx, userID, id)
}

func (s *Service) Update(ctx context.Context, b *book.Book) error {
	if b.Title == "" || b.Author == "" || b.TotalPages <= 0 {
		return customErr.ErrBadRequest
	}
	if b.CurrentPage != nil && *b.CurrentPage > b.TotalPages {
		return customErr.ErrBadRequest
	}
	if b.Status == constants.BookStatusFinished {
		now := time.Now()
		b.CompletedAt = &now
		cp := b.TotalPages
		b.CurrentPage = &cp
	} else {
		b.CompletedAt = nil
		if b.Status == constants.BookStatusInLibrary || b.Status == constants.BookStatusNextToRead {
			b.CurrentPage = nil
		} else if b.CurrentPage == nil {
			cp := 0
			b.CurrentPage = &cp
		}
	}
	return s.repo.Update(ctx, b)
}

func (s *Service) UpdateStatus(
	ctx context.Context,
	userID, id uuid.UUID,
	status *string,
	finishRating *int,
	finishReflection, finishHighlight *string,
	nextToReadFocus *bool,
	nextToReadNote *string,
) (*book.Book, error) {
	b, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}
	nextStatus := b.Status
	if status != nil {
		nextStatus = *status
	}
	b.Status = nextStatus
	if nextStatus == constants.BookStatusFinished {
		now := time.Now()
		b.CompletedAt = &now
		cp := b.TotalPages
		b.CurrentPage = &cp
		if finishRating != nil {
			b.FinishRating = finishRating
		}
		if finishReflection != nil {
			b.FinishReflection = finishReflection
		}
		if finishHighlight != nil {
			b.FinishHighlight = finishHighlight
		}
	}
	if nextStatus == constants.BookStatusCurrentlyRead && b.CurrentPage == nil {
		v := 0
		b.CurrentPage = &v
	}
	if nextStatus == constants.BookStatusNextToRead {
		b.CompletedAt = nil
		b.CurrentPage = nil
		b.FinishRating = nil
		b.FinishReflection = nil
		b.FinishHighlight = nil
		if nextToReadNote != nil {
			if *nextToReadNote == "" {
				b.NextToReadNote = nil
			} else {
				b.NextToReadNote = nextToReadNote
			}
		}
		if nextToReadFocus != nil {
			b.NextToReadFocus = *nextToReadFocus
		}
		if b.NextToReadFocus {
			if err := s.repo.ClearNextToReadFocus(ctx, userID, &b.ID); err != nil {
				return nil, err
			}
		}
	}
	if nextStatus == constants.BookStatusInLibrary || nextStatus == constants.BookStatusCurrentlyRead || nextStatus == constants.BookStatusFinished {
		b.NextToReadFocus = false
		b.NextToReadNote = nil
	}
	if nextStatus == constants.BookStatusInLibrary {
		b.CompletedAt = nil
		b.CurrentPage = nil
		b.FinishRating = nil
		b.FinishReflection = nil
		b.FinishHighlight = nil
	}
	return b, s.repo.Update(ctx, b)
}

func (s *Service) Summary(ctx context.Context, userID uuid.UUID) (map[string]int64, []book.Book, []book.Book, error) {
	counts, err := s.repo.SummaryCounts(ctx, userID)
	if err != nil {
		return nil, nil, nil, err
	}
	recent, err := s.repo.Recent(ctx, userID, 5)
	if err != nil {
		return nil, nil, nil, err
	}
	reading, _, err := s.repo.List(ctx, userID, repositories.BookFilter{Status: constants.BookStatusCurrentlyRead})
	if err != nil {
		return nil, nil, nil, err
	}
	return counts, recent, reading, nil
}

func (s *Service) ListNotes(ctx context.Context, userID, bookID uuid.UUID) ([]bookNote.BookNote, error) {
	if _, err := s.repo.GetByID(ctx, userID, bookID); err != nil {
		return nil, err
	}
	return s.repo.ListNotes(ctx, userID, bookID)
}

func (s *Service) CreateNote(ctx context.Context, userID, bookID uuid.UUID, note string, highlight *string) (*bookNote.BookNote, error) {
	if note == "" {
		return nil, customErr.ErrBadRequest
	}
	if _, err := s.repo.GetByID(ctx, userID, bookID); err != nil {
		return nil, err
	}
	n := &bookNote.BookNote{UserID: userID, BookID: bookID, Note: note, Highlight: highlight}
	return n, s.repo.CreateNote(ctx, n)
}

func (s *Service) DeleteNote(ctx context.Context, userID, bookID, noteID uuid.UUID) error {
	if _, err := s.repo.GetByID(ctx, userID, bookID); err != nil {
		return err
	}
	return s.repo.DeleteNote(ctx, userID, bookID, noteID)
}
