package readingService

import (
	"time"

	"negar-backend/repositories"
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

type GoalUpdateInput struct {
	TargetPages *int
	TargetBooks *int
	Source      string
}

type GoalPeriodView struct {
	Period      string    `json:"period"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
	TargetPages *int      `json:"targetPages,omitempty"`
	TargetBooks *int      `json:"targetBooks,omitempty"`
	Source      string    `json:"source,omitempty"`
	PagesRead   int       `json:"pagesRead"`
	BooksRead   int       `json:"booksRead"`
	Percent     int       `json:"percent"`
	Status      string    `json:"status"`
	Exceeded    bool      `json:"exceeded"`
}

type GoalSuggestion struct {
	Period      string  `json:"period"`
	TargetPages *int    `json:"targetPages,omitempty"`
	TargetBooks *int    `json:"targetBooks,omitempty"`
	Reason      string  `json:"reason"`
	ReasonKey   string  `json:"reasonKey"`
	Confidence  string  `json:"confidence"`
	Signals     Signals `json:"signals"`
}

type Signals struct {
	RecentWeeklyPagesMedian  int `json:"recentWeeklyPagesMedian"`
	RecentMonthlyPagesMedian int `json:"recentMonthlyPagesMedian"`
	WeeklySessions           int `json:"weeklySessions"`
	ActiveWeeks              int `json:"activeWeeks"`
	CompletedBooks30d        int `json:"completedBooks30d"`
}

type GoalOverview struct {
	Weekly      GoalPeriodView   `json:"weekly"`
	Monthly     GoalPeriodView   `json:"monthly"`
	Suggestions []GoalSuggestion `json:"suggestions"`
}

func New(repo repositories.ReadingProgressRepository) *Service { return &Service{repo: repo} }
