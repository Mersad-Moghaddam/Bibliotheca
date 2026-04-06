package repositories

import (
	"strings"

	"gorm.io/gorm"
	"libro/models/book"
)

type BookRepo struct{ db *gorm.DB }

func NewBookRepo(db *gorm.DB) *BookRepo       { return &BookRepo{db: db} }
func (r *BookRepo) Create(b *book.Book) error { return r.db.Create(b).Error }
func (r *BookRepo) CountByUser(userID uint, status, search string) (int64, error) {
	var total int64
	q := r.db.Model(&book.Book{}).Where("user_id = ?", userID)
	if status != "" {
		q = q.Where("status = ?", status)
	}
	if search != "" {
		like := "%" + strings.ToLower(search) + "%"
		q = q.Where("LOWER(title) LIKE ? OR LOWER(author) LIKE ?", like, like)
	}
	return total, q.Count(&total).Error
}
func (r *BookRepo) ListByUser(userID uint, limit, offset int, status, search string) ([]book.Book, error) {
	var items []book.Book
	q := r.db.Where("user_id = ?", userID)
	if status != "" {
		q = q.Where("status = ?", status)
	}
	if search != "" {
		like := "%" + strings.ToLower(search) + "%"
		q = q.Where("LOWER(title) LIKE ? OR LOWER(author) LIKE ?", like, like)
	}
	err := q.Limit(limit).Offset(offset).Order("id desc").Find(&items).Error
	return items, err
}
func (r *BookRepo) FindByIDAndUser(id, userID uint) (*book.Book, error) {
	var b book.Book
	if err := r.db.Where("id = ? and user_id = ?", id, userID).First(&b).Error; err != nil {
		return nil, err
	}
	return &b, nil
}
func (r *BookRepo) Save(b *book.Book) error   { return r.db.Save(b).Error }
func (r *BookRepo) Delete(b *book.Book) error { return r.db.Delete(b).Error }
func (r *BookRepo) ListCurrentReading(userID uint) ([]book.Book, error) {
	var items []book.Book
	err := r.db.Where("user_id = ? and status = ?", userID, "currentlyReading").Find(&items).Error
	return items, err
}
