package readingService

import (
	"context"
	"math"
	"sort"
	"time"

	"github.com/google/uuid"
	"negar-backend/models/readingEvent"
	"negar-backend/models/readingSession"
)

func (s *Service) buildSuggestions(ctx context.Context, userID uuid.UUID, sessions []readingSession.ReadingSession, events []readingEvent.ReadingEvent, useSessionsFallback bool) []GoalSuggestion {
	signals := collectSignals(sessions, events, useSessionsFallback)
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

func collectSignals(sessions []readingSession.ReadingSession, events []readingEvent.ReadingEvent, useSessionsFallback bool) Signals {
	now := time.Now()
	weeklyTotals := make([]int, 0, 6)
	for i := 0; i < 6; i++ {
		end := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).AddDate(0, 0, -(i * 7))
		start := end.AddDate(0, 0, -6)
		total := 0
		if useSessionsFallback {
			for _, ses := range sessions {
				if !ses.Date.Before(start) && ses.Date.Before(end.Add(24*time.Hour)) {
					total += ses.PagesRead
				}
			}
		} else {
			for _, event := range events {
				if !event.EventDate.Before(start) && event.EventDate.Before(end.Add(24*time.Hour)) {
					total += event.PagesDelta
				}
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
		if useSessionsFallback {
			for _, ses := range sessions {
				if !ses.Date.Before(start) && ses.Date.Before(end.Add(24*time.Hour)) {
					total += ses.PagesRead
				}
			}
		} else {
			for _, event := range events {
				if !event.EventDate.Before(start) && event.EventDate.Before(end.Add(24*time.Hour)) {
					total += event.PagesDelta
				}
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
