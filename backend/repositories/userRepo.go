package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"negar-backend/models/user"
)

type userRepo struct{ db *gorm.DB }

func NewUserRepo(db *gorm.DB) UserRepository { return &userRepo{db: db} }
func (r *userRepo) Create(ctx context.Context, u *user.User) error {
	return r.db.WithContext(ctx).Create(u).Error
}
func (r *userRepo) GetByEmail(ctx context.Context, email string) (*user.User, error) {
	var u user.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&u).Error
	return &u, err
}
func (r *userRepo) GetByID(ctx context.Context, id uuid.UUID) (*user.User, error) {
	var u user.User
	err := r.db.WithContext(ctx).First(&u, "id = ?", id).Error
	return &u, err
}
func (r *userRepo) Update(ctx context.Context, u *user.User) error {
	return r.db.WithContext(ctx).Save(u).Error
}

func (r *userRepo) ListReminderEnabled(ctx context.Context) ([]user.User, error) {
	var users []user.User
	err := r.db.WithContext(ctx).
		Select("id", "reminder_enabled", "reminder_time", "reminder_frequency", "reminder_timezone").
		Where("reminder_enabled = ?", true).
		Find(&users).Error
	return users, err
}
