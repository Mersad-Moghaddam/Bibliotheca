package wishlistController

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"libro-backend/apiSchema/purchaseLinkSchema"
	"libro-backend/apiSchema/wishlistSchema"
	"libro-backend/models/purchaseLink"
	"libro-backend/models/wishlist"
	"libro-backend/services/apiErrCode"
	"libro-backend/services/wishlistService"
)

type ServiceBridge struct{ Wishlist *wishlistService.Service }

type WishlistController struct{ service *ServiceBridge }

func NewWishlistController(service *ServiceBridge) *WishlistController {
	return &WishlistController{service: service}
}

func (h *WishlistController) List(c *fiber.Ctx) error {
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	items, err := h.service.Wishlist.List(c.Context(), uid)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(items)
}
func (h *WishlistController) Create(c *fiber.Ctx) error {
	var req wishlistSchema.WishlistRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	w := &wishlist.Wishlist{UserID: uid, Title: req.Title, Author: req.Author, ExpectedPrice: req.ExpectedPrice, Notes: req.Notes}
	if err := h.service.Wishlist.Create(c.Context(), w); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(w)
}
func (h *WishlistController) Get(c *fiber.Ctx) error {
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	item, err := h.service.Wishlist.Get(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(item)
}
func (h *WishlistController) Update(c *fiber.Ctx) error {
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	item, err := h.service.Wishlist.Get(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	var req wishlistSchema.WishlistRequest
	if err = c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	item.Title, item.Author, item.ExpectedPrice, item.Notes = req.Title, req.Author, req.ExpectedPrice, req.Notes
	if err = h.service.Wishlist.Update(c.Context(), item); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(item)
}
func (h *WishlistController) Delete(c *fiber.Ctx) error {
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	if err := h.service.Wishlist.Delete(c.Context(), uid, id); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(fiber.Map{"message": "deleted"})
}
func (h *WishlistController) AddLink(c *fiber.Ctx) error {
	var req purchaseLinkSchema.PurchaseLinkRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	wid, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	link := &purchaseLink.PurchaseLink{Label: req.Label, URL: req.URL}
	if err := h.service.Wishlist.AddLink(c.Context(), uid, wid, link); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(link)
}
func (h *WishlistController) UpdateLink(c *fiber.Ctx) error {
	var req purchaseLinkSchema.PurchaseLinkRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	wid, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	lid, err := uuid.Parse(c.Params("linkId"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	link, err := h.service.Wishlist.UpdateLink(c.Context(), uid, wid, lid, req.Label, req.URL)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(link)
}
func (h *WishlistController) DeleteLink(c *fiber.Ctx) error {
	uid, err := uuid.Parse(c.Locals("userID").(string))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	wid, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	lid, err := uuid.Parse(c.Params("linkId"))
	if err != nil {
		return apiErrCode.RespondError(c, fiber.ErrBadRequest)
	}
	if err := h.service.Wishlist.DeleteLink(c.Context(), uid, wid, lid); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(fiber.Map{"message": "deleted"})
}
