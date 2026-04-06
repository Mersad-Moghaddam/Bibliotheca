package main

import (
	"context"
	"log"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"libro-backend/controllers/mainController"
	"libro-backend/repositories"
	"libro-backend/repositories/initRepositories"
	"libro-backend/services/core"
	"libro-backend/statics/configs"
)

func main() {
	_ = godotenv.Load("dev.env")

	cfg, err := configs.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := gorm.Open(mysql.Open(cfg.MySQLDSN()), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	if err = repositories.AutoMigrate(db); err != nil {
		log.Fatal(err)
	}

	rdb := redis.NewClient(&redis.Options{Addr: cfg.RedisAddr, Password: cfg.RedisPassword, DB: cfg.RedisDB})
	if err = rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatal(err)
	}

	deps := initRepositories.New(db, rdb)
	ir := repositories.NewInitialRepositories(deps)
	server := core.NewServer(cfg, mainController.DepsFromInitialRepositories(ir))

	log.Printf("libro-backend running on :%s", cfg.AppPort)
	if err = server.Listen(":" + cfg.AppPort); err != nil {
		log.Fatal(err)
	}
}
