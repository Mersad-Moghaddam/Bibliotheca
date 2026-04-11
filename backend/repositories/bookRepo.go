package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"libro-backend/models/book"
	"libro-backend/models/bookNote"
	"libro-backend/statics/constants"
	"libro-backend/statics/customErr"
)

type bookRepo struct{ db *gorm.DB }

func NewBookRepo(db *gorm.DB) BookRepository { return &bookRepo{db: db} }

func (r *bookRepo) List(ctx context.Context, userID uuid.UUID, filter BookFilter) ([]book.Book, int64, error) {
	q := r.db.WithContext(ctx).Model(&book.Book{}).Where("user_id = ?", userID)
	if filter.Search != "" {
		q = q.Where("title LIKE ? OR author LIKE ?", "%"+filter.Search+"%", "%"+filter.Search+"%")
	}
	if filter.Status != "" {
		q = q.Where("status = ?", filter.Status)
	}
	if filter.Genre != "" {
		q = q.Where("genre = ?", filter.Genre)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	orderBy := "updated_at"
	if filter.SortBy != "" {
		orderBy = filter.SortBy
	}
	order := "DESC"
	if filter.Order != "" {
		order = filter.Order
	}
	query := q.Order(fmt.Sprintf("%s %s", orderBy, order))
	if filter.Limit > 0 {
		query = query.Offset((filter.Page - 1) * filter.Limit).Limit(filter.Limit)
	}
	var books []book.Book
	err := query.Find(&books).Error
	return books, total, err
}
func (r *bookRepo) Create(ctx context.Context, b *book.Book) error {
	return r.db.WithContext(ctx).Create(b).Error
}
func (r *bookRepo) GetByID(ctx context.Context, userID, bookID uuid.UUID) (*book.Book, error) {
	var b book.Book
	err := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", bookID, userID).First(&b).Error
	if err != nil {
		return nil, err
	}
	return &b, nil
}
func (r *bookRepo) Update(ctx context.Context, b *book.Book) error {
	return r.db.WithContext(ctx).Save(b).Error
}
func (r *bookRepo) Delete(ctx context.Context, userID, bookID uuid.UUID) error {
	res := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", bookID, userID).Delete(&book.Book{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return customErr.ErrNotFound
	}
	return nil
}
func (r *bookRepo) SummaryCounts(ctx context.Context, userID uuid.UUID) (map[string]int64, error) {
	counts := map[string]int64{"total": 0, constants.BookStatusCurrentlyRead: 0, constants.BookStatusFinished: 0, constants.BookStatusNextToRead: 0, constants.BookStatusInLibrary: 0}
	for _, status := range []string{constants.BookStatusInLibrary, constants.BookStatusCurrentlyRead, constants.BookStatusFinished, constants.BookStatusNextToRead} {
		var c int64
		if err := r.db.WithContext(ctx).Model(&book.Book{}).Where("user_id = ? AND status = ?", userID, status).Count(&c).Error; err != nil {
			return nil, err
		}
		counts[status] = c
	}
	var total int64
	if err := r.db.WithContext(ctx).Model(&book.Book{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, err
	}
	counts["total"] = total
	return counts, nil
}
func (r *bookRepo) Recent(ctx context.Context, userID uuid.UUID, limit int) ([]book.Book, error) {
	var b []book.Book
	return b, r.db.WithContext(ctx).Where("user_id = ?", userID).Order("updated_at DESC").Limit(limit).Find(&b).Error
}

func (r *bookRepo) ListNotes(ctx context.Context, userID, bookID uuid.UUID) ([]bookNote.BookNote, error) {
	var notes []bookNote.BookNote
	err := r.db.WithContext(ctx).Where("user_id = ? AND book_id = ?", userID, bookID).Order("created_at DESC").Find(&notes).Error
	return notes, err
}

func (r *bookRepo) CreateNote(ctx context.Context, n *bookNote.BookNote) error {
	return r.db.WithContext(ctx).Create(n).Error
}
