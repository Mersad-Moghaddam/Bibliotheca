package readingService

import (
	"context"
	"math"
	"time"

	"github.com/google/uuid"
	"negar-backend/models/readingEvent"
	"negar-backend/models/readingGoal"
	"negar-backend/models/readingSession"
	"negar-backend/statics/customErr"
)

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
	sessions, err := s.repo.ListSessions(ctx, userID, nil, 600)
	if err != nil {
		return nil, err
	}
	eventStart := monthlyStart.AddDate(0, -5, 0)
	events, err := s.repo.ListEventsBetween(ctx, userID, eventStart, now)
	if err != nil {
		return nil, err
	}
	weeklyGoal, _ := s.repo.FindGoalByWindow(ctx, userID, "weekly", weeklyStart, weeklyEnd)
	monthlyGoal, _ := s.repo.FindGoalByWindow(ctx, userID, "monthly", monthlyStart, monthlyEnd)

	useSessionsFallback := len(events) == 0
	weeklyView := buildPeriodView("weekly", weeklyStart, weeklyEnd, weeklyGoal, events, sessions, useSessionsFallback)
	monthlyView := buildPeriodView("monthly", monthlyStart, monthlyEnd, monthlyGoal, events, sessions, useSessionsFallback)
	suggestions := s.buildSuggestions(ctx, userID, sessions, events, useSessionsFallback)

	return &GoalOverview{Weekly: weeklyView, Monthly: monthlyView, Suggestions: suggestions}, nil
}

func buildPeriodView(period string, start, end time.Time, goal *readingGoal.ReadingGoal, events []readingEvent.ReadingEvent, sessions []readingSession.ReadingSession, useSessionsFallback bool) GoalPeriodView {
	pagesRead, booksRead := aggregateInWindow(events, sessions, start, end, useSessionsFallback)
	if pagesRead < 0 {
		pagesRead = 0
	}
	if booksRead < 0 {
		booksRead = 0
	}
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

func aggregateInWindow(events []readingEvent.ReadingEvent, sessions []readingSession.ReadingSession, start, end time.Time, useSessionsFallback bool) (int, int) {
	pages := 0
	books := 0
	if useSessionsFallback {
		booksByID := map[string]struct{}{}
		for _, ses := range sessions {
			if !ses.Date.Before(start) && ses.Date.Before(end.Add(24*time.Hour)) {
				pages += ses.PagesRead
				booksByID[ses.BookID.String()] = struct{}{}
			}
		}
		return pages, len(booksByID)
	}
	for _, event := range events {
		if !event.EventDate.Before(start) && event.EventDate.Before(end.Add(24*time.Hour)) {
			pages += event.PagesDelta
			books += event.CompletedDelta
		}
	}
	return pages, books
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
