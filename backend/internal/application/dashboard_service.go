package application

import (
	"context"

	"github.com/google/uuid"
	"libro-backend/internal/domain"
	"libro-backend/internal/ports"
)

type DashboardSummary struct {
	Counts           map[string]int64 `json:"counts"`
	RecentBooks      []domain.Book    `json:"recent_books"`
	CurrentlyReading []domain.Book    `json:"currently_reading"`
}

type DashboardService struct {
	books    ports.BookRepository
	wishlist ports.WishlistRepository
}

func NewDashboardService(books ports.BookRepository, wishlist ports.WishlistRepository) *DashboardService {
	return &DashboardService{books: books, wishlist: wishlist}
}

func (s *DashboardService) Summary(ctx context.Context, userID uuid.UUID) (*DashboardSummary, error) {
	counts, err := s.books.SummaryCounts(ctx, userID)
	if err != nil {
		return nil, err
	}
	wish, err := s.wishlist.List(ctx, userID)
	if err != nil {
		return nil, err
	}
	counts["wishlist"] = int64(len(wish))
	recent, err := s.books.Recent(ctx, userID, 5)
	if err != nil {
		return nil, err
	}
	reading, err := s.books.List(ctx, userID, ports.BookFilter{Status: string(domain.BookStatusCurrentlyReading)})
	if err != nil {
		return nil, err
	}
	return &DashboardSummary{Counts: counts, RecentBooks: recent, CurrentlyReading: reading}, nil
}
