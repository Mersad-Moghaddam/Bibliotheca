package userController

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"negar-backend/apiSchema/userSchema"
	"negar-backend/pkg/apiresponse"
	"negar-backend/pkg/reminders"
	"negar-backend/pkg/requestutil"
	"negar-backend/pkg/validation"
	"negar-backend/services/apiErrCode"
	"negar-backend/services/authService"
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
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
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
	validation.StringLength(req.NewPassword, "newPassword", validation.MinPasswordLength, validation.MaxPasswordLength, errs)
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if err := h.service.User.UpdatePassword(c.Context(), uid, req.CurrentPassword, req.NewPassword); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"message": "password updated"}, nil)
}

func (h *UserController) GetReminderSettings(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	u, err := h.service.User.Get(c.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{
		"enabled":        u.ReminderEnabled,
		"time":           u.ReminderTime,
		"frequency":      u.ReminderFrequency,
		"nextReminderAt": reminders.NextReminderAt(time.Now(), u.ReminderEnabled, u.ReminderTime, u.ReminderFrequency),
	}, nil)
}

func (h *UserController) UpdateReminderSettings(c *fiber.Ctx) error {
	var req userSchema.ReminderSettingsRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	errs := validation.Errors{}
	req.Time = validation.Required(req.Time, "time", errs)
	req.Frequency = validation.Required(req.Frequency, "frequency", errs)
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	normalizedTime, normalizedFrequency, ok := reminders.NormalizeAndValidateSettings(req.Time, req.Frequency)
	if !ok {
		validation.TimeHHMM(req.Time, "time", errs)
		validation.Enum(req.Frequency, "frequency", reminders.AllowedFrequencies, errs)
		if errs.HasAny() {
			return apiresponse.ValidationError(c, errs)
		}
	}
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	u, err := h.service.User.UpdateReminderSettings(c.Context(), uid, req.Enabled, normalizedTime, normalizedFrequency)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{
		"enabled":        u.ReminderEnabled,
		"time":           u.ReminderTime,
		"frequency":      u.ReminderFrequency,
		"nextReminderAt": reminders.NextReminderAt(time.Now(), u.ReminderEnabled, u.ReminderTime, u.ReminderFrequency),
	}, nil)
}
