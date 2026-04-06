package main

import (
	"context"
	"log"
	"time"

	"bibliotheca/backend/config"
	"bibliotheca/backend/internal/adapters/cache"
	httpadapter "bibliotheca/backend/internal/adapters/http"
	"bibliotheca/backend/internal/adapters/http/handlers"
	"bibliotheca/backend/internal/adapters/persistence"
	"bibliotheca/backend/internal/application"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	_ = godotenv.Load()
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := gorm.Open(mysql.Open(cfg.MySQLDSN()), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	if err = persistence.AutoMigrate(db); err != nil {
		log.Fatal(err)
	}

	rdb := redis.NewClient(&redis.Options{Addr: cfg.RedisAddr, Password: cfg.RedisPassword, DB: cfg.RedisDB})
	if err = rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatal(err)
	}

	userRepo := persistence.NewUserRepository(db)
	bookRepo := persistence.NewBookRepository(db)
	wishlistRepo := persistence.NewWishlistRepository(db)
	redisStore := cache.NewRedisStore(rdb)

	authSvc := application.NewAuthService(userRepo, redisStore, cfg.JWTSecret, cfg.AccessTokenTTL, cfg.RefreshTokenTTL, cfg.RateLimitWindow, cfg.RateLimitMaxAttempts)
	userSvc := application.NewUserService(userRepo)
	bookSvc := application.NewBookService(bookRepo)
	wishSvc := application.NewWishlistService(wishlistRepo)
	dashSvc := application.NewDashboardService(bookRepo, wishlistRepo)

	app := httpadapter.NewServer(cfg.FrontendURL)
	httpadapter.RegisterRoutes(app, httpadapter.RouteDeps{
		JWTSecret: cfg.JWTSecret,
		Auth:      handlers.NewAuthHandler(authSvc, userSvc),
		Books:     handlers.NewBookHandler(bookSvc),
		Wishlist:  handlers.NewWishlistHandler(wishSvc),
		Dashboard: handlers.NewDashboardHandler(dashSvc),
		User:      handlers.NewUserHandler(userSvc),
	})

	log.Printf("bibliotheca backend running on :%s", cfg.AppPort)
	if err = app.Listen(":" + cfg.AppPort); err != nil {
		log.Fatal(err)
	}
	_ = rdb.Close()
	_ = time.Now()
}
