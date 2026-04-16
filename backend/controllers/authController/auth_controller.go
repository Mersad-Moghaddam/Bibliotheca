package authController

import (
	"crypto/sha256"
	"encoding/hex"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"libro-backend/apiSchema/authSchema"
	"libro-backend/middleware/requestctx"
	"libro-backend/pkg/apiresponse"
	"libro-backend/pkg/validation"
	"libro-backend/services/apiErrCode"
	"libro-backend/services/authService"
	"libro-backend/statics/customErr"
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
	validation.StringLength(req.Password, "password", 8, 72, errs)
	validation.Email(req.Email, "email", errs)
	if req.Password != req.ConfirmPassword {
		errs.Add("confirmPassword", "must match password")
	}
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	u, err := h.service.Auth.Register(c.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		if err == customErr.ErrEmailAlreadyExists {
			requestctx.LoggerFromCtx(c, zap.NewNop()).Warn("auth_register_conflict", safeAuthLogFields(c, req.Email)...)
		}
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
		if err == customErr.ErrInvalidCredentials || err == customErr.ErrRateLimited {
			fields := append(safeAuthLogFields(c, req.Email),
				zap.String("reason", mapLoginRejectReason(err)),
				zap.Int64("rate_limit_remaining", remaining),
			)
			requestctx.LoggerFromCtx(c, zap.NewNop()).Warn("auth_login_rejected", fields...)
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
		if err == customErr.ErrInvalidRefreshToken {
			requestctx.LoggerFromCtx(c, zap.NewNop()).Warn("auth_refresh_rejected", zap.String("ip", c.IP()))
		}
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
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	u, err := h.service.User.Get(c.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"id": u.ID, "name": u.Name, "email": u.Email, "createdAt": u.CreatedAt}, nil)
}

func safeAuthLogFields(c *fiber.Ctx, email string) []zap.Field {
	normalizedEmail := strings.ToLower(strings.TrimSpace(email))
	hash := sha256.Sum256([]byte(normalizedEmail))
	return []zap.Field{
		zap.String("ip", c.IP()),
		zap.String("email_hash", hex.EncodeToString(hash[:8])),
	}
}

func mapLoginRejectReason(err error) string {
	if err == customErr.ErrRateLimited {
		return "rate_limited"
	}
	return "invalid_credentials"
}
