package auth

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"libro-backend/pkg/security"
)

func AuthMiddleware(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "missing token"})
		}
		token := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := security.ParseToken(jwtSecret, token)
		if err != nil || claims.Type != "access" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid token"})
		}
		c.Locals("userID", claims.UserID)
		return c.Next()
	}
}
