package userSchema

type UpdateProfileRequest struct {
	Name string `json:"name"`
}

type UpdatePasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}
