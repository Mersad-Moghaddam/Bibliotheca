package bookService

import (
	"context"
	"sort"
	"time"

	"github.com/google/uuid"
	"libro-backend/models/book"
	"libro-backend/models/bookNote"
	"libro-backend/repositories"
	"libro-backend/statics/constants"
	"libro-backend/statics/customErr"
)

type Service struct{ repo repositories.BookRepository }

type ActivityPoint struct {
	Label string `json:"label"`
	Count int    `json:"count"`
}

type Analytics struct {
	BooksCompleted      int64           `json:"booksCompleted"`
	ActiveReading       int64           `json:"activeReading"`
	TotalBooks          int64           `json:"totalBooks"`
	TotalPagesRead      int             `json:"totalPagesRead"`
	CompletionRate      int             `json:"completionRate"`
	ReadingPacePerMonth int             `json:"readingPacePerMonth"`
	CurrentStreakWeeks  int             `json:"currentStreakWeeks"`
	StatusDistribution  map[string]int  `json:"statusDistribution"`
	MonthlyActivity     []ActivityPoint `json:"monthlyActivity"`
	WeeklyActivity      []ActivityPoint `json:"weeklyActivity"`
}

func New(repo repositories.BookRepository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, userID uuid.UUID, filter repositories.BookFilter) ([]book.Book, int64, error) {
	return s.repo.List(ctx, userID, filter)
}
func (s *Service) Create(ctx context.Context, b *book.Book) error {
	if b.Title == "" || b.Author == "" || b.TotalPages <= 0 {
		return customErr.ErrBadRequest
	}
	if b.Status == "" {
		b.Status = constants.BookStatusNextToRead
	}
	if b.Status == constants.BookStatusCurrentlyRead && b.CurrentPage == nil {
		v := 0
		b.CurrentPage = &v
	}
	if b.Status == constants.BookStatusFinished {
		now := time.Now()
		b.CompletedAt = &now
		b.CurrentPage = &b.TotalPages
	}
	if b.Status == constants.BookStatusInLibrary {
		b.CurrentPage = nil
		b.CompletedAt = nil
	}
	return s.repo.Create(ctx, b)
}
func (s *Service) Get(ctx context.Context, userID, id uuid.UUID) (*book.Book, error) {
	return s.repo.GetByID(ctx, userID, id)
}
func (s *Service) Delete(ctx context.Context, userID, id uuid.UUID) error {
	return s.repo.Delete(ctx, userID, id)
}
func (s *Service) Update(ctx context.Context, b *book.Book) error {
	if b.Title == "" || b.Author == "" || b.TotalPages <= 0 {
		return customErr.ErrBadRequest
	}
	if b.CurrentPage != nil && *b.CurrentPage > b.TotalPages {
		return customErr.ErrBadRequest
	}
	if b.Status == constants.BookStatusFinished {
		now := time.Now()
		b.CompletedAt = &now
		cp := b.TotalPages
		b.CurrentPage = &cp
	} else {
		b.CompletedAt = nil
		if b.Status == constants.BookStatusInLibrary || b.Status == constants.BookStatusNextToRead {
			b.CurrentPage = nil
		} else if b.CurrentPage == nil {
			cp := 0
			b.CurrentPage = &cp
		}
	}
	return s.repo.Update(ctx, b)
}
func (s *Service) UpdateStatus(ctx context.Context, userID, id uuid.UUID, status string, finishRating *int, finishReflection, finishHighlight *string) (*book.Book, error) {
	b, err := s.repo.GetByID(ctx, userID, id)
	if err != nil {
		return nil, err
	}
	b.Status = status
	if status == constants.BookStatusFinished {
		now := time.Now()
		b.CompletedAt = &now
		cp := b.TotalPages
		b.CurrentPage = &cp
		if finishRating != nil {
			b.FinishRating = finishRating
		}
		if finishReflection != nil {
			b.FinishReflection = finishReflection
		}
		if finishHighlight != nil {
			b.FinishHighlight = finishHighlight
		}
	}
	if status == constants.BookStatusCurrentlyRead && b.CurrentPage == nil {
		v := 0
		b.CurrentPage = &v
	}
	if status == constants.BookStatusNextToRead || status == constants.BookStatusInLibrary {
		b.CompletedAt = nil
		b.CurrentPage = nil
		b.FinishRating = nil
		b.FinishReflection = nil
		b.FinishHighlight = nil
	}
	return b, s.repo.Update(ctx, b)
}
func (s *Service) Summary(ctx context.Context, userID uuid.UUID) (map[string]int64, []book.Book, []book.Book, error) {
	counts, err := s.repo.SummaryCounts(ctx, userID)
	if err != nil {
		return nil, nil, nil, err
	}
	recent, err := s.repo.Recent(ctx, userID, 5)
	if err != nil {
		return nil, nil, nil, err
	}
	reading, _, err := s.repo.List(ctx, userID, repositories.BookFilter{Status: constants.BookStatusCurrentlyRead})
	if err != nil {
		return nil, nil, nil, err
	}
	return counts, recent, reading, nil
}

func (s *Service) Analytics(ctx context.Context, userID uuid.UUID) (*Analytics, error) {
	books, _, err := s.repo.List(ctx, userID, repositories.BookFilter{})
	if err != nil {
		return nil, err
	}

	now := time.Now()
	monthly := make([]ActivityPoint, 0, 6)
	for i := 5; i >= 0; i-- {
		month := now.AddDate(0, -i, 0)
		monthly = append(monthly, ActivityPoint{Label: month.Format("Jan"), Count: 0})
	}
	weekly := make([]ActivityPoint, 0, 8)
	for i := 7; i >= 0; i-- {
		week := now.AddDate(0, 0, -7*i)
		weekly = append(weekly, ActivityPoint{Label: week.Format("Jan 02"), Count: 0})
	}

	statusDistribution := map[string]int{
		constants.BookStatusInLibrary:     0,
		constants.BookStatusCurrentlyRead: 0,
		constants.BookStatusFinished:      0,
		constants.BookStatusNextToRead:    0,
	}

	var booksCompleted int64
	var activeReading int64
	booksCompletedThisMonth := 0
	totalPagesRead := 0
	for _, b := range books {
		statusDistribution[b.Status] += 1
		if b.Status == constants.BookStatusFinished {
			booksCompleted += 1
			if b.CompletedAt != nil && b.CompletedAt.Year() == now.Year() && b.CompletedAt.Month() == now.Month() {
				booksCompletedThisMonth += 1
			}
		}
		if b.Status == constants.BookStatusCurrentlyRead {
			activeReading += 1
		}
		if b.CurrentPage != nil {
			totalPagesRead += *b.CurrentPage
		}

		activityDate := b.UpdatedAt
		for i := range monthly {
			if activityDate.Year() == now.AddDate(0, -(5-i), 0).Year() && activityDate.Month() == now.AddDate(0, -(5-i), 0).Month() {
				monthly[i].Count += 1
			}
		}
		for i := range weekly {
			start := now.AddDate(0, 0, -7*(7-i))
			end := start.AddDate(0, 0, 7)
			if (activityDate.Equal(start) || activityDate.After(start)) && activityDate.Before(end) {
				weekly[i].Count += 1
			}
		}
	}

	totalBooks := int64(len(books))
	completionRate := 0
	if totalBooks > 0 {
		completionRate = int(float64(booksCompleted) / float64(totalBooks) * 100)
	}
	readingPace := booksCompletedThisMonth

	currentStreak := 0
	for i := len(weekly) - 1; i >= 0; i-- {
		if weekly[i].Count == 0 {
			break
		}
		currentStreak += 1
	}

	return &Analytics{
		BooksCompleted:      booksCompleted,
		ActiveReading:       activeReading,
		TotalBooks:          totalBooks,
		TotalPagesRead:      totalPagesRead,
		CompletionRate:      completionRate,
		ReadingPacePerMonth: readingPace,
		CurrentStreakWeeks:  currentStreak,
		StatusDistribution:  statusDistribution,
		MonthlyActivity:     monthly,
		WeeklyActivity:      weekly,
	}, nil
}

func (s *Service) ListNotes(ctx context.Context, userID, bookID uuid.UUID) ([]bookNote.BookNote, error) {
	if _, err := s.repo.GetByID(ctx, userID, bookID); err != nil {
		return nil, err
	}
	return s.repo.ListNotes(ctx, userID, bookID)
}

func (s *Service) CreateNote(ctx context.Context, userID, bookID uuid.UUID, note string, highlight *string) (*bookNote.BookNote, error) {
	if note == "" {
		return nil, customErr.ErrBadRequest
	}
	if _, err := s.repo.GetByID(ctx, userID, bookID); err != nil {
		return nil, err
	}
	n := &bookNote.BookNote{UserID: userID, BookID: bookID, Note: note, Highlight: highlight}
	return n, s.repo.CreateNote(ctx, n)
}

func (s *Service) DeleteNote(ctx context.Context, userID, bookID, noteID uuid.UUID) error {
	if _, err := s.repo.GetByID(ctx, userID, bookID); err != nil {
		return err
	}
	return s.repo.DeleteNote(ctx, userID, bookID, noteID)
}

func (s *Service) Insights(ctx context.Context, userID uuid.UUID) ([]map[string]string, error) {
	analytics, err := s.Analytics(ctx, userID)
	if err != nil {
		return nil, err
	}
	books, _, err := s.repo.List(ctx, userID, repositories.BookFilter{})
	if err != nil {
		return nil, err
	}

	insights := []map[string]string{}
	if analytics.CurrentStreakWeeks >= 2 {
		insights = append(insights, map[string]string{"tone": "positive", "messageKey": "dashboard.apiInsights.consistency", "message": "You are reading consistently for multiple weeks."})
	}
	if analytics.StatusDistribution[constants.BookStatusNextToRead]+analytics.StatusDistribution[constants.BookStatusInLibrary] >= 3 {
		insights = append(insights, map[string]string{"tone": "nudge", "messageKey": "dashboard.apiInsights.backlog", "message": "You have a healthy backlog waiting; pick one title to start this week."})
	}
	if analytics.ActiveReading > 2 {
		insights = append(insights, map[string]string{"tone": "focus", "messageKey": "dashboard.apiInsights.focus", "message": "You are juggling several active books. Finishing one may improve momentum."})
	}

	finishedBooks := 0
	shortFinished := 0
	for _, b := range books {
		if b.Status == constants.BookStatusFinished {
			finishedBooks += 1
			if b.TotalPages <= 280 {
				shortFinished += 1
			}
		}
	}
	if finishedBooks > 0 && shortFinished*2 >= finishedBooks {
		insights = append(insights, map[string]string{"tone": "pattern", "messageKey": "dashboard.apiInsights.shortBooks", "message": "You tend to finish shorter books faster. Queue one short book for quick wins."})
	}

	if len(insights) == 0 {
		insights = append(insights, map[string]string{"tone": "neutral", "messageKey": "dashboard.apiInsights.trackProgress", "message": "Track progress updates this week to unlock personalized insights."})
	}

	sort.SliceStable(insights, func(i, j int) bool { return insights[i]["tone"] < insights[j]["tone"] })
	return insights, nil
}
