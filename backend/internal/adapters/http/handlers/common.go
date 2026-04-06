package handlers

import (
	"bibliotheca/backend/internal/domain"
	"github.com/google/uuid"
)

func parseUUID(id string) uuid.UUID {
	u, _ := uuid.Parse(id)
	return u
}

func withBookComputed(book *domain.Book) map[string]interface{} {
	remaining := book.TotalPages
	if book.CurrentPage != nil {
		remaining = book.TotalPages - *book.CurrentPage
	}
	if remaining < 0 {
		remaining = 0
	}
	progress := 0
	if book.CurrentPage != nil && book.TotalPages > 0 {
		progress = int(float64(*book.CurrentPage) / float64(book.TotalPages) * 100)
	}
	return map[string]interface{}{
		"id": book.ID, "user_id": book.UserID, "title": book.Title, "author": book.Author,
		"total_pages": book.TotalPages, "status": book.Status, "current_page": book.CurrentPage,
		"remaining_pages": remaining, "progress_percent": progress, "completed_at": book.CompletedAt,
		"created_at": book.CreatedAt, "updated_at": book.UpdatedAt,
	}
}
