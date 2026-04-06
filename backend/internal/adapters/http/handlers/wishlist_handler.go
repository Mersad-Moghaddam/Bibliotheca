package handlers

import (
	"bibliotheca/backend/internal/adapters/http/dto"
	"bibliotheca/backend/internal/application"
	"bibliotheca/backend/internal/domain"
	"github.com/gofiber/fiber/v2"
)

type WishlistHandler struct{ service *application.WishlistService }

func NewWishlistHandler(service *application.WishlistService) *WishlistHandler {
	return &WishlistHandler{service: service}
}

func (h *WishlistHandler) List(c *fiber.Ctx) error {
	items, err := h.service.List(c.Context(), parseUUID(c.Locals("userID").(string)))
	if err != nil {
		return respondError(c, err)
	}
	return c.JSON(items)
}
func (h *WishlistHandler) Create(c *fiber.Ctx) error {
	var req dto.WishlistRequest
	if err := c.BodyParser(&req); err != nil {
		return respondError(c, err)
	}
	item := &domain.WishlistItem{UserID: parseUUID(c.Locals("userID").(string)), Title: req.Title, Author: req.Author, ExpectedPrice: req.ExpectedPrice, Notes: req.Notes}
	if err := h.service.Create(c.Context(), item); err != nil {
		return respondError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(item)
}
func (h *WishlistHandler) Get(c *fiber.Ctx) error {
	item, err := h.service.Get(c.Context(), parseUUID(c.Locals("userID").(string)), parseUUID(c.Params("id")))
	if err != nil {
		return respondError(c, err)
	}
	return c.JSON(item)
}
func (h *WishlistHandler) Update(c *fiber.Ctx) error {
	uid := parseUUID(c.Locals("userID").(string))
	wid := parseUUID(c.Params("id"))
	item, err := h.service.Get(c.Context(), uid, wid)
	if err != nil {
		return respondError(c, err)
	}
	var req dto.WishlistRequest
	if err = c.BodyParser(&req); err != nil {
		return respondError(c, err)
	}
	item.Title, item.Author, item.ExpectedPrice, item.Notes = req.Title, req.Author, req.ExpectedPrice, req.Notes
	if err = h.service.Update(c.Context(), item); err != nil {
		return respondError(c, err)
	}
	return c.JSON(item)
}
func (h *WishlistHandler) Delete(c *fiber.Ctx) error {
	if err := h.service.Delete(c.Context(), parseUUID(c.Locals("userID").(string)), parseUUID(c.Params("id"))); err != nil {
		return respondError(c, err)
	}
	return c.JSON(fiber.Map{"message": "deleted"})
}
func (h *WishlistHandler) AddLink(c *fiber.Ctx) error {
	var req dto.PurchaseLinkRequest
	if err := c.BodyParser(&req); err != nil {
		return respondError(c, err)
	}
	link := &domain.PurchaseLink{WishlistItemID: parseUUID(c.Params("id")), Label: req.Label, URL: req.URL}
	if err := h.service.AddLink(c.Context(), link); err != nil {
		return respondError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(link)
}
func (h *WishlistHandler) UpdateLink(c *fiber.Ctx) error {
	var req dto.PurchaseLinkRequest
	if err := c.BodyParser(&req); err != nil {
		return respondError(c, err)
	}
	link, err := h.service.UpdateLink(c.Context(), parseUUID(c.Locals("userID").(string)), parseUUID(c.Params("id")), parseUUID(c.Params("linkId")), req.Label, req.URL)
	if err != nil {
		return respondError(c, err)
	}
	return c.JSON(link)
}
func (h *WishlistHandler) DeleteLink(c *fiber.Ctx) error {
	if err := h.service.DeleteLink(c.Context(), parseUUID(c.Locals("userID").(string)), parseUUID(c.Params("id")), parseUUID(c.Params("linkId"))); err != nil {
		return respondError(c, err)
	}
	return c.JSON(fiber.Map{"message": "deleted"})
}
