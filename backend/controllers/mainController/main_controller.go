package mainController

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"negar-backend/middleware/requestctx"
	"negar-backend/pkg/apiresponse"
	"negar-backend/pkg/bookview"
	"negar-backend/pkg/observability"
	"negar-backend/pkg/reminders"
	"negar-backend/pkg/requestutil"
	"negar-backend/services/apiErrCode"
	"negar-backend/services/authService"
	"negar-backend/services/bookService"
	"negar-backend/services/mainlogic"
	"negar-backend/services/readingService"
	"negar-backend/statics/constants"
)

type MainService struct {
	books     *bookService.Service
	reading   *readingService.Service
	users     *authService.UserService
	readiness ReadinessChecker
}

type MainController struct{ service *MainService }

func NewMainController(service *MainService) *MainController {
	return &MainController{service: service}
}

func (c *MainController) Health(ctx *fiber.Ctx) error {
	return apiresponse.OK(ctx, fiber.Map{"status": constants.HealthStatusOK}, nil)
}

func (c *MainController) Ready(ctx *fiber.Ctx) error {
	if c.service.readiness != nil {
		if err := c.service.readiness.Check(ctx.Context()); err != nil {
			requestctx.LoggerFromCtx(ctx, zap.NewNop()).Warn("readiness_check_failed", zap.Error(err))
			return apiresponse.Error(ctx, fiber.StatusServiceUnavailable, "not_ready", "Service not ready.", nil)
		}
	}
	return apiresponse.OK(ctx, fiber.Map{"status": constants.HealthStatusOK}, nil)
}

func (c *MainController) Metrics(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "text/plain; version=0.0.4")
	return ctx.SendString(observability.MetricsText())
}

func (c *MainController) DashboardSummary(ctx *fiber.Ctx) error {
	uid, err := requestutil.UserID(ctx)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
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
	return apiresponse.OK(ctx, fiber.Map{
		"counts":           counts,
		"recentBooks":      bookview.SummaryList(recent),
		"currentlyReading": bookview.SummaryList(readingBooks),
		"goalProgress":     goals,
		"nextReminderAt":   reminders.NextReminderAt(time.Now(), u.ReminderEnabled, u.ReminderTime, u.ReminderFrequency),
	}, nil)
}

func (c *MainController) DashboardAnalytics(ctx *fiber.Ctx) error {
	uid, err := requestutil.UserID(ctx)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
	analytics, err := c.service.books.Analytics(ctx.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
	sessions, err := c.service.reading.RecentSessions(ctx.Context(), uid, "", 120)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
	view := mainlogic.BuildDashboardAnalyticsView(analytics.StatusDistribution, sessions)
	return apiresponse.OK(ctx, fiber.Map{"base": analytics, "trend": view.Trend, "consistencyScore": view.ConsistencyScore, "backlogHealth": view.BacklogHealth, "sessionPages": view.SessionPages}, nil)
}

func (c *MainController) DashboardInsights(ctx *fiber.Ctx) error {
	uid, err := requestutil.UserID(ctx)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
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
			insights = append(insights, map[string]string{"tone": "goal", "messageKey": "dashboard.apiInsights.goalHit", "period": g.Period, "message": "You hit your " + g.Period + " page goal. Great consistency."})
		}
	}
	return apiresponse.OK(ctx, fiber.Map{"items": insights}, nil)
}
