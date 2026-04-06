package userController

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"libro-backend/apiSchema/userSchema"
	"libro-backend/services/apiErrCode"
	"libro-backend/services/authService"
)

type ServiceBridge struct{ User *authService.UserService }

type UserController struct{ service *ServiceBridge }

func NewUserController(service *ServiceBridge) *UserController {
	return &UserController{service: service}
}

func (h *UserController) UpdateProfile(c *fiber.Ctx) error {
	var req userSchema.UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	u, err := h.service.User.UpdateName(c.Context(), uid, req.Name)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(fiber.Map{"id": u.ID, "name": u.Name, "email": u.Email})
}
func (h *UserController) UpdatePassword(c *fiber.Ctx) error {
	var req userSchema.UpdatePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	if err := h.service.User.UpdatePassword(c.Context(), uid, req.CurrentPassword, req.NewPassword); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(fiber.Map{"message": "password updated"})
}
