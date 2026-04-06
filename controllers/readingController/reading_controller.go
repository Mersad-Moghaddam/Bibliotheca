package readingController

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"libro-backend/apiSchema/readingSchema"
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
	return c.JSON(fiber.Map{"id": b.ID, "status": b.Status, "currentPage": b.CurrentPage, "remainingPages": remaining, "progressPercentage": percentage})
}
