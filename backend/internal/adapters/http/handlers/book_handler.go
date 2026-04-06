package handlers

import (
	"bibliotheca/backend/internal/adapters/http/dto"
	"bibliotheca/backend/internal/application"
	"bibliotheca/backend/internal/domain"
	"github.com/gofiber/fiber/v2"
)

type BookHandler struct{ service *application.BookService }

func NewBookHandler(service *application.BookService) *BookHandler {
	return &BookHandler{service: service}
}

func (h *BookHandler) List(c *fiber.Ctx) error {
	books, err := h.service.List(c.Context(), parseUUID(c.Locals("userID").(string)), c.Query("search"), c.Query("status"))
	if err != nil {
		return respondError(c, err)
	}
	return c.JSON(books)
}
func (h *BookHandler) Create(c *fiber.Ctx) error {
	var req dto.BookRequest
	if err := c.BodyParser(&req); err != nil {
		return respondError(c, err)
	}
	book := &domain.Book{UserID: parseUUID(c.Locals("userID").(string)), Title: req.Title, Author: req.Author, TotalPages: req.TotalPages, Status: domain.BookStatus(req.Status)}
	if err := h.service.Create(c.Context(), book); err != nil {
		return respondError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(withBookComputed(book))
}
func (h *BookHandler) Get(c *fiber.Ctx) error {
	book, err := h.service.Get(c.Context(), parseUUID(c.Locals("userID").(string)), parseUUID(c.Params("id")))
	if err != nil {
		return respondError(c, err)
	}
	return c.JSON(withBookComputed(book))
}
func (h *BookHandler) Update(c *fiber.Ctx) error {
	uid := parseUUID(c.Locals("userID").(string))
	bid := parseUUID(c.Params("id"))
	book, err := h.service.Get(c.Context(), uid, bid)
	if err != nil {
		return respondError(c, err)
	}
	var req dto.BookRequest
	if err = c.BodyParser(&req); err != nil {
		return respondError(c, err)
	}
	book.Title, book.Author, book.TotalPages, book.Status = req.Title, req.Author, req.TotalPages, domain.BookStatus(req.Status)
	if err = h.service.Update(c.Context(), book); err != nil {
		return respondError(c, err)
	}
	return c.JSON(withBookComputed(book))
}
func (h *BookHandler) Delete(c *fiber.Ctx) error {
	if err := h.service.Delete(c.Context(), parseUUID(c.Locals("userID").(string)), parseUUID(c.Params("id"))); err != nil {
		return respondError(c, err)
	}
	return c.JSON(fiber.Map{"message": "deleted"})
}
func (h *BookHandler) UpdateStatus(c *fiber.Ctx) error {
	var req dto.BookStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return respondError(c, err)
	}
	book, err := h.service.UpdateStatus(c.Context(), parseUUID(c.Locals("userID").(string)), parseUUID(c.Params("id")), domain.BookStatus(req.Status))
	if err != nil {
		return respondError(c, err)
	}
	return c.JSON(withBookComputed(book))
}
func (h *BookHandler) UpdateBookmark(c *fiber.Ctx) error {
	var req dto.BookmarkRequest
	if err := c.BodyParser(&req); err != nil {
		return respondError(c, err)
	}
	book, err := h.service.UpdateBookmark(c.Context(), parseUUID(c.Locals("userID").(string)), parseUUID(c.Params("id")), req.CurrentPage)
	if err != nil {
		return respondError(c, err)
	}
	return c.JSON(withBookComputed(book))
}
