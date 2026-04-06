package handlers

import (
	"bibliotheca/backend/internal/application"
	"github.com/gofiber/fiber/v2"
)

type DashboardHandler struct{ service *application.DashboardService }

func NewDashboardHandler(service *application.DashboardService) *DashboardHandler {
	return &DashboardHandler{service: service}
}
func (h *DashboardHandler) Summary(c *fiber.Ctx) error {
	s, err := h.service.Summary(c.Context(), parseUUID(c.Locals("userID").(string)))
	if err != nil {
		return respondError(c, err)
	}
	return c.JSON(s)
}
