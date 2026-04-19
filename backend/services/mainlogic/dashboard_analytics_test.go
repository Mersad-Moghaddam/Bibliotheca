package mainlogic

import (
	"testing"
	"time"

	"negar-backend/models/readingSession"
	"negar-backend/statics/constants"
)

func TestBuildDashboardAnalyticsView(t *testing.T) {
	now := time.Now()
	sessions := []readingSession.ReadingSession{
		{Date: now, PagesRead: 15, Duration: 20},
		{Date: now.AddDate(0, 0, -1), PagesRead: 10, Duration: 15},
	}
	view := BuildDashboardAnalyticsView(map[string]int{
		constants.BookStatusInLibrary:  1,
		constants.BookStatusNextToRead: 1,
	}, sessions)

	if got := view.SessionPages; got != 25 {
		t.Fatalf("expected 25 pages, got %d", got)
	}
	if view.BacklogHealth != "light" {
		t.Fatalf("expected backlogHealth light, got %s", view.BacklogHealth)
	}
	if len(view.Trend) != 2 {
		t.Fatalf("expected trend length 2, got %d", len(view.Trend))
	}
}

func TestBuildDashboardAnalyticsViewBacklogHeavyAndConsistencyCap(t *testing.T) {
	sessions := make([]readingSession.ReadingSession, 0, 40)
	now := time.Now()
	for i := 0; i < 40; i++ {
		sessions = append(sessions, readingSession.ReadingSession{
			Date:      now.AddDate(0, 0, -i),
			PagesRead: 5,
		})
	}
	view := BuildDashboardAnalyticsView(map[string]int{
		constants.BookStatusInLibrary:  8,
		constants.BookStatusNextToRead: 4,
	}, sessions)
	if view.BacklogHealth != "heavy" {
		t.Fatalf("expected heavy backlog, got %s", view.BacklogHealth)
	}
	if view.ConsistencyScore != 100 {
		t.Fatalf("expected consistency capped at 100, got %d", view.ConsistencyScore)
	}
}
