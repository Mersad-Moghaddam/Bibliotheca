package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"libro-backend/models/book"
	"libro-backend/models/readingGoal"
	"libro-backend/models/readingSession"
	"libro-backend/statics/constants"
	"libro-backend/statics/customErr"
)

type readingProgressRepo struct {
	books BookRepository
	db    *gorm.DB
}

func NewReadingProgressRepo(db *gorm.DB, books BookRepository) ReadingProgressRepository {
	return &readingProgressRepo{books: books, db: db}
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

func (r *readingProgressRepo) CreateSession(ctx context.Context, session *readingSession.ReadingSession) error {
	return r.db.WithContext(ctx).Create(session).Error
}

func (r *readingProgressRepo) ListSessions(ctx context.Context, userID uuid.UUID, limit int) ([]readingSession.ReadingSession, error) {
	var sessions []readingSession.ReadingSession
	q := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("date DESC")
	if limit > 0 {
		q = q.Limit(limit)
	}
	return sessions, q.Find(&sessions).Error
}

func (r *readingProgressRepo) UpsertGoal(ctx context.Context, goal *readingGoal.ReadingGoal) error {
	var existing readingGoal.ReadingGoal
	err := r.db.WithContext(ctx).Where("user_id = ? AND period = ?", goal.UserID, goal.Period).First(&existing).Error
	if err == nil {
		existing.PagesGoal = goal.PagesGoal
		existing.BooksGoal = goal.BooksGoal
		return r.db.WithContext(ctx).Save(&existing).Error
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return err
	}
	return r.db.WithContext(ctx).Create(goal).Error
}

func (r *readingProgressRepo) ListGoals(ctx context.Context, userID uuid.UUID) ([]readingGoal.ReadingGoal, error) {
	var goals []readingGoal.ReadingGoal
	return goals, r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&goals).Error
}
