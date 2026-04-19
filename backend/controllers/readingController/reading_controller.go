package readingController

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"negar-backend/apiSchema/readingSchema"
	"negar-backend/models/readingSession"
	"negar-backend/pkg/apiresponse"
	"negar-backend/pkg/bookview"
	"negar-backend/pkg/requestutil"
	"negar-backend/pkg/validation"
	"negar-backend/services/apiErrCode"
	"negar-backend/services/readingService"
)

type ServiceBridge struct{ Reading *readingService.Service }

type ReadingController struct{ service *ServiceBridge }

func NewReadingController(service *ServiceBridge) *ReadingController {
	return &ReadingController{service: service}
}

func (h *ReadingController) UpdateProgress(c *fiber.Ctx) error {
	var req readingSchema.ProgressRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	errs := validation.Errors{}
	validation.MinInt(req.CurrentPage, "currentPage", 0, errs)
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	b, err := h.service.Reading.UpdateProgress(c.Context(), uid, id, req.CurrentPage)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	remaining, percentage := bookview.ProgressStats(b)
	return apiresponse.OK(c, fiber.Map{
		"id":                 b.ID,
		"status":             b.Status,
		"currentPage":        b.CurrentPage,
		"remainingPages":     remaining,
		"progressPercentage": percentage,
	}, nil)
}

func (h *ReadingController) AddSession(c *fiber.Ctx) error {
	var req readingSchema.SessionRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	errs := validation.Errors{}
	validation.Required(req.BookID, "bookId", errs)
	validation.MinInt(req.Duration, "duration", 1, errs)
	validation.MinInt(req.PagesRead, "pages", 0, errs)
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	bookID, err := requestutil.ParseUUID(req.BookID, "bookId")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	date := time.Now()
	if req.Date != "" {
		date, err = requestutil.ParseDate(req.Date)
		if err != nil {
			return apiErrCode.RespondError(c, err)
		}
	}
	session := &readingSession.ReadingSession{UserID: uid, BookID: bookID, Date: date, Duration: req.Duration, PagesRead: req.PagesRead}
	if err := h.service.Reading.CreateSession(c.Context(), session); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.Created(c, session)
}

func (h *ReadingController) ListSessions(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	bookIDParam := c.Query("bookId")
	limit := 50
	if bookIDParam != "" {
		limit = 0
	}
	sessions, err := h.service.Reading.RecentSessions(c.Context(), uid, bookIDParam, limit)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"items": sessions}, nil)
}

func (h *ReadingController) UpsertGoal(c *fiber.Ctx) error {
	var req readingSchema.GoalUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if err := h.service.Reading.SaveGoals(c.Context(), uid, mapInput(req.Weekly), mapInput(req.Monthly), req.ApplySuggestion); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	overview, err := h.service.Reading.GetGoalsOverview(c.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, overview, nil)
}

func mapInput(in *readingSchema.GoalTargetRequest) *readingService.GoalUpdateInput {
	if in == nil {
		return nil
	}
	return &readingService.GoalUpdateInput{TargetPages: in.Pages, TargetBooks: in.Books, Source: "manual"}
}

func (h *ReadingController) Goals(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	overview, err := h.service.Reading.GetGoalsOverview(c.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, overview, nil)
}
