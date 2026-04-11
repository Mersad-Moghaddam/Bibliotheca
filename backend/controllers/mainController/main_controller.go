package mainController

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"libro-backend/pkg/apiresponse"
	"libro-backend/services/apiErrCode"
	"libro-backend/services/authService"
	"libro-backend/services/bookService"
	"libro-backend/services/readingService"
	"libro-backend/statics/constants"
)

type MainService struct {
	books   *bookService.Service
	reading *readingService.Service
	users   *authService.UserService
}

type MainController struct{ service *MainService }

func NewMainController(service *MainService) *MainController {
	return &MainController{service: service}
}

func (c *MainController) Health(ctx *fiber.Ctx) error {
	return apiresponse.OK(ctx, fiber.Map{"status": constants.HealthStatusOK}, nil)
}

func (c *MainController) Ready(ctx *fiber.Ctx) error {
	return apiresponse.OK(ctx, fiber.Map{"status": constants.HealthStatusOK}, nil)
}

func (c *MainController) DashboardSummary(ctx *fiber.Ctx) error {
	uid := parseUUID(ctx.Locals("userID").(string))
	counts, recent, readingBooks, err := c.service.books.Summary(ctx.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
	goals, err := c.service.reading.GoalProgress(ctx.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
	u, err := c.service.users.Get(ctx.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
	return apiresponse.OK(ctx, fiber.Map{"counts": counts, "recentBooks": withBooksComputed(recent), "currentlyReading": withBooksComputed(readingBooks), "goalProgress": goals, "nextReminderAt": nextReminderAt(u.ReminderEnabled, u.ReminderTime)}, nil)
}

func (c *MainController) DashboardAnalytics(ctx *fiber.Ctx) error {
	uid := parseUUID(ctx.Locals("userID").(string))
	analytics, err := c.service.books.Analytics(ctx.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
	sessions, err := c.service.reading.RecentSessions(ctx.Context(), uid, 120)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
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
	backlogCount := analytics.StatusDistribution[constants.BookStatusInLibrary] + analytics.StatusDistribution[constants.BookStatusNextToRead]
	if backlogCount >= 10 {
		backlogHealth = "heavy"
	} else if backlogCount <= 2 {
		backlogHealth = "light"
	}
	return apiresponse.OK(ctx, fiber.Map{"base": analytics, "trend": trend, "consistencyScore": consistency, "backlogHealth": backlogHealth, "sessionPages": totalPages}, nil)
}

func (c *MainController) DashboardInsights(ctx *fiber.Ctx) error {
	uid := parseUUID(ctx.Locals("userID").(string))
	insights, err := c.service.books.Insights(ctx.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
	goals, err := c.service.reading.GoalProgress(ctx.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
	for _, g := range goals {
		if g.PagesGoal > 0 && g.PagesPercent >= 100 {
			insights = append(insights, map[string]string{"tone": "goal", "message": "You hit your " + g.Period + " page goal. Great consistency."})
		}
	}
	return apiresponse.OK(ctx, fiber.Map{"items": insights}, nil)
}

func nextReminderAt(enabled bool, reminderTime string) *string {
	if !enabled {
		return nil
	}
	now := time.Now()
	candidate, err := time.ParseInLocation("15:04", reminderTime, now.Location())
	if err != nil {
		return nil
	}
	next := time.Date(now.Year(), now.Month(), now.Day(), candidate.Hour(), candidate.Minute(), 0, 0, now.Location())
	if !next.After(now) {
		next = next.Add(24 * time.Hour)
	}
	formatted := next.Format(time.RFC3339)
	return &formatted
}
