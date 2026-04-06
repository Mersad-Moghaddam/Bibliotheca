package persistence

import (
	"context"

	"bibliotheca/backend/internal/domain"
	"bibliotheca/backend/internal/ports"
	"bibliotheca/backend/pkg/apperror"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BookRepository struct{ db *gorm.DB }

func NewBookRepository(db *gorm.DB) *BookRepository { return &BookRepository{db: db} }

func (r *BookRepository) List(ctx context.Context, userID uuid.UUID, filter ports.BookFilter) ([]domain.Book, error) {
	q := r.db.WithContext(ctx).Where("user_id = ?", userID)
	if filter.Search != "" {
		q = q.Where("title LIKE ? OR author LIKE ?", "%"+filter.Search+"%", "%"+filter.Search+"%")
	}
	if filter.Status != "" {
		q = q.Where("status = ?", filter.Status)
	}
	var books []domain.Book
	return books, q.Order("updated_at DESC").Find(&books).Error
}

func (r *BookRepository) Create(ctx context.Context, book *domain.Book) error {
	return r.db.WithContext(ctx).Create(book).Error
}

func (r *BookRepository) GetByID(ctx context.Context, userID, bookID uuid.UUID) (*domain.Book, error) {
	var b domain.Book
	err := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", bookID, userID).First(&b).Error
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *BookRepository) Update(ctx context.Context, book *domain.Book) error {
	return r.db.WithContext(ctx).Save(book).Error
}

func (r *BookRepository) Delete(ctx context.Context, userID, bookID uuid.UUID) error {
	res := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", bookID, userID).Delete(&domain.Book{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return apperror.ErrNotFound
	}
	return nil
}

func (r *BookRepository) SummaryCounts(ctx context.Context, userID uuid.UUID) (map[string]int64, error) {
	counts := map[string]int64{"total": 0, "currently_reading": 0, "finished": 0, "next_to_read": 0}
	for key, status := range map[string]domain.BookStatus{
		"currently_reading": domain.BookStatusCurrentlyReading,
		"finished":          domain.BookStatusFinished,
		"next_to_read":      domain.BookStatusNextToRead,
	} {
		var c int64
		if err := r.db.WithContext(ctx).Model(&domain.Book{}).Where("user_id = ? AND status = ?", userID, status).Count(&c).Error; err != nil {
			return nil, err
		}
		counts[key] = c
	}
	var total int64
	if err := r.db.WithContext(ctx).Model(&domain.Book{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, err
	}
	counts["total"] = total
	return counts, nil
}

func (r *BookRepository) Recent(ctx context.Context, userID uuid.UUID, limit int) ([]domain.Book, error) {
	var b []domain.Book
	return b, r.db.WithContext(ctx).Where("user_id = ?", userID).Order("updated_at DESC").Limit(limit).Find(&b).Error
}
