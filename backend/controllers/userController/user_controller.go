package userController

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"libro-backend/apiSchema/userSchema"
	"libro-backend/pkg/apiresponse"
	"libro-backend/pkg/validation"
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
	errs := validation.Errors{}
	req.Name = validation.Required(req.Name, "name", errs)
	validation.StringLength(req.Name, "name", 2, 120, errs)
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	u, err := h.service.User.UpdateName(c.Context(), uid, req.Name)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"id": u.ID, "name": u.Name, "email": u.Email}, nil)
}
func (h *UserController) UpdatePassword(c *fiber.Ctx) error {
	var req userSchema.UpdatePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	errs := validation.Errors{}
	req.CurrentPassword = validation.Required(req.CurrentPassword, "currentPassword", errs)
	req.NewPassword = validation.Required(req.NewPassword, "newPassword", errs)
	validation.StringLength(req.NewPassword, "newPassword", 8, 72, errs)
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	if err := h.service.User.UpdatePassword(c.Context(), uid, req.CurrentPassword, req.NewPassword); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"message": "password updated"}, nil)
}

func (h *UserController) GetReminderSettings(c *fiber.Ctx) error {
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	u, err := h.service.User.Get(c.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"enabled": u.ReminderEnabled, "time": u.ReminderTime, "frequency": u.ReminderFrequency, "nextReminderAt": nextReminderAt(u.ReminderEnabled, u.ReminderTime)}, nil)
}

func (h *UserController) UpdateReminderSettings(c *fiber.Ctx) error {
	var req userSchema.ReminderSettingsRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	errs := validation.Errors{}
	req.Time = validation.Required(req.Time, "time", errs)
	req.Frequency = validation.Required(req.Frequency, "frequency", errs)
	allowed := map[string]struct{}{"daily": {}, "weekly": {}, "weekdays": {}, "weekends": {}}
	validation.Enum(req.Frequency, "frequency", allowed, errs)
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	u, err := h.service.User.UpdateReminderSettings(c.Context(), uid, req.Enabled, req.Time, req.Frequency)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"enabled": u.ReminderEnabled, "time": u.ReminderTime, "frequency": u.ReminderFrequency, "nextReminderAt": nextReminderAt(u.ReminderEnabled, u.ReminderTime)}, nil)
}

func nextReminderAt(enabled bool, reminderTime string) *string {
	if !enabled {
		return nil
	}
	now := time.Now()
	candidate, err := time.ParseInLocation("15:04", reminderTime, now.Location())
	if err != nil {
		return nil
	}
	next := time.Date(now.Year(), now.Month(), now.Day(), candidate.Hour(), candidate.Minute(), 0, 0, now.Location())
	if !next.After(now) {
		next = next.Add(24 * time.Hour)
	}
	formatted := next.Format(time.RFC3339)
	return &formatted
}
