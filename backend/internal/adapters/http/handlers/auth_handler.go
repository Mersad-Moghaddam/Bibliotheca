package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"libro-backend/internal/adapters/http/dto"
	"libro-backend/internal/application"
)

type AuthHandler struct {
	service *application.AuthService
	users   *application.UserService
}

func NewAuthHandler(service *application.AuthService, users *application.UserService) *AuthHandler {
	return &AuthHandler{service: service, users: users}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req dto.RegisterRequest
	if err := c.BodyParser(&req); err != nil || req.Password != req.ConfirmPassword {
		return respondError(c, err)
	}
	u, err := h.service.Register(c.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		return respondError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"user": fiber.Map{"id": u.ID, "name": u.Name, "email": u.Email}})
}
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req dto.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return respondError(c, err)
	}
	u, tokens, err := h.service.Login(c.Context(), c.IP(), req.Email, req.Password)
	if err != nil {
		return respondError(c, err)
	}
	return c.JSON(fiber.Map{"user": fiber.Map{"id": u.ID, "name": u.Name, "email": u.Email}, "tokens": tokens})
}
func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	var req dto.RefreshRequest
	if err := c.BodyParser(&req); err != nil {
		return respondError(c, err)
	}
	tp, err := h.service.Refresh(c.Context(), req.RefreshToken)
	if err != nil {
		return respondError(c, err)
	}
	return c.JSON(fiber.Map{"tokens": tp})
}
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	var req dto.RefreshRequest
	if err := c.BodyParser(&req); err == nil && strings.TrimSpace(req.RefreshToken) != "" {
		h.service.Logout(c.Context(), req.RefreshToken)
	}
	return c.JSON(fiber.Map{"message": "logged out"})
}
func (h *AuthHandler) Me(c *fiber.Ctx) error {
	uid := c.Locals("userID").(string)
	u, err := h.users.Get(c.Context(), parseUUID(uid))
	if err != nil {
		return respondError(c, err)
	}
	return c.JSON(fiber.Map{"id": u.ID, "name": u.Name, "email": u.Email, "created_at": u.CreatedAt})
}
