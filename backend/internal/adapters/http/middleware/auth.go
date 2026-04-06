package middleware

import (
	"strings"

	"bibliotheca/backend/pkg/utils"
	"github.com/gofiber/fiber/v2"
)

func AuthMiddleware(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "missing token"})
		}
		token := strings.TrimPrefix(auth, "Bearer ")
		claims, err := utils.ParseToken(jwtSecret, token)
		if err != nil || claims.Type != "access" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid token"})
		}
		c.Locals("userID", claims.UserID)
		return c.Next()
	}
}
