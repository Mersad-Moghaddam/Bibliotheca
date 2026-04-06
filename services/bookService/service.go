package bookService

import (
	"strings"
	"time"

	"gorm.io/gorm"
	"libro/apiSchema/bookSchema"
	"libro/models/book"
	"libro/models/commonPagination"
	"libro/repositories"
	"libro/statics/constants"
	"libro/statics/customErr"
)

type Service struct {
	repos *repositories.InitialRepositories
}

func New(repos *repositories.InitialRepositories) *Service { return &Service{repos: repos} }

func (s *Service) CreateBook(userID uint, req bookSchema.CreateBookRequest) (*bookSchema.BookResponse, error) {
	if req.TotalPages <= 0 {
		return nil, customErr.ErrInvalidInput
	}
	status := normalizeStatus(req.Status)
	if status == "" {
		status = constants.BookStatusInLibrary
	}
	if !validStatus(status) {
		return nil, customErr.ErrInvalidInput
	}
	b := &book.Book{UserID: userID, Title: req.Title, Author: req.Author, TotalPages: req.TotalPages, Status: status, CurrentPage: 0}
	applyStatusSideEffects(b)
	if err := s.repos.BookRepo.Create(b); err != nil {
		return nil, err
	}
	res := toResponse(*b)
	return &res, nil
}

func (s *Service) GetBooks(userID uint, req commonPagination.PageRequest) (*bookSchema.BookListResponse, error) {
	status := normalizeStatus(req.Status)
	total, err := s.repos.BookRepo.CountByUser(userID, status, req.Search)
	if err != nil {
		return nil, err
	}
	items, err := s.repos.BookRepo.ListByUser(userID, req.Limit, (req.Page-1)*req.Limit, status, req.Search)
	if err != nil {
		return nil, err
	}
	resp := make([]bookSchema.BookResponse, 0, len(items))
	for _, b := range items {
		resp = append(resp, toResponse(b))
	}
	return &bookSchema.BookListResponse{Items: resp, Total: total}, nil
}

func (s *Service) GetBookByID(userID, id uint) (*bookSchema.BookDetailResponse, error) {
	b, err := s.repos.BookRepo.FindByIDAndUser(id, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, customErr.ErrNotFound
		}
		return nil, err
	}
	item := toResponse(*b)
	return &bookSchema.BookDetailResponse{Item: item}, nil
}

func (s *Service) UpdateBook(userID, id uint, req bookSchema.UpdateBookRequest) (*bookSchema.BookResponse, error) {
	b, err := s.repos.BookRepo.FindByIDAndUser(id, userID)
	if err != nil {
		return nil, customErr.ErrNotFound
	}
	if req.TotalPages <= 0 {
		return nil, customErr.ErrInvalidInput
	}
	if b.CurrentPage > req.TotalPages {
		return nil, customErr.ErrInvalidInput
	}
	b.Title, b.Author, b.TotalPages = req.Title, req.Author, req.TotalPages
	if err := s.repos.BookRepo.Save(b); err != nil {
		return nil, err
	}
	res := toResponse(*b)
	return &res, nil
}

func (s *Service) DeleteBook(userID, id uint) error {
	b, err := s.repos.BookRepo.FindByIDAndUser(id, userID)
	if err != nil {
		return customErr.ErrNotFound
	}
	return s.repos.BookRepo.Delete(b)
}

func (s *Service) UpdateBookStatus(userID, id uint, rawStatus string) (*bookSchema.BookResponse, error) {
	b, err := s.repos.BookRepo.FindByIDAndUser(id, userID)
	if err != nil {
		return nil, customErr.ErrNotFound
	}
	status := normalizeStatus(rawStatus)
	if !validStatus(status) {
		return nil, customErr.ErrInvalidInput
	}
	b.Status = status
	applyStatusSideEffects(b)
	if err := s.repos.BookRepo.Save(b); err != nil {
		return nil, err
	}
	res := toResponse(*b)
	return &res, nil
}

func (s *Service) UpdateBookBookmark(userID, id uint, currentPage int) (*bookSchema.BookResponse, error) {
	b, err := s.repos.BookRepo.FindByIDAndUser(id, userID)
	if err != nil {
		return nil, customErr.ErrNotFound
	}
	if currentPage < 0 || currentPage > b.TotalPages {
		return nil, customErr.ErrInvalidInput
	}
	b.CurrentPage = currentPage
	if currentPage == b.TotalPages {
		b.Status = constants.BookStatusFinished
		now := time.Now()
		b.CompletedAt = &now
	} else if b.Status == constants.BookStatusFinished {
		b.Status = constants.BookStatusCurrentlyReading
		b.CompletedAt = nil
	}
	if err := s.repos.BookRepo.Save(b); err != nil {
		return nil, err
	}
	res := toResponse(*b)
	return &res, nil
}

func validStatus(s string) bool {
	return s == constants.BookStatusInLibrary || s == constants.BookStatusCurrentlyReading || s == constants.BookStatusFinished || s == constants.BookStatusNextToRead
}

func normalizeStatus(s string) string {
	v := strings.TrimSpace(s)
	switch v {
	case "inLibrary", "in_library", "inlibrary":
		return constants.BookStatusInLibrary
	case "currentlyReading", "currently_reading", "currentlyreading":
		return constants.BookStatusCurrentlyReading
	case "finished":
		return constants.BookStatusFinished
	case "nextToRead", "next_to_read", "nexttoread":
		return constants.BookStatusNextToRead
	default:
		return v
	}
}

func applyStatusSideEffects(b *book.Book) {
	now := time.Now()
	switch b.Status {
	case constants.BookStatusInLibrary, constants.BookStatusNextToRead:
		b.CurrentPage = 0
		b.CompletedAt = nil
	case constants.BookStatusFinished:
		if b.CurrentPage < b.TotalPages {
			b.CurrentPage = b.TotalPages
		}
		b.CompletedAt = &now
	case constants.BookStatusCurrentlyReading:
		if b.CurrentPage >= b.TotalPages {
			b.CurrentPage = 0
		}
		b.CompletedAt = nil
	}
}

func toResponse(b book.Book) bookSchema.BookResponse {
	remaining := b.TotalPages - b.CurrentPage
	if remaining < 0 {
		remaining = 0
	}
	progress := 0.0
	if b.TotalPages > 0 {
		progress = float64(b.CurrentPage) / float64(b.TotalPages) * 100
	}
	var completed *string
	if b.CompletedAt != nil {
		v := b.CompletedAt.Format(time.RFC3339)
		completed = &v
	}
	return bookSchema.BookResponse{ID: b.ID, Title: b.Title, Author: b.Author, TotalPages: b.TotalPages, Status: normalizeStatus(b.Status), CurrentPage: b.CurrentPage, RemainingPages: remaining, ProgressPercentage: progress, CompletedAt: completed, CreatedAt: b.CreatedAt.Format(time.RFC3339), UpdatedAt: b.UpdatedAt.Format(time.RFC3339)}
}
