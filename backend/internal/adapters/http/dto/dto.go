package dto

type RegisterRequest struct {
	Name            string `json:"name"`
	Email           string `json:"email"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirm_password"`
}
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type BookRequest struct {
	Title      string `json:"title"`
	Author     string `json:"author"`
	TotalPages int    `json:"total_pages"`
	Status     string `json:"status"`
}
type BookStatusRequest struct {
	Status string `json:"status"`
}
type BookmarkRequest struct {
	CurrentPage int `json:"current_page"`
}

type WishlistRequest struct {
	Title         string   `json:"title"`
	Author        string   `json:"author"`
	ExpectedPrice *float64 `json:"expected_price"`
	Notes         *string  `json:"notes"`
}
type PurchaseLinkRequest struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

type UpdateProfileRequest struct {
	Name string `json:"name"`
}
type UpdatePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}
