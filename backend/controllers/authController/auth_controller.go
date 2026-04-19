package authController

import (
	"errors"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"negar-backend/apiSchema/authSchema"
	"negar-backend/middleware/requestctx"
	"negar-backend/pkg/apiresponse"
	"negar-backend/pkg/observability"
	"negar-backend/pkg/requestutil"
	"negar-backend/pkg/validation"
	"negar-backend/services/apiErrCode"
	"negar-backend/services/authService"
	"negar-backend/statics/customErr"
)

type ServiceBridge struct {
	Auth *authService.Service
	User *authService.UserService
}

type AuthController struct{ service *ServiceBridge }

func NewAuthController(service *ServiceBridge) *AuthController {
	return &AuthController{service: service}
}

func (h *AuthController) Register(c *fiber.Ctx) error {
	var req authSchema.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	errs := validation.Errors{}
	req.Name = validation.Required(req.Name, "name", errs)
	req.Email = validation.Required(req.Email, "email", errs)
	req.Password = validation.Required(req.Password, "password", errs)
	validation.StringLength(req.Name, "name", 2, 120, errs)
	validation.StringLength(req.Email, "email", 5, 160, errs)
	validation.StringLength(req.Password, "password", validation.MinPasswordLength, validation.MaxPasswordLength, errs)
	validation.Email(req.Email, "email", errs)
	if req.Password != req.ConfirmPassword {
		errs.Add("confirmPassword", "must match password")
	}
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	u, err := h.service.Auth.Register(c.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.Created(c, fiber.Map{"user": fiber.Map{"id": u.ID, "name": u.Name, "email": u.Email}})
}
func (h *AuthController) Login(c *fiber.Ctx) error {
	var req authSchema.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	errs := validation.Errors{}
	req.Email = validation.Required(req.Email, "email", errs)
	req.Password = validation.Required(req.Password, "password", errs)
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	u, tokens, remaining, err := h.service.Auth.Login(c.Context(), c.IP(), req.Email, req.Password)
	if err != nil {
		reqLogger := requestctx.LoggerFromCtx(c, zap.NewNop())
		switch {
		case errors.Is(err, customErr.ErrRateLimited):
			reqLogger.Warn("auth_login_rate_limited")
			observability.IncRateLimited()
			observability.IncAuthFailure("rate_limited")
		case errors.Is(err, customErr.ErrInvalidCredentials):
			reqLogger.Warn("auth_login_invalid_credentials")
			observability.IncAuthFailure("invalid_credentials")
		default:
			reqLogger.Error("auth_login_failed", zap.Error(err))
			observability.IncAuthFailure("unknown")
		}
		return apiErrCode.RespondError(c, err)
	}
	c.Set("X-RateLimit-Remaining", strconv.FormatInt(remaining, 10))
	return apiresponse.OK(c, fiber.Map{"user": fiber.Map{"id": u.ID, "name": u.Name, "email": u.Email}, "tokens": tokens}, nil)
}
func (h *AuthController) Refresh(c *fiber.Ctx) error {
	var req authSchema.RefreshRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	errs := validation.Errors{}
	req.RefreshToken = validation.Required(req.RefreshToken, "refreshToken", errs)
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	tp, err := h.service.Auth.Refresh(c.Context(), req.RefreshToken)
	if err != nil {
		requestctx.LoggerFromCtx(c, zap.NewNop()).Warn("auth_refresh_failed", zap.Error(err))
		observability.IncRefreshFailure()
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"tokens": tp}, nil)
}
func (h *AuthController) Logout(c *fiber.Ctx) error {
	var req authSchema.RefreshRequest
	if err := c.BodyParser(&req); err == nil && strings.TrimSpace(req.RefreshToken) != "" {
		h.service.Auth.Logout(c.Context(), req.RefreshToken)
	}
	return apiresponse.OK(c, fiber.Map{"message": "logged out"}, nil)
}
func (h *AuthController) Me(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	u, err := h.service.User.Get(c.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"id": u.ID, "name": u.Name, "email": u.Email, "createdAt": u.CreatedAt}, nil)
}
