package bookController

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"libro-backend/apiSchema/bookSchema"
	"libro-backend/models/book"
	"libro-backend/services/apiErrCode"
	"libro-backend/services/bookService"
)

type ServiceBridge struct{ Book *bookService.Service }

type BookController struct{ service *ServiceBridge }

func NewBookController(service *ServiceBridge) *BookController {
	return &BookController{service: service}
}

func (h *BookController) List(c *fiber.Ctx) error {
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	books, err := h.service.Book.List(c.Context(), uid, c.Query("search"), c.Query("status"))
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(withBooksComputed(books))
}
func (h *BookController) Create(c *fiber.Ctx) error {
	var req bookSchema.BookRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	b := &book.Book{UserID: uid, Title: req.Title, Author: req.Author, TotalPages: req.TotalPages, Status: req.Status}
	if err := h.service.Book.Create(c.Context(), b); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(withBookComputed(b))
}
func (h *BookController) Get(c *fiber.Ctx) error {
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	id, _ := uuid.Parse(c.Params("id"))
	b, err := h.service.Book.Get(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(withBookComputed(b))
}
func (h *BookController) Update(c *fiber.Ctx) error {
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	id, _ := uuid.Parse(c.Params("id"))
	b, err := h.service.Book.Get(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	var req bookSchema.BookRequest
	if err = c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	b.Title, b.Author, b.TotalPages, b.Status = req.Title, req.Author, req.TotalPages, req.Status
	if err = h.service.Book.Update(c.Context(), b); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(withBookComputed(b))
}
func (h *BookController) Delete(c *fiber.Ctx) error {
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	id, _ := uuid.Parse(c.Params("id"))
	if err := h.service.Book.Delete(c.Context(), uid, id); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(fiber.Map{"message": "deleted"})
}
func (h *BookController) UpdateStatus(c *fiber.Ctx) error {
	var req bookSchema.BookStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	id, _ := uuid.Parse(c.Params("id"))
	b, err := h.service.Book.UpdateStatus(c.Context(), uid, id, req.Status)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return c.JSON(withBookComputed(b))
}

func withBooksComputed(books []book.Book) []map[string]any {
	resp := make([]map[string]any, 0, len(books))
	for i := range books {
		b := books[i]
		resp = append(resp, withBookComputed(&b))
	}
	return resp
}
func withBookComputed(b *book.Book) map[string]any {
	remaining := b.TotalPages
	if b.CurrentPage != nil {
		remaining = b.TotalPages - *b.CurrentPage
	}
	if remaining < 0 {
		remaining = 0
	}
	progress := 0
	if b.CurrentPage != nil && b.TotalPages > 0 {
		progress = int(float64(*b.CurrentPage) / float64(b.TotalPages) * 100)
	}
	return map[string]any{"id": b.ID, "userId": b.UserID, "title": b.Title, "author": b.Author, "totalPages": b.TotalPages, "status": b.Status, "currentPage": b.CurrentPage, "remainingPages": remaining, "progressPercentage": progress, "completedAt": b.CompletedAt, "createdAt": b.CreatedAt, "updatedAt": b.UpdatedAt}
}
