package wishlistSchema

type WishlistRequest struct {
	Title         string   `json:"title"`
	Author        string   `json:"author"`
	ExpectedPrice *float64 `json:"expectedPrice"`
	Notes         *string  `json:"notes"`
}
