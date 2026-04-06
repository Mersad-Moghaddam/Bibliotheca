package purchaseLinkSchema

type PurchaseLinkRequest struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}
