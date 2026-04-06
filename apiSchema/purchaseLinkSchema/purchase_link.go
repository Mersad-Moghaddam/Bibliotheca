package purchaseLinkSchema

type CreatePurchaseLinkRequest struct {
	Label *string `json:"label"`
	URL   string  `json:"url"`
}

type UpdatePurchaseLinkRequest struct {
	Label *string `json:"label"`
	URL   string  `json:"url"`
}

type PurchaseLinkResponse struct {
	ID        uint   `json:"id"`
	Label     string `json:"label"`
	Alias     string `json:"alias"`
	URL       string `json:"url"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}
