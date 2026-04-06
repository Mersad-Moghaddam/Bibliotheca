package apiErrCode

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"libro-backend/statics/customErr"
	"libro-backend/statics/translate"
)

func RespondError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, customErr.ErrBadRequest):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": translate.Messages["invalidRequest"]})
	case errors.Is(err, customErr.ErrUnauthorized):
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": translate.Messages["unauthorized"]})
	case errors.Is(err, customErr.ErrConflict):
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": translate.Messages["alreadyExists"]})
	case errors.Is(err, customErr.ErrNotFound), errors.Is(err, gorm.ErrRecordNotFound):
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": translate.Messages["notFound"]})
	case errors.Is(err, customErr.ErrRateLimited):
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{"error": translate.Messages["rateLimited"]})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": translate.Messages["internal"]})
	}
}
