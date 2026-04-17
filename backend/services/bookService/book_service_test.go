package bookService

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"libro-backend/models/book"
	"libro-backend/models/bookNote"
	"libro-backend/repositories"
	"libro-backend/statics/constants"
	"libro-backend/statics/customErr"
)

type fakeBookRepo struct {
	items map[uuid.UUID]book.Book
}

func (f *fakeBookRepo) List(_ context.Context, _ uuid.UUID, _ repositories.BookFilter) ([]book.Book, int64, error) {
	result := make([]book.Book, 0, len(f.items))
	for _, b := range f.items {
		result = append(result, b)
	}
	return result, int64(len(result)), nil
}

func (f *fakeBookRepo) Create(_ context.Context, b *book.Book) error {
	if f.items == nil {
		f.items = map[uuid.UUID]book.Book{}
	}
	f.items[b.ID] = *b
	return nil
}

func (f *fakeBookRepo) GetByID(_ context.Context, _, bookID uuid.UUID) (*book.Book, error) {
	b, ok := f.items[bookID]
	if !ok {
		return nil, errors.New("not found")
	}
	copyBook := b
	return &copyBook, nil
}

func (f *fakeBookRepo) Update(_ context.Context, b *book.Book) error {
	f.items[b.ID] = *b
	return nil
}

func (f *fakeBookRepo) Delete(_ context.Context, _, _ uuid.UUID) error { return nil }
func (f *fakeBookRepo) SummaryCounts(_ context.Context, _ uuid.UUID) (map[string]int64, error) {
	return map[string]int64{}, nil
}
func (f *fakeBookRepo) Recent(_ context.Context, _ uuid.UUID, _ int) ([]book.Book, error) {
	return nil, nil
}
func (f *fakeBookRepo) ListNotes(_ context.Context, _, _ uuid.UUID) ([]bookNote.BookNote, error) {
	return nil, nil
}
func (f *fakeBookRepo) CreateNote(_ context.Context, _ *bookNote.BookNote) error {
	return nil
}
func (f *fakeBookRepo) DeleteNote(_ context.Context, _, _, _ uuid.UUID) error {
	return nil
}

func TestUpdateStatusTransitions(t *testing.T) {
	t.Parallel()

	userID := uuid.New()
	bookID := uuid.New()
	repo := &fakeBookRepo{items: map[uuid.UUID]book.Book{
		bookID: {
			ID:         bookID,
			UserID:     userID,
			Title:      "Negar",
			Author:     "Author",
			TotalPages: 220,
			Status:     constants.BookStatusInLibrary,
		},
	}}
	svc := New(repo)

	reading, err := svc.UpdateStatus(context.Background(), userID, bookID, constants.BookStatusCurrentlyRead, nil, nil, nil)
	if err != nil {
		t.Fatalf("expected no error moving to reading, got %v", err)
	}
	if reading.CurrentPage == nil || *reading.CurrentPage != 0 {
		t.Fatal("expected current page to initialize at zero")
	}

	finished, err := svc.UpdateStatus(context.Background(), userID, bookID, constants.BookStatusFinished, nil, nil, nil)
	if err != nil {
		t.Fatalf("expected no error moving to finished, got %v", err)
	}
	if finished.CurrentPage == nil || *finished.CurrentPage != 220 {
		t.Fatal("expected current page to equal total pages")
	}
	if finished.CompletedAt == nil {
		t.Fatal("expected completedAt to be set")
	}

	backlog, err := svc.UpdateStatus(context.Background(), userID, bookID, constants.BookStatusNextToRead, nil, nil, nil)
	if err != nil {
		t.Fatalf("expected no error moving to backlog, got %v", err)
	}
	if backlog.CurrentPage != nil || backlog.CompletedAt != nil {
		t.Fatal("expected progress fields to be reset")
	}
}

func TestCreateRejectsInvalidPages(t *testing.T) {
	t.Parallel()

	svc := New(&fakeBookRepo{})
	err := svc.Create(context.Background(), &book.Book{Title: "", Author: "", TotalPages: 0})
	if !errors.Is(err, customErr.ErrBadRequest) {
		t.Fatalf("expected bad request, got %v", err)
	}
}

func TestAnalyticsReadingPaceUsesCurrentMonthCompletions(t *testing.T) {
	t.Parallel()

	now := time.Now()
	lastMonth := now.AddDate(0, -1, 0)
	currentPage := 120
	currentPage2 := 300
	repo := &fakeBookRepo{items: map[uuid.UUID]book.Book{
		uuid.New(): {
			ID:          uuid.New(),
			UserID:      uuid.New(),
			Title:       "This Month",
			Author:      "Author",
			TotalPages:  120,
			Status:      constants.BookStatusFinished,
			CurrentPage: &currentPage,
			CompletedAt: &now,
		},
		uuid.New(): {
			ID:          uuid.New(),
			UserID:      uuid.New(),
			Title:       "Last Month",
			Author:      "Author",
			TotalPages:  300,
			Status:      constants.BookStatusFinished,
			CurrentPage: &currentPage2,
			CompletedAt: &lastMonth,
		},
	}}

	svc := New(repo)
	analytics, err := svc.Analytics(context.Background(), uuid.New())
	if err != nil {
		t.Fatalf("analytics failed: %v", err)
	}
	if analytics.ReadingPacePerMonth != 1 {
		t.Fatalf("expected monthly completed books to be 1, got %d", analytics.ReadingPacePerMonth)
	}
}
