package requestutil

import (
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func UserID(c *fiber.Ctx) (uuid.UUID, error) {
	raw, ok := c.Locals("userID").(string)
	if !ok || strings.TrimSpace(raw) == "" {
		return uuid.Nil, fiber.ErrUnauthorized
	}
	return ParseUUID(raw, "userID")
}

func UserRole(c *fiber.Ctx) string {
	raw, _ := c.Locals("userRole").(string)
	return strings.TrimSpace(raw)
}

func ParamUUID(c *fiber.Ctx, key string) (uuid.UUID, error) {
	return ParseUUID(c.Params(key), key)
}

func ParseUUID(value, field string) (uuid.UUID, error) {
	id, err := uuid.Parse(strings.TrimSpace(value))
	if err != nil {
		return uuid.Nil, fmt.Errorf("%s: %w", field, fiber.ErrBadRequest)
	}
	return id, nil
}

func ParseDate(value string) (time.Time, error) {
	parsed, err := time.Parse("2006-01-02", strings.TrimSpace(value))
	if err != nil {
		return time.Time{}, fiber.ErrBadRequest
	}
	return parsed, nil
}
