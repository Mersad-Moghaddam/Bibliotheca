package bookController

import (
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"negar-backend/apiSchema/bookSchema"
	"negar-backend/models/book"
	"negar-backend/models/commonPagination"
	"negar-backend/pkg/apiresponse"
	"negar-backend/pkg/bookview"
	"negar-backend/pkg/pagination"
	"negar-backend/pkg/requestutil"
	"negar-backend/pkg/validation"
	"negar-backend/repositories"
	"negar-backend/services/apiErrCode"
	"negar-backend/services/auditService"
	"negar-backend/services/bookService"
	"negar-backend/statics/constants"
)

type ServiceBridge struct {
	Book  *bookService.Service
	Audit *auditService.Service
}

type BookController struct{ service *ServiceBridge }

var allowedBookSort = map[string]struct{}{"title": {}, "author": {}, "created_at": {}, "updated_at": {}, "status": {}, "total_pages": {}}
var allowedBookStatus = map[string]struct{}{constants.BookStatusInLibrary: {}, constants.BookStatusCurrentlyRead: {}, constants.BookStatusFinished: {}, constants.BookStatusNextToRead: {}}

func NewBookController(service *ServiceBridge) *BookController {
	return &BookController{service: service}
}

func (h *BookController) List(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
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
	return apiresponse.OK(c, bookview.FullList(books), meta)
}
func (h *BookController) Create(c *fiber.Ctx) error {
	var req bookSchema.BookRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if errs := validateBookRequest(req); errs.HasAny() {
		return apiresponse.ValidationError(c, errs)
	}
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	b := &book.Book{UserID: uid, Title: req.Title, Author: req.Author, TotalPages: req.TotalPages, Status: req.Status, CoverURL: req.CoverURL, Genre: req.Genre, ISBN: req.ISBN}
	if err := h.service.Book.Create(c.Context(), b); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if h.service.Audit != nil {
		_ = h.service.Audit.Record(c.Context(), auditService.RecordInput{ActorUserID: uid, ActorRole: requestutil.UserRole(c), Action: "book.created", ResourceType: "book", ResourceID: &b.ID, Metadata: map[string]any{"status": b.Status}, IPAddress: c.IP(), UserAgent: c.Get("User-Agent")})
	}
	return apiresponse.Created(c, bookview.Full(b))
}
func (h *BookController) Get(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	b, err := h.service.Book.Get(c.Context(), uid, id)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if h.service.Audit != nil {
		_ = h.service.Audit.Record(c.Context(), auditService.RecordInput{ActorUserID: uid, ActorRole: requestutil.UserRole(c), Action: "book.status.updated", ResourceType: "book", ResourceID: &b.ID, Metadata: map[string]any{"status": b.Status}, IPAddress: c.IP(), UserAgent: c.Get("User-Agent")})
	}
	return apiresponse.OK(c, bookview.Full(b), nil)
}
func (h *BookController) Update(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
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
	if h.service.Audit != nil {
		_ = h.service.Audit.Record(c.Context(), auditService.RecordInput{ActorUserID: uid, ActorRole: requestutil.UserRole(c), Action: "book.updated", ResourceType: "book", ResourceID: &b.ID, Metadata: map[string]any{"status": b.Status}, IPAddress: c.IP(), UserAgent: c.Get("User-Agent")})
	}
	return apiresponse.OK(c, bookview.Full(b), nil)
}
func (h *BookController) Delete(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if err := h.service.Book.Delete(c.Context(), uid, id); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if h.service.Audit != nil {
		_ = h.service.Audit.Record(c.Context(), auditService.RecordInput{ActorUserID: uid, ActorRole: requestutil.UserRole(c), Action: "book.deleted", ResourceType: "book", ResourceID: &id, IPAddress: c.IP(), UserAgent: c.Get("User-Agent")})
	}
	return apiresponse.OK(c, fiber.Map{"message": "deleted"}, nil)
}
func (h *BookController) UpdateStatus(c *fiber.Ctx) error {
	var req bookSchema.BookStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	errFields := validation.Errors{}
	if req.Status != nil {
		*req.Status = validation.Required(*req.Status, "status", errFields)
		validation.Enum(*req.Status, "status", allowedBookStatus, errFields)
	}
	if req.FinishRating != nil && (*req.FinishRating < 1 || *req.FinishRating > 5) {
		errFields.Add("finishRating", "must be between 1 and 5")
	}
	if req.FinishReflection != nil {
		*req.FinishReflection = validation.Required(*req.FinishReflection, "finishReflection", errFields)
		validation.StringLength(*req.FinishReflection, "finishReflection", 1, 1000, errFields)
	}
	if req.FinishHighlight != nil {
		*req.FinishHighlight = validation.Required(*req.FinishHighlight, "finishHighlight", errFields)
		validation.StringLength(*req.FinishHighlight, "finishHighlight", 1, 600, errFields)
	}
	if req.NextToReadNote != nil {
		trimmed := strings.TrimSpace(*req.NextToReadNote)
		if trimmed == "" {
			req.NextToReadNote = &trimmed
		} else {
			req.NextToReadNote = &trimmed
			validation.StringLength(trimmed, "nextToReadNote", 1, 240, errFields)
		}
	}
	if errFields.HasAny() {
		return apiresponse.ValidationError(c, errFields)
	}
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	b, err := h.service.Book.UpdateStatus(
		c.Context(),
		uid,
		id,
		req.Status,
		req.FinishRating,
		req.FinishReflection,
		req.FinishHighlight,
		req.NextToReadFocus,
		req.NextToReadNote,
	)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, bookview.Full(b), nil)
}

func (h *BookController) ListNotes(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
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
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	id, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	note, err := h.service.Book.CreateNote(c.Context(), uid, id, req.Note, req.Highlight)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.Created(c, note)
}

func (h *BookController) DeleteNote(c *fiber.Ctx) error {
	uid, err := requestutil.UserID(c)
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	bookID, err := requestutil.ParamUUID(c, "id")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	noteID, err := requestutil.ParamUUID(c, "noteId")
	if err != nil {
		return apiErrCode.RespondError(c, err)
	}
	if err := h.service.Book.DeleteNote(c.Context(), uid, bookID, noteID); err != nil {
		return apiErrCode.RespondError(c, err)
	}
	return apiresponse.OK(c, fiber.Map{"message": "deleted"}, nil)
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
