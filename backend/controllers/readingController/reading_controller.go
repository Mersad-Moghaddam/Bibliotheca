package readingController

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"libro-backend/apiSchema/readingSchema"
	"libro-backend/models/readingGoal"
	"libro-backend/models/readingSession"
	"libro-backend/pkg/apiresponse"
	"libro-backend/pkg/validation"
	"libro-backend/services/apiErrCode"
	"libro-backend/services/readingService"
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
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	id, _ := uuid.Parse(c.Params("id"))
	b, err := h.service.Reading.UpdateProgress(c.Context(), uid, id, req.CurrentPage)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	remaining := b.TotalPages - req.CurrentPage
	if remaining < 0 {
		remaining = 0
	}
	percentage := 0
	if b.TotalPages > 0 {
		percentage = int(float64(req.CurrentPage) / float64(b.TotalPages) * 100)
	}
	return apiresponse.OK(c, fiber.Map{"id": b.ID, "status": b.Status, "currentPage": b.CurrentPage, "remainingPages": remaining, "progressPercentage": percentage}, nil)
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
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	bookID, err := uuid.Parse(req.BookID)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	date := time.Now()
	if req.Date != "" {
		if parsed, parseErr := time.Parse("2006-01-02", req.Date); parseErr == nil {
			date = parsed
		}
	}
	session := &readingSession.ReadingSession{UserID: uid, BookID: bookID, Date: date, Duration: req.Duration, PagesRead: req.PagesRead}
	if err := h.service.Reading.CreateSession(c.Context(), session); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.Created(c, session)
}

func (h *ReadingController) ListSessions(c *fiber.Ctx) error {
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	sessions, err := h.service.Reading.RecentSessions(c.Context(), uid, 50)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"items": sessions}, nil)
}

func (h *ReadingController) UpsertGoal(c *fiber.Ctx) error {
	var req readingSchema.GoalRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	errs := validation.Errors{}
	allowed := map[string]struct{}{"weekly": {}, "monthly": {}}
	validation.Enum(req.Period, "period", allowed, errs)
	validation.MinInt(req.PagesGoal, "pages", 0, errs)
	validation.MinInt(req.BooksGoal, "books", 0, errs)
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	goal := &readingGoal.ReadingGoal{UserID: uid, Period: req.Period, PagesGoal: req.PagesGoal, BooksGoal: req.BooksGoal}
	if err := h.service.Reading.SaveGoal(c.Context(), goal); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, goal, nil)
}

func (h *ReadingController) Goals(c *fiber.Ctx) error {
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	goals, err := h.service.Reading.GoalProgress(c.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"items": goals}, nil)
}
