package wishlistService

import (
	"net/url"
	"strings"
	"time"

	"libro/apiSchema/purchaseLinkSchema"
	"libro/apiSchema/wishlistSchema"
	"libro/models/commonPagination"
	"libro/models/purchaseLink"
	"libro/models/wishlist"
	"libro/repositories"
	"libro/statics/customErr"
)

type Service struct {
	repos *repositories.InitialRepositories
}

func New(repos *repositories.InitialRepositories) *Service { return &Service{repos: repos} }

func (s *Service) CreateWishlistItem(userID uint, req wishlistSchema.CreateWishlistRequest) (*wishlistSchema.WishlistResponse, error) {
	w := &wishlist.Wishlist{UserID: userID, Title: req.Title, Author: req.Author, ExpectedPrice: req.ExpectedPrice, Notes: req.Notes}
	if err := s.repos.WishlistRepo.Create(w); err != nil {
		return nil, err
	}
	resp := toWishlistResponse(*w)
	return &resp, nil
}
func (s *Service) GetWishlist(userID uint, req commonPagination.PageRequest) (*wishlistSchema.WishlistListResponse, error) {
	total, err := s.repos.WishlistRepo.CountByUser(userID)
	if err != nil {
		return nil, err
	}
	items, err := s.repos.WishlistRepo.ListByUser(userID, req.Limit, (req.Page-1)*req.Limit)
	if err != nil {
		return nil, err
	}
	resp := make([]wishlistSchema.WishlistResponse, 0, len(items))
	for _, w := range items {
		resp = append(resp, toWishlistResponse(w))
	}
	return &wishlistSchema.WishlistListResponse{Items: resp, Total: total}, nil
}
func (s *Service) GetWishlistItemByID(userID, id uint) (*wishlistSchema.WishlistResponse, error) {
	w, err := s.repos.WishlistRepo.FindByIDAndUser(id, userID)
	if err != nil {
		return nil, customErr.ErrNotFound
	}
	resp := toWishlistResponse(*w)
	return &resp, nil
}
func (s *Service) UpdateWishlistItem(userID, id uint, req wishlistSchema.UpdateWishlistRequest) (*wishlistSchema.WishlistResponse, error) {
	w, err := s.repos.WishlistRepo.FindByIDAndUser(id, userID)
	if err != nil {
		return nil, customErr.ErrNotFound
	}
	w.Title = req.Title
	w.Author = req.Author
	w.ExpectedPrice = req.ExpectedPrice
	w.Notes = req.Notes
	if err := s.repos.WishlistRepo.Save(w); err != nil {
		return nil, err
	}
	resp := toWishlistResponse(*w)
	return &resp, nil
}
func (s *Service) DeleteWishlistItem(userID, id uint) error {
	w, err := s.repos.WishlistRepo.FindByIDAndUser(id, userID)
	if err != nil {
		return customErr.ErrNotFound
	}
	return s.repos.WishlistRepo.Delete(w)
}

func (s *Service) AddPurchaseLink(userID, wishlistID uint, req purchaseLinkSchema.CreatePurchaseLinkRequest) (*purchaseLinkSchema.PurchaseLinkResponse, error) {
	normalizedURL, ok := normalizeURL(req.URL)
	if !ok {
		return nil, customErr.ErrInvalidInput
	}
	w, err := s.repos.WishlistRepo.FindByIDAndUser(wishlistID, userID)
	if err != nil {
		return nil, customErr.ErrNotFound
	}
	label := strings.TrimSpace(valueOrEmpty(req.Label))
	if label == "" {
		label = deriveAliasFromURL(normalizedURL)
	}
	p := &purchaseLink.PurchaseLink{WishlistID: w.ID, Label: label, URL: normalizedURL}
	if err := s.repos.PurchaseLinkRepo.Create(p); err != nil {
		return nil, err
	}
	resp := toPurchaseLinkResponse(*p)
	return &resp, nil
}
func (s *Service) UpdatePurchaseLink(userID, wishlistID, linkID uint, req purchaseLinkSchema.UpdatePurchaseLinkRequest) (*purchaseLinkSchema.PurchaseLinkResponse, error) {
	normalizedURL, ok := normalizeURL(req.URL)
	if !ok {
		return nil, customErr.ErrInvalidInput
	}
	if _, err := s.repos.WishlistRepo.FindByIDAndUser(wishlistID, userID); err != nil {
		return nil, customErr.ErrNotFound
	}
	p, err := s.repos.PurchaseLinkRepo.FindByID(linkID)
	if err != nil || p.WishlistID != wishlistID {
		return nil, customErr.ErrNotFound
	}
	label := strings.TrimSpace(valueOrEmpty(req.Label))
	if label == "" {
		label = deriveAliasFromURL(normalizedURL)
	}
	p.Label = label
	p.URL = normalizedURL
	if err := s.repos.PurchaseLinkRepo.Save(p); err != nil {
		return nil, err
	}
	resp := toPurchaseLinkResponse(*p)
	return &resp, nil
}
func (s *Service) DeletePurchaseLink(userID, wishlistID, linkID uint) error {
	if _, err := s.repos.WishlistRepo.FindByIDAndUser(wishlistID, userID); err != nil {
		return customErr.ErrNotFound
	}
	p, err := s.repos.PurchaseLinkRepo.FindByID(linkID)
	if err != nil || p.WishlistID != wishlistID {
		return customErr.ErrNotFound
	}
	return s.repos.PurchaseLinkRepo.Delete(p)
}

func valueOrEmpty(v *string) string {
	if v == nil {
		return ""
	}
	return *v
}

func normalizeURL(v string) (string, bool) {
	raw := strings.TrimSpace(v)
	if raw == "" {
		return "", false
	}
	if !strings.Contains(raw, "://") {
		raw = "https://" + raw
	}
	u, err := url.ParseRequestURI(raw)
	if err != nil || u.Host == "" {
		return "", false
	}
	return u.String(), true
}

func deriveAliasFromURL(rawURL string) string {
	u, err := url.Parse(rawURL)
	if err != nil {
		return "Store"
	}
	host := strings.ToLower(u.Hostname())
	host = strings.TrimPrefix(host, "www.")
	parts := strings.Split(host, ".")
	if len(parts) == 0 {
		return "Store"
	}
	brand := parts[0]
	known := map[string]string{
		"amazon":         "Amazon",
		"fidibo":         "Fidibo",
		"digikala":       "Digikala",
		"ketabrah":       "Ketabrah",
		"barnesandnoble": "Barnes & Noble",
		"bookdepository": "Book Depository",
	}
	if mapped, ok := known[brand]; ok {
		return mapped
	}
	return strings.ToUpper(brand[:1]) + brand[1:]
}

func toPurchaseLinkResponse(p purchaseLink.PurchaseLink) purchaseLinkSchema.PurchaseLinkResponse {
	alias := deriveAliasFromURL(p.URL)
	return purchaseLinkSchema.PurchaseLinkResponse{ID: p.ID, Label: p.Label, Alias: alias, URL: p.URL, CreatedAt: p.CreatedAt.Format(time.RFC3339), UpdatedAt: p.UpdatedAt.Format(time.RFC3339)}
}
func toWishlistResponse(w wishlist.Wishlist) wishlistSchema.WishlistResponse {
	links := make([]purchaseLinkSchema.PurchaseLinkResponse, 0, len(w.PurchaseLinks))
	for _, l := range w.PurchaseLinks {
		links = append(links, toPurchaseLinkResponse(l))
	}
	return wishlistSchema.WishlistResponse{ID: w.ID, Title: w.Title, Author: w.Author, ExpectedPrice: w.ExpectedPrice, Notes: w.Notes, PurchaseLinks: links, CreatedAt: w.CreatedAt.Format(time.RFC3339), UpdatedAt: w.UpdatedAt.Format(time.RFC3339)}
}
