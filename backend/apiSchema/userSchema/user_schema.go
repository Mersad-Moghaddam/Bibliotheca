package userSchema

type UpdateProfileRequest struct {
	Name string `json:"name"`
}

type UpdatePasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

type ReminderSettingsRequest struct {
	Enabled   bool   `json:"enabled"`
	Time      string `json:"time"`
	Frequency string `json:"frequency"`
	Timezone  string `json:"timezone"`
}
