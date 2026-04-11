package bookController

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"libro-backend/apiSchema/bookSchema"
	"libro-backend/models/book"
	"libro-backend/models/commonPagination"
	"libro-backend/pkg/apiresponse"
	"libro-backend/pkg/pagination"
	"libro-backend/pkg/validation"
	"libro-backend/repositories"
	"libro-backend/services/apiErrCode"
	"libro-backend/services/bookService"
	"libro-backend/statics/constants"
)

type ServiceBridge struct{ Book *bookService.Service }

type BookController struct{ service *ServiceBridge }

var allowedBookSort = map[string]struct{}{"title": {}, "author": {}, "created_at": {}, "updated_at": {}, "status": {}, "total_pages": {}}
var allowedBookStatus = map[string]struct{}{constants.BookStatusInLibrary: {}, constants.BookStatusCurrentlyRead: {}, constants.BookStatusFinished: {}, constants.BookStatusNextToRead: {}}

func NewBookController(service *ServiceBridge) *BookController {
	return &BookController{service: service}
}

func (h *BookController) List(c *fiber.Ctx) error {
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	page, limit = pagination.Normalize(page, limit)
	sortBy := c.Query("sortBy", "updated_at")
	order := c.Query("order", "desc")
	if _, ok := allowedBookSort[sortBy]; !ok {
		sortBy = "updated_at"
	}
	if order != "asc" {
		order = "desc"
	}
	books, total, err := h.service.Book.List(c.Context(), uid, repositories.BookFilter{Search: c.Query("search"), Status: c.Query("status"), Genre: c.Query("genre"), SortBy: sortBy, Order: order, PageFilter: repositories.PageFilter{Page: page, Limit: limit}})
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	meta := commonPagination.Meta{Page: page, Limit: limit, Total: total, HasNext: int64(page*limit) < total}
	return apiresponse.OK(c, withBooksComputed(books), meta)
}
func (h *BookController) Create(c *fiber.Ctx) error {
	var req bookSchema.BookRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateBookRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	b := &book.Book{UserID: uid, Title: req.Title, Author: req.Author, TotalPages: req.TotalPages, Status: req.Status, CoverURL: req.CoverURL, Genre: req.Genre, ISBN: req.ISBN}
	if err := h.service.Book.Create(c.Context(), b); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.Created(c, withBookComputed(b))
}
func (h *BookController) Get(c *fiber.Ctx) error {
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	id, _ := uuid.Parse(c.Params("id"))
	b, err := h.service.Book.Get(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, withBookComputed(b), nil)
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
	if errs := validateBookRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	b.Title, b.Author, b.TotalPages, b.Status = req.Title, req.Author, req.TotalPages, req.Status
	b.CoverURL, b.Genre, b.ISBN = req.CoverURL, req.Genre, req.ISBN
	if err = h.service.Book.Update(c.Context(), b); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, withBookComputed(b), nil)
}
func (h *BookController) Delete(c *fiber.Ctx) error {
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	id, _ := uuid.Parse(c.Params("id"))
	if err := h.service.Book.Delete(c.Context(), uid, id); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"message": "deleted"}, nil)
}
func (h *BookController) UpdateStatus(c *fiber.Ctx) error {
	var req bookSchema.BookStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	errFields := validation.Errors{}
	req.Status = validation.Required(req.Status, "status", errFields)
	validation.Enum(req.Status, "status", allowedBookStatus, errFields)
	if errFields.HasAny() {
		return apiresponse.ValidationError(c, errFields)
	}
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	id, _ := uuid.Parse(c.Params("id"))
	b, err := h.service.Book.UpdateStatus(c.Context(), uid, id, req.Status)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, withBookComputed(b), nil)
}

func (h *BookController) ListNotes(c *fiber.Ctx) error {
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	id, _ := uuid.Parse(c.Params("id"))
	notes, err := h.service.Book.ListNotes(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"items": notes}, nil)
}

func (h *BookController) AddNote(c *fiber.Ctx) error {
	var req bookSchema.BookNoteRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	errs := validation.Errors{}
	req.Note = validation.Required(req.Note, "note", errs)
	if errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, _ := uuid.Parse(c.Locals("userID").(string))
	id, _ := uuid.Parse(c.Params("id"))
	note, err := h.service.Book.CreateNote(c.Context(), uid, id, req.Note, req.Highlight)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.Created(c, note)
}

func validateBookRequest(req bookSchema.BookRequest) validation.Errors {
	errs := validation.Errors{}
	req.Title = validation.Required(req.Title, "title", errs)
	req.Author = validation.Required(req.Author, "author", errs)
	req.Status = validation.Required(req.Status, "status", errs)
	validation.StringLength(req.Title, "title", 1, 200, errs)
	validation.StringLength(req.Author, "author", 1, 200, errs)
	validation.Enum(req.Status, "status", allowedBookStatus, errs)
	validation.MinInt(req.TotalPages, "totalPages", 1, errs)
	return errs
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
	return map[string]any{"id": b.ID, "userId": b.UserID, "title": b.Title, "author": b.Author, "totalPages": b.TotalPages, "status": b.Status, "currentPage": b.CurrentPage, "remainingPages": remaining, "progressPercentage": progress, "coverUrl": b.CoverURL, "genre": b.Genre, "isbn": b.ISBN, "completedAt": b.CompletedAt, "createdAt": b.CreatedAt, "updatedAt": b.UpdatedAt}
}
