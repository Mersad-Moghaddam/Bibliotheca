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
func (f *fakeBookRepo) ClearNextToReadFocus(_ context.Context, _ uuid.UUID, exceptBookID *uuid.UUID) error {
	for id, item := range f.items {
		if exceptBookID != nil && id == *exceptBookID {
			continue
		}
		item.NextToReadFocus = false
		f.items[id] = item
	}
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

	readingStatus := constants.BookStatusCurrentlyRead
	reading, err := svc.UpdateStatus(context.Background(), userID, bookID, &readingStatus, nil, nil, nil, nil, nil)
	if err != nil {
		t.Fatalf("expected no error moving to reading, got %v", err)
	}
	if reading.CurrentPage == nil || *reading.CurrentPage != 0 {
		t.Fatal("expected current page to initialize at zero")
	}

	finishedStatus := constants.BookStatusFinished
	finished, err := svc.UpdateStatus(context.Background(), userID, bookID, &finishedStatus, nil, nil, nil, nil, nil)
	if err != nil {
		t.Fatalf("expected no error moving to finished, got %v", err)
	}
	if finished.CurrentPage == nil || *finished.CurrentPage != 220 {
		t.Fatal("expected current page to equal total pages")
	}
	if finished.CompletedAt == nil {
		t.Fatal("expected completedAt to be set")
	}

	backlogStatus := constants.BookStatusNextToRead
	backlog, err := svc.UpdateStatus(context.Background(), userID, bookID, &backlogStatus, nil, nil, nil, nil, nil)
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

func TestUpdateStatusDoesNotClearFocusedQueueOnUnrelatedBook(t *testing.T) {
	t.Parallel()

	userID := uuid.New()
	queueID := uuid.New()
	finishedID := uuid.New()
	note := "Start this on the weekend"
	repo := &fakeBookRepo{items: map[uuid.UUID]book.Book{
		queueID: {
			ID:              queueID,
			UserID:          userID,
			Title:           "Queued",
			Author:          "Author",
			TotalPages:      300,
			Status:          constants.BookStatusNextToRead,
			NextToReadFocus: true,
			NextToReadNote:  &note,
		},
		finishedID: {
			ID:         finishedID,
			UserID:     userID,
			Title:      "Done",
			Author:     "Author",
			TotalPages: 200,
			Status:     constants.BookStatusFinished,
		},
	}}
	svc := New(repo)

	status := constants.BookStatusFinished
	if _, err := svc.UpdateStatus(context.Background(), userID, finishedID, &status, nil, nil, nil, nil, nil); err != nil {
		t.Fatalf("unexpected error updating unrelated book: %v", err)
	}

	queued, err := repo.GetByID(context.Background(), userID, queueID)
	if err != nil {
		t.Fatalf("expected queued book to exist: %v", err)
	}
	if !queued.NextToReadFocus {
		t.Fatal("expected focused next-to-read book to stay focused")
	}
}

func TestUpdateStatusCanClearNextToReadNote(t *testing.T) {
	t.Parallel()

	userID := uuid.New()
	bookID := uuid.New()
	note := "Read before vacation"
	repo := &fakeBookRepo{items: map[uuid.UUID]book.Book{
		bookID: {
			ID:             bookID,
			UserID:         userID,
			Title:          "Queued",
			Author:         "Author",
			TotalPages:     250,
			Status:         constants.BookStatusNextToRead,
			NextToReadNote: &note,
		},
	}}
	svc := New(repo)

	clear := ""
	updated, err := svc.UpdateStatus(context.Background(), userID, bookID, nil, nil, nil, nil, nil, &clear)
	if err != nil {
		t.Fatalf("unexpected error clearing note: %v", err)
	}
	if updated.NextToReadNote != nil {
		t.Fatal("expected next-to-read note to be cleared")
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
