package tests

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"negar-backend/models/book"
	"negar-backend/models/readingEvent"
	"negar-backend/repositories"
	"negar-backend/services/bookService"
	"negar-backend/statics/constants"
)

func TestBookServiceWithRepository(t *testing.T) {
	t.Parallel()

	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	if err = db.AutoMigrate(&book.Book{}, &readingEvent.ReadingEvent{}); err != nil {
		t.Fatalf("automigrate: %v", err)
	}

	repo := repositories.NewBookRepo(db)
	svc := bookService.New(repo)

	userID := uuid.New()
	newBook := &book.Book{
		UserID:     userID,
		Title:      "Clean Architecture",
		Author:     "Robert C. Martin",
		TotalPages: 432,
		Status:     constants.BookStatusInLibrary,
	}
	if err = svc.Create(context.Background(), newBook); err != nil {
		t.Fatalf("create: %v", err)
	}

	status := constants.BookStatusFinished
	updated, err := svc.UpdateStatus(context.Background(), userID, newBook.ID, &status, nil, nil, nil, nil, nil)
	if err != nil {
		t.Fatalf("update status: %v", err)
	}
	if updated.CurrentPage == nil || *updated.CurrentPage != updated.TotalPages {
		t.Fatal("expected finished status to set current page to total pages")
	}

	fetched, err := svc.Get(context.Background(), userID, newBook.ID)
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if fetched.Status != constants.BookStatusFinished {
		t.Fatalf("expected finished status, got %s", fetched.Status)
	}
}
