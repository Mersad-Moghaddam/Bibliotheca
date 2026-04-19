package auth

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"negar-backend/middleware/requestctx"
	"negar-backend/pkg/apiresponse"
	"negar-backend/pkg/observability"
	"negar-backend/pkg/security"
)

func AuthMiddleware(jwtSecret string, logger *zap.Logger) fiber.Handler {
	return func(c *fiber.Ctx) error {
		reqLogger := requestctx.LoggerFromCtx(c, logger)
		authHeader := c.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			reqLogger.Warn("auth_missing_bearer_token")
			observability.IncAuthFailure("missing_bearer")
			return apiresponse.Error(c, fiber.StatusUnauthorized, "unauthorized", "Missing bearer token", nil)
		}
		token := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := security.ParseToken(jwtSecret, token)
		if err != nil || claims.Type != "access" {
			reqLogger.Warn("auth_invalid_access_token")
			observability.IncAuthFailure("invalid_access_token")
			return apiresponse.Error(c, fiber.StatusUnauthorized, "unauthorized", "Invalid access token", nil)
		}
		c.Locals("userID", claims.UserID)
		return c.Next()
	}
}
