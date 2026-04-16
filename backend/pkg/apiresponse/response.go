package apiresponse

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

type ValidationDetails struct {
	Fields map[string]string `json:"fields"`
}

func OK(c *fiber.Ctx, data any, meta any) error {
	resp := fiber.Map{"data": data}
	if meta != nil {
		resp["meta"] = meta
	}
	return c.JSON(resp)
}

func Created(c *fiber.Ctx, data any) error {
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": data})
}

func Error(c *fiber.Ctx, status int, code, message string, details any) error {
	merged := mergeDetailsWithRequestID(c, details)
	return c.Status(status).JSON(ErrorResponse{Code: code, Message: message, Details: merged})
}

func ValidationError(c *fiber.Ctx, fields map[string]string) error {
	return Error(c, fiber.StatusBadRequest, "validation_error", "Invalid request data.", fiber.Map{"fields": fields})
}

func mergeDetailsWithRequestID(c *fiber.Ctx, details any) any {
	requestID := strings.TrimSpace(c.GetRespHeader("X-Request-ID"))
	if requestID == "" {
		requestID = strings.TrimSpace(c.Get("X-Request-ID"))
	}
	if requestID == "" {
		return details
	}

	detailMap := fiber.Map{"requestId": requestID}
	if detailsMap, ok := details.(map[string]string); ok {
		for k, v := range detailsMap {
			detailMap[k] = v
		}
		return detailMap
	}
	if detailsMap, ok := details.(fiber.Map); ok {
		for k, v := range detailsMap {
			detailMap[k] = v
		}
		return detailMap
	}
	if details != nil {
		detailMap["info"] = details
	}
	return detailMap
}
