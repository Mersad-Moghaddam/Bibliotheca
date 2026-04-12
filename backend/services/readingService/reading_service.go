package readingService

import (
	"context"
	"errors"
	"math"
	"sort"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
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

func (s *Service) SaveGoals(ctx context.Context, userID uuid.UUID, weekly, monthly *GoalUpdateInput, applySuggestion bool) error {
	now := time.Now()
	if applySuggestion {
		overview, err := s.GetGoalsOverview(ctx, userID)
		if err != nil {
			return err
		}
		for _, sug := range overview.Suggestions {
			if sug.Period == "weekly" && weekly == nil {
				weekly = &GoalUpdateInput{TargetPages: sug.TargetPages, TargetBooks: sug.TargetBooks, Source: "applied_suggestion"}
			}
			if sug.Period == "monthly" && monthly == nil {
				monthly = &GoalUpdateInput{TargetPages: sug.TargetPages, TargetBooks: sug.TargetBooks, Source: "applied_suggestion"}
			}
		}
	}
	if weekly != nil {
		if err := validateInput(weekly); err != nil {
			return err
		}
		start, end := weekWindow(now)
		g := &readingGoal.ReadingGoal{UserID: userID, Period: "weekly", TargetPages: weekly.TargetPages, TargetBooks: weekly.TargetBooks, Source: fallbackSource(weekly.Source), StartDate: &start, EndDate: &end}
		if err := s.repo.UpsertGoal(ctx, g); err != nil {
			return err
		}
	}
	if monthly != nil {
		if err := validateInput(monthly); err != nil {
			return err
		}
		start, end := monthWindow(now)
		g := &readingGoal.ReadingGoal{UserID: userID, Period: "monthly", TargetPages: monthly.TargetPages, TargetBooks: monthly.TargetBooks, Source: fallbackSource(monthly.Source), StartDate: &start, EndDate: &end}
		if err := s.repo.UpsertGoal(ctx, g); err != nil {
			return err
		}
	}
	return nil
}

func validateInput(input *GoalUpdateInput) error {
	if input.TargetPages != nil && *input.TargetPages < 0 {
		return customErr.ErrBadRequest
	}
	if input.TargetBooks != nil && *input.TargetBooks < 0 {
		return customErr.ErrBadRequest
	}
	if input.TargetPages == nil && input.TargetBooks == nil {
		return customErr.ErrBadRequest
	}
	return nil
}

func fallbackSource(source string) string {
	if source == "suggested" || source == "applied_suggestion" || source == "manual" {
		return source
	}
	return "manual"
}

func (s *Service) GoalProgress(ctx context.Context, userID uuid.UUID) ([]GoalProgress, error) {
	overview, err := s.GetGoalsOverview(ctx, userID)
	if err != nil {
		return nil, err
	}
	result := make([]GoalProgress, 0, 2)
	for _, view := range []GoalPeriodView{overview.Weekly, overview.Monthly} {
		item := GoalProgress{Period: view.Period, PagesRead: view.PagesRead, BooksRead: view.BooksRead}
		if view.TargetPages != nil {
			item.PagesGoal = *view.TargetPages
			item.PagesPercent = int(float64(view.PagesRead) / math.Max(1, float64(*view.TargetPages)) * 100)
		}
		if view.TargetBooks != nil {
			item.BooksGoal = *view.TargetBooks
			item.BooksPercent = int(float64(view.BooksRead) / math.Max(1, float64(*view.TargetBooks)) * 100)
		}
		result = append(result, item)
	}
	return result, nil
}

func (s *Service) GetGoalsOverview(ctx context.Context, userID uuid.UUID) (*GoalOverview, error) {
	now := time.Now()
	weeklyStart, weeklyEnd := weekWindow(now)
	monthlyStart, monthlyEnd := monthWindow(now)
	sessions, err := s.repo.ListSessions(ctx, userID, 600)
	if err != nil {
		return nil, err
	}
	weeklyGoal, _ := s.repo.FindGoalByWindow(ctx, userID, "weekly", weeklyStart, weeklyEnd)
	monthlyGoal, _ := s.repo.FindGoalByWindow(ctx, userID, "monthly", monthlyStart, monthlyEnd)

	weeklyView := buildPeriodView("weekly", weeklyStart, weeklyEnd, weeklyGoal, sessions)
	monthlyView := buildPeriodView("monthly", monthlyStart, monthlyEnd, monthlyGoal, sessions)
	suggestions := s.buildSuggestions(ctx, userID, sessions)

	return &GoalOverview{Weekly: weeklyView, Monthly: monthlyView, Suggestions: suggestions}, nil
}

func buildPeriodView(period string, start, end time.Time, goal *readingGoal.ReadingGoal, sessions []readingSession.ReadingSession) GoalPeriodView {
	pagesRead, booksRead := aggregateInWindow(sessions, start, end)
	view := GoalPeriodView{Period: period, StartDate: start, EndDate: end, PagesRead: pagesRead, BooksRead: booksRead, Status: "no_goal"}
	if goal == nil {
		return view
	}
	view.TargetPages = goal.TargetPages
	view.TargetBooks = goal.TargetBooks
	view.Source = goal.Source

	maxPercent := 0
	hasTarget := false
	exceeded := false
	if goal.TargetPages != nil && *goal.TargetPages > 0 {
		hasTarget = true
		pp := int(float64(pagesRead) / float64(*goal.TargetPages) * 100)
		if pp > maxPercent {
			maxPercent = pp
		}
		if pagesRead > *goal.TargetPages {
			exceeded = true
		}
	}
	if goal.TargetBooks != nil && *goal.TargetBooks > 0 {
		hasTarget = true
		bp := int(float64(booksRead) / float64(*goal.TargetBooks) * 100)
		if bp > maxPercent {
			maxPercent = bp
		}
		if booksRead > *goal.TargetBooks {
			exceeded = true
		}
	}
	view.Percent = maxPercent
	view.Exceeded = exceeded
	if !hasTarget {
		view.Status = "no_goal"
		return view
	}
	if pagesRead == 0 && booksRead == 0 {
		view.Status = "not_started"
		return view
	}
	if exceeded {
		view.Status = "exceeded"
		return view
	}
	if maxPercent >= 100 {
		view.Status = "completed"
		return view
	}
	now := time.Now()
	elapsedRatio := float64(now.Sub(start)) / float64(end.Sub(start)+24*time.Hour)
	expectedRatio := int(math.Round(elapsedRatio * 100))
	if maxPercent+10 < expectedRatio {
		view.Status = "behind"
	} else if maxPercent >= expectedRatio {
		view.Status = "on_track"
	} else {
		view.Status = "in_progress"
	}
	return view
}

func aggregateInWindow(sessions []readingSession.ReadingSession, start, end time.Time) (int, int) {
	pages := 0
	books := map[string]struct{}{}
	for _, ses := range sessions {
		if !ses.Date.Before(start) && ses.Date.Before(end.Add(24*time.Hour)) {
			pages += ses.PagesRead
			books[ses.BookID.String()] = struct{}{}
		}
	}
	return pages, len(books)
}

func weekWindow(now time.Time) (time.Time, time.Time) {
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	start := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).AddDate(0, 0, -(weekday - 1))
	return start, start.AddDate(0, 0, 6)
}

func monthWindow(now time.Time) (time.Time, time.Time) {
	start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	return start, start.AddDate(0, 1, -1)
}

func (s *Service) buildSuggestions(ctx context.Context, userID uuid.UUID, sessions []readingSession.ReadingSession) []GoalSuggestion {
	signals := collectSignals(sessions)
	weeklyPages := recommendedWeeklyPages(signals)
	monthlyPages := recommendedMonthlyPages(signals)

	books30, err := s.repo.CountCompletedBooksBetween(ctx, userID, time.Now().AddDate(0, 0, -30), time.Now())
	if err == nil {
		signals.CompletedBooks30d = int(books30)
	}

	weeklyBooks, monthlyBooks := recommendBookTargets(signals)
	result := []GoalSuggestion{}
	if weeklyPages != nil || weeklyBooks != nil {
		reasonKey, reason := suggestionReason(signals.ActiveWeeks, signals.WeeklySessions)
		result = append(result, GoalSuggestion{Period: "weekly", TargetPages: weeklyPages, TargetBooks: weeklyBooks, Reason: reason, ReasonKey: reasonKey, Confidence: suggestionConfidence(signals.ActiveWeeks), Signals: signals})
	}
	if monthlyPages != nil || monthlyBooks != nil {
		reasonKey, reason := suggestionReason(signals.ActiveWeeks, signals.WeeklySessions)
		result = append(result, GoalSuggestion{Period: "monthly", TargetPages: monthlyPages, TargetBooks: monthlyBooks, Reason: reason, ReasonKey: reasonKey, Confidence: suggestionConfidence(signals.ActiveWeeks), Signals: signals})
	}
	return result
}

func collectSignals(sessions []readingSession.ReadingSession) Signals {
	now := time.Now()
	weeklyTotals := make([]int, 0, 6)
	for i := 0; i < 6; i++ {
		end := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).AddDate(0, 0, -(i * 7))
		start := end.AddDate(0, 0, -6)
		total := 0
		for _, s := range sessions {
			if !s.Date.Before(start) && s.Date.Before(end.Add(24*time.Hour)) {
				total += s.PagesRead
			}
		}
		weeklyTotals = append(weeklyTotals, total)
	}
	activeWeeks := 0
	for _, t := range weeklyTotals {
		if t > 0 {
			activeWeeks++
		}
	}
	monthlyTotals := []int{}
	for i := 0; i < 3; i++ {
		end := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location()).AddDate(0, -i+1, -1)
		start := time.Date(end.Year(), end.Month(), 1, 0, 0, 0, 0, now.Location())
		total := 0
		for _, s := range sessions {
			if !s.Date.Before(start) && s.Date.Before(end.Add(24*time.Hour)) {
				total += s.PagesRead
			}
		}
		monthlyTotals = append(monthlyTotals, total)
	}
	weekStart, weekEnd := weekWindow(now)
	weeklySessions := 0
	for _, s := range sessions {
		if !s.Date.Before(weekStart) && s.Date.Before(weekEnd.Add(24*time.Hour)) {
			weeklySessions++
		}
	}
	return Signals{RecentWeeklyPagesMedian: median(weeklyTotals), RecentMonthlyPagesMedian: median(monthlyTotals), WeeklySessions: weeklySessions, ActiveWeeks: activeWeeks}
}

func median(values []int) int {
	if len(values) == 0 {
		return 0
	}
	tmp := append([]int{}, values...)
	sort.Ints(tmp)
	mid := len(tmp) / 2
	if len(tmp)%2 == 0 {
		return (tmp[mid-1] + tmp[mid]) / 2
	}
	return tmp[mid]
}

func recommendedWeeklyPages(s Signals) *int {
	base := s.RecentWeeklyPagesMedian
	if base <= 0 {
		return nil
	}
	multiplier := 1.05
	if s.ActiveWeeks <= 2 {
		multiplier = 0.9
	}
	value := int(math.Round(float64(base)*multiplier/5.0) * 5)
	if value < 20 {
		value = 20
	}
	return &value
}

func recommendedMonthlyPages(s Signals) *int {
	if s.RecentMonthlyPagesMedian <= 0 && s.RecentWeeklyPagesMedian <= 0 {
		return nil
	}
	base := s.RecentMonthlyPagesMedian
	if base <= 0 {
		base = s.RecentWeeklyPagesMedian * 4
	}
	multiplier := 1.05
	if s.ActiveWeeks <= 2 {
		multiplier = 0.9
	}
	value := int(math.Round(float64(base)*multiplier/10.0) * 10)
	if value < 80 {
		value = 80
	}
	return &value
}

func recommendBookTargets(s Signals) (*int, *int) {
	if s.CompletedBooks30d <= 0 {
		return nil, nil
	}
	weekly := int(math.Max(1, float64(s.CompletedBooks30d)/4.0))
	monthly := int(math.Max(1, float64(s.CompletedBooks30d)))
	return &weekly, &monthly
}

func suggestionReason(activeWeeks, sessions int) (string, string) {
	if activeWeeks <= 2 {
		return "restart_pace", "Based on your recent restart pace, we kept this realistic."
	}
	if sessions >= 3 {
		return "consistency_stretch", "Based on your recent consistency, this is a gentle stretch target."
	}
	return "recent_pace", "Based on your recent reading pace over the last few weeks."
}

func suggestionConfidence(activeWeeks int) string {
	if activeWeeks >= 4 {
		return "high"
	}
	if activeWeeks >= 2 {
		return "medium"
	}
	return "low"
}

func IsNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}
