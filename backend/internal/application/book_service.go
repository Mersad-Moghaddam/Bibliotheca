package application

import (
	"context"
	"time"

	"bibliotheca/backend/internal/domain"
	"bibliotheca/backend/internal/ports"
	"bibliotheca/backend/pkg/apperror"
	"github.com/google/uuid"
)

type BookService struct{ repo ports.BookRepository }

func NewBookService(repo ports.BookRepository) *BookService { return &BookService{repo: repo} }

func (s *BookService) List(ctx context.Context, userID uuid.UUID, search, status string) ([]domain.Book, error) {
	return s.repo.List(ctx, userID, ports.BookFilter{Search: search, Status: status})
}
func (s *BookService) Create(ctx context.Context, book *domain.Book) error {
	if book.Title == "" || book.Author == "" || book.TotalPages <= 0 {
		return apperror.ErrBadRequest
	}
	if book.Status == "" {
		book.Status = domain.BookStatusNextToRead
	}
	if book.Status == domain.BookStatusCurrentlyReading && book.CurrentPage == nil {
		v := 0
		book.CurrentPage = &v
	}
	if book.Status == domain.BookStatusFinished {
		now := time.Now()
		book.CompletedAt = &now
		book.CurrentPage = &book.TotalPages
	}
	return s.repo.Create(ctx, book)
}
func (s *BookService) Get(ctx context.Context, userID, id uuid.UUID) (*domain.Book, error) {
	return s.repo.GetByID(ctx, userID, id)
}
func (s *BookService) Delete(ctx context.Context, userID, id uuid.UUID) error {
	return s.repo.Delete(ctx, userID, id)
}
func (s *BookService) Update(ctx context.Context, book *domain.Book) error {
	if book.Title == "" || book.Author == "" || book.TotalPages <= 0 {
		return apperror.ErrBadRequest
	}
	if book.CurrentPage != nil && *book.CurrentPage > book.TotalPages {
		return apperror.ErrBadRequest
	}
	if book.Status == domain.BookStatusFinished {
		now := time.Now()
		book.CompletedAt = &now
		cp := book.TotalPages
		book.CurrentPage = &cp
	}
	return s.repo.Update(ctx, book)
}
func (s *BookService) UpdateStatus(ctx context.Context, userID, id uuid.UUID, status domain.BookStatus) (*domain.Book, error) {
	book, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}
	book.Status = status
	if status == domain.BookStatusFinished {
		now := time.Now()
		book.CompletedAt = &now
		cp := book.TotalPages
		book.CurrentPage = &cp
	}
	if status == domain.BookStatusCurrentlyReading && book.CurrentPage == nil {
		v := 0
		book.CurrentPage = &v
	}
	if status == domain.BookStatusNextToRead {
		book.CompletedAt = nil
		book.CurrentPage = nil
	}
	return book, s.repo.Update(ctx, book)
}
func (s *BookService) UpdateBookmark(ctx context.Context, userID, id uuid.UUID, currentPage int) (*domain.Book, error) {
	book, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}
	if currentPage < 0 || currentPage > book.TotalPages {
		return nil, apperror.ErrBadRequest
	}
	book.Status = domain.BookStatusCurrentlyReading
	book.CurrentPage = &currentPage
	if currentPage == book.TotalPages {
		book.Status = domain.BookStatusFinished
		now := time.Now()
		book.CompletedAt = &now
	}
	return book, s.repo.Update(ctx, book)
}
