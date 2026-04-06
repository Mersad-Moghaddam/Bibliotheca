package handlers

import (
	"bibliotheca/backend/internal/adapters/http/dto"
	"bibliotheca/backend/internal/application"
	"github.com/gofiber/fiber/v2"
)

type UserHandler struct{ users *application.UserService }

func NewUserHandler(users *application.UserService) *UserHandler { return &UserHandler{users: users} }
func (h *UserHandler) UpdateProfile(c *fiber.Ctx) error {
	var req dto.UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return respondError(c, err)
	}
	u, err := h.users.UpdateName(c.Context(), parseUUID(c.Locals("userID").(string)), req.Name)
	if err != nil {
		return respondError(c, err)
	}
	return c.JSON(fiber.Map{"id": u.ID, "name": u.Name, "email": u.Email})
}
func (h *UserHandler) UpdatePassword(c *fiber.Ctx) error {
	var req dto.UpdatePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return respondError(c, err)
	}
	if err := h.users.UpdatePassword(c.Context(), parseUUID(c.Locals("userID").(string)), req.CurrentPassword, req.NewPassword); err != nil {
		return respondError(c, err)
	}
	return c.JSON(fiber.Map{"message": "password updated"})
}
