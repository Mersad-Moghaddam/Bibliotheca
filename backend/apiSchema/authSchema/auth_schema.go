package authSchema

type RegisterRequest struct {
	Name     string `json:"name"`
	Mobile   string `json:"mobile"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

type LoginRequest struct {
	Mobile   string `json:"mobile"`
	Password string `json:"password"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refreshToken"`
}
