package bookview

import (
	"github.com/gofiber/fiber/v2"
	"negar-backend/models/book"
)

func ProgressStats(b *book.Book) (remainingPages int, progressPercentage int) {
	remainingPages = b.TotalPages
	if b.CurrentPage != nil {
		remainingPages = b.TotalPages - *b.CurrentPage
	}
	if remainingPages < 0 {
		remainingPages = 0
	}

	if b.CurrentPage != nil && b.TotalPages > 0 {
		progressPercentage = int(float64(*b.CurrentPage) / float64(b.TotalPages) * 100)
	}

	return remainingPages, progressPercentage
}

func Full(b *book.Book) fiber.Map {
	remainingPages, progressPercentage := ProgressStats(b)
	return fiber.Map{
		"id":                 b.ID,
		"userId":             b.UserID,
		"title":              b.Title,
		"author":             b.Author,
		"totalPages":         b.TotalPages,
		"status":             b.Status,
		"currentPage":        b.CurrentPage,
		"remainingPages":     remainingPages,
		"progressPercentage": progressPercentage,
		"coverUrl":           b.CoverURL,
		"genre":              b.Genre,
		"isbn":               b.ISBN,
		"completedAt":        b.CompletedAt,
		"finishRating":       b.FinishRating,
		"finishReflection":   b.FinishReflection,
		"finishHighlight":    b.FinishHighlight,
		"nextToReadFocus":    b.NextToReadFocus,
		"nextToReadNote":     b.NextToReadNote,
		"createdAt":          b.CreatedAt,
		"updatedAt":          b.UpdatedAt,
	}
}

func FullList(books []book.Book) []fiber.Map {
	resp := make([]fiber.Map, 0, len(books))
	for i := range books {
		b := books[i]
		resp = append(resp, Full(&b))
	}
	return resp
}

func Summary(b *book.Book) fiber.Map {
	remainingPages, progressPercentage := ProgressStats(b)
	return fiber.Map{
		"id":                 b.ID,
		"userId":             b.UserID,
		"title":              b.Title,
		"author":             b.Author,
		"totalPages":         b.TotalPages,
		"status":             b.Status,
		"currentPage":        b.CurrentPage,
		"remainingPages":     remainingPages,
		"progressPercentage": progressPercentage,
		"completedAt":        b.CompletedAt,
		"createdAt":          b.CreatedAt,
		"updatedAt":          b.UpdatedAt,
	}
}

func SummaryList(books []book.Book) []fiber.Map {
	resp := make([]fiber.Map, 0, len(books))
	for i := range books {
		b := books[i]
		resp = append(resp, Summary(&b))
	}
	return resp
}
