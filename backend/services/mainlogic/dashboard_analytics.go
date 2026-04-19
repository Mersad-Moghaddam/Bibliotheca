package mainlogic

import (
	"github.com/gofiber/fiber/v2"
	"negar-backend/models/readingSession"
	"negar-backend/statics/constants"
)

type DashboardAnalyticsView struct {
	Trend            []fiber.Map
	ConsistencyScore int
	BacklogHealth    string
	SessionPages     int
}

func BuildDashboardAnalyticsView(statusDistribution map[string]int, sessions []readingSession.ReadingSession) DashboardAnalyticsView {
	trend := make([]fiber.Map, 0, len(sessions))
	activeDays := map[string]struct{}{}
	totalPages := 0
	for _, s := range sessions {
		day := s.Date.Format("2006-01-02")
		activeDays[day] = struct{}{}
		totalPages += s.PagesRead
		trend = append(trend, fiber.Map{"date": day, "pages": s.PagesRead, "duration": s.Duration})
	}

	consistency := 0
	if len(sessions) > 0 {
		consistency = int(float64(len(activeDays)) / 30.0 * 100)
		if consistency > 100 {
			consistency = 100
		}
	}

	backlogHealth := "balanced"
	backlogCount := statusDistribution[constants.BookStatusInLibrary] + statusDistribution[constants.BookStatusNextToRead]
	if backlogCount >= 10 {
		backlogHealth = "heavy"
	} else if backlogCount <= 2 {
		backlogHealth = "light"
	}

	return DashboardAnalyticsView{
		Trend:            trend,
		ConsistencyScore: consistency,
		BacklogHealth:    backlogHealth,
		SessionPages:     totalPages,
	}
}
