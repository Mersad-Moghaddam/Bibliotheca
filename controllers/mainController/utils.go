package mainController

import (
	"github.com/google/uuid"
	"libro-backend/models/book"
)

func parseUUID(id string) uuid.UUID {
	u, _ := uuid.Parse(id)
	return u
}

func withBooksComputed(books []book.Book) []map[string]any {
	resp := make([]map[string]any, 0, len(books))
	for i := range books {
		b := books[i]
		remaining := b.TotalPages
		if b.CurrentPage != nil {
			remaining = b.TotalPages - *b.CurrentPage
		}
		if remaining < 0 {
			remaining = 0
		}
		progress := 0
		if b.CurrentPage != nil && b.TotalPages > 0 {
			progress = int(float64(*b.CurrentPage) / float64(b.TotalPages) * 100)
		}
		resp = append(resp, map[string]any{"id": b.ID, "userId": b.UserID, "title": b.Title, "author": b.Author, "totalPages": b.TotalPages, "status": b.Status, "currentPage": b.CurrentPage, "remainingPages": remaining, "progressPercentage": progress, "completedAt": b.CompletedAt, "createdAt": b.CreatedAt, "updatedAt": b.UpdatedAt})
	}
	return resp
}
