package readingService

import (
	"context"
	"time"

	"github.com/google/uuid"
	"libro-backend/models/book"
	"libro-backend/models/readingGoal"
	"libro-backend/models/readingSession"
	"libro-backend/repositories"
	"libro-backend/statics/customErr"
)

type Service struct {
	repo repositories.ReadingProgressRepository
}

type GoalProgress struct {
	Period       string `json:"period"`
	PagesGoal    int    `json:"pagesGoal"`
	BooksGoal    int    `json:"booksGoal"`
	PagesRead    int    `json:"pagesRead"`
	BooksRead    int    `json:"booksRead"`
	PagesPercent int    `json:"pagesPercent"`
	BooksPercent int    `json:"booksPercent"`
}

func New(repo repositories.ReadingProgressRepository) *Service { return &Service{repo: repo} }
func (s *Service) UpdateProgress(ctx context.Context, userID, bookID uuid.UUID, currentPage int) (*book.Book, error) {
	return s.repo.UpdateCurrentPage(ctx, userID, bookID, currentPage)
}

func (s *Service) CreateSession(ctx context.Context, session *readingSession.ReadingSession) error {
	if session.Duration <= 0 || session.PagesRead < 0 {
		return customErr.ErrBadRequest
	}
	if session.Date.IsZero() {
		session.Date = time.Now()
	}
	return s.repo.CreateSession(ctx, session)
}

func (s *Service) RecentSessions(ctx context.Context, userID uuid.UUID, limit int) ([]readingSession.ReadingSession, error) {
	return s.repo.ListSessions(ctx, userID, limit)
}

func (s *Service) SaveGoal(ctx context.Context, goal *readingGoal.ReadingGoal) error {
	if goal.Period != "weekly" && goal.Period != "monthly" {
		return customErr.ErrBadRequest
	}
	if goal.PagesGoal < 0 || goal.BooksGoal < 0 {
		return customErr.ErrBadRequest
	}
	return s.repo.UpsertGoal(ctx, goal)
}

func (s *Service) GoalProgress(ctx context.Context, userID uuid.UUID) ([]GoalProgress, error) {
	goals, err := s.repo.ListGoals(ctx, userID)
	if err != nil {
		return nil, err
	}
	sessions, err := s.repo.ListSessions(ctx, userID, 1000)
	if err != nil {
		return nil, err
	}
	now := time.Now()
	weeklyStart := now.AddDate(0, 0, -6)
	monthlyStart := now.AddDate(0, 0, -29)
	pages := map[string]int{"weekly": 0, "monthly": 0}
	books := map[string]map[string]struct{}{"weekly": {}, "monthly": {}}
	for _, ses := range sessions {
		if ses.Date.After(weeklyStart) || ses.Date.Equal(weeklyStart) {
			pages["weekly"] += ses.PagesRead
			books["weekly"][ses.BookID.String()] = struct{}{}
		}
		if ses.Date.After(monthlyStart) || ses.Date.Equal(monthlyStart) {
			pages["monthly"] += ses.PagesRead
			books["monthly"][ses.BookID.String()] = struct{}{}
		}
	}
	result := make([]GoalProgress, 0, len(goals))
	for _, g := range goals {
		item := GoalProgress{Period: g.Period, PagesGoal: g.PagesGoal, BooksGoal: g.BooksGoal, PagesRead: pages[g.Period], BooksRead: len(books[g.Period])}
		if g.PagesGoal > 0 {
			item.PagesPercent = int(float64(item.PagesRead) / float64(g.PagesGoal) * 100)
		}
		if g.BooksGoal > 0 {
			item.BooksPercent = int(float64(item.BooksRead) / float64(g.BooksGoal) * 100)
		}
		result = append(result, item)
	}
	return result, nil
}
