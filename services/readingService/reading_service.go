package readingService

import (
	"context"

	"github.com/google/uuid"
	"libro-backend/models/book"
	"libro-backend/repositories"
)

type Service struct {
	repo repositories.ReadingProgressRepository
}

func New(repo repositories.ReadingProgressRepository) *Service { return &Service{repo: repo} }
func (s *Service) UpdateProgress(ctx context.Context, userID, bookID uuid.UUID, currentPage int) (*book.Book, error) {
	return s.repo.UpdateCurrentPage(ctx, userID, bookID, currentPage)
}
