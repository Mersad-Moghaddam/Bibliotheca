package handlers

import (
	"errors"

	"bibliotheca/backend/pkg/apperror"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func respondError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, apperror.ErrBadRequest):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	case errors.Is(err, apperror.ErrUnauthorized):
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	case errors.Is(err, apperror.ErrConflict):
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "already exists"})
	case errors.Is(err, apperror.ErrNotFound), errors.Is(err, gorm.ErrRecordNotFound):
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "resource not found"})
	case errors.Is(err, apperror.ErrRateLimited):
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{"error": "too many attempts"})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal server error"})
	}
}
