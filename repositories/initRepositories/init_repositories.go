package initRepositories

import (
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Dependencies struct {
	DB    *gorm.DB
	Redis *redis.Client
}

func New(db *gorm.DB, redis *redis.Client) *Dependencies {
	return &Dependencies{DB: db, Redis: redis}
}
