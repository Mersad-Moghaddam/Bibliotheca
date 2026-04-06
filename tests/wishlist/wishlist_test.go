package wishlist_test

import (
	"libro/apiSchema/purchaseLinkSchema"
	"testing"
)

func TestPurchaseLinkRequest(t *testing.T) {
	label := "Store"
	req := purchaseLinkSchema.CreatePurchaseLinkRequest{Label: &label, URL: "https://example.com"}
	if req.URL == "" || req.Label == nil || *req.Label == "" {
		t.Fatal("invalid purchase link")
	}
}
