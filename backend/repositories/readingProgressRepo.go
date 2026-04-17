package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"libro-backend/models/book"
	"libro-backend/models/readingEvent"
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
	b.CompletedAt = nil
	if currentPage == b.TotalPages {
		b.Status = constants.BookStatusFinished
		now := time.Now()
		b.CompletedAt = &now
	}
	return b, r.books.Update(ctx, b)
}

func (r *readingProgressRepo) CreateSession(ctx context.Context, session *readingSession.ReadingSession) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(session).Error; err != nil {
			return err
		}
		if session.PagesRead <= 0 {
			return nil
		}

		var b book.Book
		if err := tx.Where("id = ? AND user_id = ?", session.BookID, session.UserID).First(&b).Error; err != nil {
			return err
		}

		current := 0
		if b.CurrentPage != nil {
			current = *b.CurrentPage
		}
		next := current + session.PagesRead
		if next > b.TotalPages {
			next = b.TotalPages
		}
		pagesDelta := next - current
		if pagesDelta == 0 {
			return nil
		}

		completedDelta := 0
		b.Status = constants.BookStatusCurrentlyRead
		b.CompletedAt = nil
		if next == b.TotalPages {
			b.Status = constants.BookStatusFinished
			now := time.Now()
			b.CompletedAt = &now
			if current < b.TotalPages {
				completedDelta = 1
			}
		}
		b.CurrentPage = &next
		if err := tx.Save(&b).Error; err != nil {
			return err
		}

		eventType := "progress_update"
		if completedDelta > 0 {
			eventType = "book_completed"
		}
		eventDate := session.Date
		event := readingEvent.ReadingEvent{
			UserID:         session.UserID,
			BookID:         session.BookID,
			EventDate:      time.Date(eventDate.Year(), eventDate.Month(), eventDate.Day(), 0, 0, 0, 0, eventDate.Location()),
			EventType:      eventType,
			PagesDelta:     pagesDelta,
			CompletedDelta: completedDelta,
		}
		return tx.Create(&event).Error
	})
}

func (r *readingProgressRepo) ListSessions(ctx context.Context, userID uuid.UUID, bookID *uuid.UUID, limit int) ([]readingSession.ReadingSession, error) {
	var sessions []readingSession.ReadingSession
	q := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("date DESC")
	if bookID != nil {
		q = q.Where("book_id = ?", *bookID)
	}
	if limit > 0 {
		q = q.Limit(limit)
	}
	return sessions, q.Find(&sessions).Error
}

func (r *readingProgressRepo) UpsertGoal(ctx context.Context, goal *readingGoal.ReadingGoal) error {
	var existing readingGoal.ReadingGoal
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND period = ? AND start_date = ? AND end_date = ?", goal.UserID, goal.Period, goal.StartDate, goal.EndDate).
		First(&existing).Error
	if err == nil {
		existing.TargetPages = goal.TargetPages
		existing.TargetBooks = goal.TargetBooks
		existing.Source = goal.Source
		return r.db.WithContext(ctx).Save(&existing).Error
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return err
	}
	return r.db.WithContext(ctx).Create(goal).Error
}

func (r *readingProgressRepo) FindGoalByWindow(ctx context.Context, userID uuid.UUID, period string, startDate, endDate time.Time) (*readingGoal.ReadingGoal, error) {
	var goal readingGoal.ReadingGoal
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND period = ? AND start_date = ? AND end_date = ?", userID, period, startDate, endDate).
		First(&goal).Error
	if err != nil {
		return nil, err
	}
	return &goal, nil
}

func (r *readingProgressRepo) ListGoals(ctx context.Context, userID uuid.UUID) ([]readingGoal.ReadingGoal, error) {
	var goals []readingGoal.ReadingGoal
	return goals, r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&goals).Error
}

func (r *readingProgressRepo) CountCompletedBooksBetween(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&book.Book{}).
		Where("user_id = ? AND completed_at IS NOT NULL AND DATE(completed_at) >= ? AND DATE(completed_at) <= ?", userID, startDate.Format("2006-01-02"), endDate.Format("2006-01-02")).
		Count(&count).Error
	return count, err
}

func (r *readingProgressRepo) SumEventPagesBetween(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) (int, error) {
	var total int
	err := r.db.WithContext(ctx).Model(&readingEvent.ReadingEvent{}).
		Select("COALESCE(SUM(pages_delta),0)").
		Where("user_id = ? AND event_date >= ? AND event_date <= ?", userID, startDate.Format("2006-01-02"), endDate.Format("2006-01-02")).
		Scan(&total).Error
	return total, err
}

func (r *readingProgressRepo) SumEventCompletionsBetween(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) (int, error) {
	var total int
	err := r.db.WithContext(ctx).Model(&readingEvent.ReadingEvent{}).
		Select("COALESCE(SUM(completed_delta),0)").
		Where("user_id = ? AND event_date >= ? AND event_date <= ?", userID, startDate.Format("2006-01-02"), endDate.Format("2006-01-02")).
		Scan(&total).Error
	return total, err
}

func (r *readingProgressRepo) ListEventsBetween(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) ([]readingEvent.ReadingEvent, error) {
	var events []readingEvent.ReadingEvent
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND event_date >= ? AND event_date <= ?", userID, startDate.Format("2006-01-02"), endDate.Format("2006-01-02")).
		Order("event_date desc").
		Find(&events).Error
	return events, err
}
