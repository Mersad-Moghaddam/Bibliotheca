package apiErrCode

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"negar-backend/pkg/apiresponse"
	"negar-backend/statics/customErr"
)

func RespondError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, customErr.ErrBadRequest):
		return apiresponse.Error(c, fiber.StatusBadRequest, "bad_request", "Invalid request.", nil)
	case errors.Is(err, customErr.ErrUnauthorized):
		return apiresponse.Error(c, fiber.StatusUnauthorized, "unauthorized", "Unauthorized.", nil)
	case errors.Is(err, customErr.ErrInvalidCredentials):
		return apiresponse.Error(c, fiber.StatusUnauthorized, "invalid_credentials", "Email or password is incorrect.", nil)
	case errors.Is(err, customErr.ErrInvalidRefreshToken):
		return apiresponse.Error(c, fiber.StatusUnauthorized, "invalid_refresh_token", "Refresh token is invalid or expired.", nil)
	case errors.Is(err, customErr.ErrConflict):
		return apiresponse.Error(c, fiber.StatusConflict, "conflict", "Resource conflict.", nil)
	case errors.Is(err, customErr.ErrEmailAlreadyExists):
		return apiresponse.Error(c, fiber.StatusConflict, "email_already_exists", "An account with this email already exists.", nil)
	case errors.Is(err, customErr.ErrNotFound), errors.Is(err, gorm.ErrRecordNotFound):
		return apiresponse.Error(c, fiber.StatusNotFound, "not_found", "Resource not found.", nil)
	case errors.Is(err, customErr.ErrRateLimited):
		return apiresponse.Error(c, fiber.StatusTooManyRequests, "rate_limited", "Too many requests.", nil)
	case errors.Is(err, fiber.ErrBadRequest):
		return apiresponse.Error(c, fiber.StatusBadRequest, "bad_request", "Invalid request payload.", nil)
	default:
		return apiresponse.Error(c, fiber.StatusInternalServerError, "internal_error", "Internal server error.", nil)
	}
}
