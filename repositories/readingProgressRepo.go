package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"libro-backend/models/book"
	"libro-backend/statics/constants"
	"libro-backend/statics/customErr"
)

type readingProgressRepo struct{ books BookRepository }

func NewReadingProgressRepo(books BookRepository) ReadingProgressRepository {
	return &readingProgressRepo{books: books}
}

func (r *readingProgressRepo) UpdateCurrentPage(ctx context.Context, userID, bookID uuid.UUID, currentPage int) (*book.Book, error) {
	b, err := r.books.GetByID(ctx, userID, bookID)
	if err != nil {
		return nil, err
	}
	if currentPage < 0 || currentPage > b.TotalPages {
		return nil, customErr.ErrBadRequest
	}
	b.Status = constants.BookStatusCurrentlyRead
	b.CurrentPage = &currentPage
	if currentPage == b.TotalPages {
		b.Status = constants.BookStatusFinished
		now := time.Now()
		b.CompletedAt = &now
	}
	return b, r.books.Update(ctx, b)
}
