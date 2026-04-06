package bookService

import (
	"context"
	"time"

	"github.com/google/uuid"
	"libro-backend/models/book"
	"libro-backend/repositories"
	"libro-backend/statics/constants"
	"libro-backend/statics/customErr"
)

type Service struct{ repo repositories.BookRepository }

func New(repo repositories.BookRepository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, userID uuid.UUID, search, status string) ([]book.Book, error) {
	return s.repo.List(ctx, userID, repositories.BookFilter{Search: search, Status: status})
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
	}
	return s.repo.Update(ctx, b)
}
func (s *Service) UpdateStatus(ctx context.Context, userID, id uuid.UUID, status string) (*book.Book, error) {
	b, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}
	b.Status = status
	if status == constants.BookStatusFinished {
		now := time.Now()
		b.CompletedAt = &now
		cp := b.TotalPages
		b.CurrentPage = &cp
	}
	if status == constants.BookStatusCurrentlyRead && b.CurrentPage == nil {
		v := 0
		b.CurrentPage = &v
	}
	if status == constants.BookStatusNextToRead || status == constants.BookStatusInLibrary {
		b.CompletedAt = nil
		b.CurrentPage = nil
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
	reading, err := s.repo.List(ctx, userID, repositories.BookFilter{Status: constants.BookStatusCurrentlyRead})
	if err != nil {
		return nil, nil, nil, err
	}
	return counts, recent, reading, nil
}
