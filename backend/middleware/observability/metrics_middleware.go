package observability

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"negar-backend/pkg/observability"
)

func MetricsMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		durationMS := float64(time.Since(start).Milliseconds())
		route := c.Path()
		if c.Route() != nil && c.Route().Path != "" {
			route = c.Route().Path
		}
		observability.ObserveRequest(c.Method(), route, c.Response().StatusCode(), durationMS)
		return err
	}
}
