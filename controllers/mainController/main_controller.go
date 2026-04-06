package mainController

import (
	"github.com/gofiber/fiber/v2"
	"libro-backend/services/apiErrCode"
	"libro-backend/services/bookService"
	"libro-backend/statics/constants"
)

type MainService struct{ books *bookService.Service }

type MainController struct{ service *MainService }

func NewMainController(service *MainService) *MainController {
	return &MainController{service: service}
}

func (c *MainController) Health(ctx *fiber.Ctx) error {
	return ctx.JSON(fiber.Map{"status": constants.HealthStatusOK})
}
func (c *MainController) DashboardSummary(ctx *fiber.Ctx) error {
	uid := parseUUID(ctx.Locals("userID").(string))
	counts, recent, reading, err := c.service.books.Summary(ctx.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(ctx, err)
	}
	return ctx.JSON(fiber.Map{"counts": counts, "recentBooks": withBooksComputed(recent), "currentlyReading": withBooksComputed(reading)})
}
