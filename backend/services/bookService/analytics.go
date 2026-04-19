package bookService

import (
	"context"
	"sort"
	"time"

	"github.com/google/uuid"
	"negar-backend/repositories"
	"negar-backend/statics/constants"
)

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
