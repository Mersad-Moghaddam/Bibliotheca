package requestctx

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

const (
	RequestIDHeader = "X-Request-ID"
	loggerLocalKey  = "logger"
)

func RequestLogger(baseLogger *zap.Logger) fiber.Handler {
	return func(c *fiber.Ctx) error {
		requestID := strings.TrimSpace(c.Get(RequestIDHeader))
		if requestID == "" {
			requestID = strings.TrimSpace(c.GetRespHeader(RequestIDHeader))
		}

		requestLogger := baseLogger.With(
			zap.String("request_id", requestID),
			zap.String("method", c.Method()),
			zap.String("path", c.Path()),
			zap.String("user_agent", c.Get(fiber.HeaderUserAgent)),
		)
		c.Locals(loggerLocalKey, requestLogger)

		start := time.Now()
		err := c.Next()
		duration := time.Since(start)

		statusCode := c.Response().StatusCode()
		fields := []zap.Field{
			zap.Int("status_code", statusCode),
			zap.Int64("duration_ms", duration.Milliseconds()),
			zap.String("latency", duration.String()),
			zap.String("ip", c.IP()),
		}

		if userID, ok := c.Locals("userID").(string); ok && userID != "" {
			fields = append(fields, zap.String("user_id", userID))
		}

		switch {
		case err != nil:
			requestLogger.Error("request_failed", append(fields, zap.Error(err))...)
		case statusCode >= fiber.StatusInternalServerError:
			requestLogger.Error("request_completed", fields...)
		case statusCode >= fiber.StatusBadRequest:
			requestLogger.Warn("request_completed", fields...)
		default:
			requestLogger.Info("request_completed", fields...)
		}

		return err
	}
}

func LoggerFromCtx(c *fiber.Ctx, fallback *zap.Logger) *zap.Logger {
	if c == nil {
		return fallback
	}
	if l, ok := c.Locals(loggerLocalKey).(*zap.Logger); ok && l != nil {
		return l
	}
	return fallback
}
