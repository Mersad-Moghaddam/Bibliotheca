package authController

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"libro-backend/apiSchema/authSchema"
	"libro-backend/services/apiErrCode"
	"libro-backend/services/authService"
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
	if err := c.BodyParser(&req); err != nil || req.Password != req.ConfirmPassword {
		return apiErrCode.RespondError(c, err)
	}
	u, err := h.service.Auth.Register(c.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"user": fiber.Map{"id": u.ID, "name": u.Name, "email": u.Email}})
}
func (h *AuthController) Login(c *fiber.Ctx) error {
	var req authSchema.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	u, tokens, err := h.service.Auth.Login(c.Context(), c.IP(), req.Email, req.Password)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(fiber.Map{"user": fiber.Map{"id": u.ID, "name": u.Name, "email": u.Email}, "tokens": tokens})
}
func (h *AuthController) Refresh(c *fiber.Ctx) error {
	var req authSchema.RefreshRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	tp, err := h.service.Auth.Refresh(c.Context(), req.RefreshToken)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(fiber.Map{"tokens": tp})
}
func (h *AuthController) Logout(c *fiber.Ctx) error {
	var req authSchema.RefreshRequest
	if err := c.BodyParser(&req); err == nil && strings.TrimSpace(req.RefreshToken) != "" {
		h.service.Auth.Logout(c.Context(), req.RefreshToken)
	}
	return c.JSON(fiber.Map{"message": "logged out"})
}
func (h *AuthController) Me(c *fiber.Ctx) error {
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	u, err := h.service.User.Get(c.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(fiber.Map{"id": u.ID, "name": u.Name, "email": u.Email, "createdAt": u.CreatedAt})
}
