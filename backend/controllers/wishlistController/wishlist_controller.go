package wishlistController

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"negar-backend/apiSchema/purchaseLinkSchema"
	"negar-backend/apiSchema/wishlistSchema"
	"negar-backend/models/commonPagination"
	"negar-backend/models/purchaseLink"
	"negar-backend/models/wishlist"
	"negar-backend/pkg/apiresponse"
	"negar-backend/pkg/pagination"
	"negar-backend/pkg/requestutil"
	"negar-backend/pkg/validation"
	"negar-backend/repositories"
	"negar-backend/services/apiErrCode"
	"negar-backend/services/auditService"
	"negar-backend/services/wishlistService"
)

type ServiceBridge struct {
	Wishlist *wishlistService.Service
	Audit    *auditService.Service
}

type WishlistController struct{ service *ServiceBridge }

var allowedWishlistSort = map[string]struct{}{"title": {}, "created_at": {}, "updated_at": {}}

func NewWishlistController(service *ServiceBridge) *WishlistController {
	return &WishlistController{service: service}
}

func (h *WishlistController) List(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	page, limit = pagination.Normalize(page, limit)
	sortBy := c.Query("sortBy", "updated_at")
	if _, ok := allowedWishlistSort[sortBy]; !ok {
		sortBy = "updated_at"
	}
	order := c.Query("order", "desc")
	if order != "asc" {
		order = "desc"
	}
	items, total, err := h.service.Wishlist.List(c.Context(), uid, repositories.WishlistFilter{Search: c.Query("search"), SortBy: sortBy, Order: order, PageFilter: repositories.PageFilter{Page: page, Limit: limit}})
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	meta := commonPagination.Meta{Page: page, Limit: limit, Total: total, HasNext: int64(page*limit) < total}
	return apiresponse.OK(c, items, meta)
}
func (h *WishlistController) Create(c *fiber.Ctx) error {
	var req wishlistSchema.WishlistRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateWishlistRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	w := &wishlist.Wishlist{UserID: uid, Title: req.Title, Author: req.Author, ExpectedPrice: req.ExpectedPrice, Notes: req.Notes}
	if err := h.service.Wishlist.Create(c.Context(), w); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if h.service.Audit != nil {
		_ = h.service.Audit.Record(c.Context(), auditService.RecordInput{ActorUserID: uid, ActorRole: requestutil.UserRole(c), Action: "wishlist.created", ResourceType: "wishlist", ResourceID: &w.ID, IPAddress: c.IP(), UserAgent: c.Get("User-Agent")})
	}
	return apiresponse.Created(c, w)
}
func (h *WishlistController) Get(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	item, err := h.service.Wishlist.Get(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, item, nil)
}
func (h *WishlistController) Update(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	item, err := h.service.Wishlist.Get(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	var req wishlistSchema.WishlistRequest
	if err = c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateWishlistRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	item.Title, item.Author, item.ExpectedPrice, item.Notes = req.Title, req.Author, req.ExpectedPrice, req.Notes
	if err = h.service.Wishlist.Update(c.Context(), item); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if h.service.Audit != nil {
		_ = h.service.Audit.Record(c.Context(), auditService.RecordInput{ActorUserID: uid, ActorRole: requestutil.UserRole(c), Action: "wishlist.updated", ResourceType: "wishlist", ResourceID: &item.ID, IPAddress: c.IP(), UserAgent: c.Get("User-Agent")})
	}
	return apiresponse.OK(c, item, nil)
}
func (h *WishlistController) Delete(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if err := h.service.Wishlist.Delete(c.Context(), uid, id); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if h.service.Audit != nil {
		_ = h.service.Audit.Record(c.Context(), auditService.RecordInput{ActorUserID: uid, ActorRole: requestutil.UserRole(c), Action: "wishlist.deleted", ResourceType: "wishlist", ResourceID: &id, IPAddress: c.IP(), UserAgent: c.Get("User-Agent")})
	}
	return apiresponse.OK(c, fiber.Map{"message": "deleted"}, nil)
}
func (h *WishlistController) AddLink(c *fiber.Ctx) error {
	var req purchaseLinkSchema.PurchaseLinkRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateLinkRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	wid, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	link := &purchaseLink.PurchaseLink{Label: req.Label, URL: req.URL}
	if err := h.service.Wishlist.AddLink(c.Context(), uid, wid, link); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.Created(c, link)
}
func (h *WishlistController) UpdateLink(c *fiber.Ctx) error {
	var req purchaseLinkSchema.PurchaseLinkRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateLinkRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	wid, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	lid, err := requestutil.ParamUUID(c, "linkId")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	link, err := h.service.Wishlist.UpdateLink(c.Context(), uid, wid, lid, req.Label, req.URL)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, link, nil)
}
func (h *WishlistController) DeleteLink(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	wid, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	lid, err := requestutil.ParamUUID(c, "linkId")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if err := h.service.Wishlist.DeleteLink(c.Context(), uid, wid, lid); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"message": "deleted"}, nil)
}

func validateWishlistRequest(req wishlistSchema.WishlistRequest) validation.Errors {
	errs := validation.Errors{}
	req.Title = validation.Required(req.Title, "title", errs)
	req.Author = validation.Required(req.Author, "author", errs)
	validation.StringLength(req.Title, "title", 1, 200, errs)
	validation.StringLength(req.Author, "author", 1, 200, errs)
	if req.ExpectedPrice != nil {
		validation.MinFloat(*req.ExpectedPrice, "expectedPrice", 0, errs)
	}
	return errs
}

func validateLinkRequest(req purchaseLinkSchema.PurchaseLinkRequest) validation.Errors {
	errs := validation.Errors{}
	req.URL = validation.Required(req.URL, "url", errs)
	if req.Label != "" {
		validation.StringLength(req.Label, "label", 1, 120, errs)
	}
	validation.StringLength(req.URL, "url", 5, 500, errs)
	return errs
}
