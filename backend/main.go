package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"libro-backend/controllers/mainController"
	"libro-backend/pkg/logger"
	"libro-backend/repositories"
	"libro-backend/repositories/initRepositories"
	"libro-backend/services/core"
	"libro-backend/statics/configs"
)

func main() {
	_ = godotenv.Load("dev.env")

	cfg, err := configs.Load()
	if err != nil {
		_, _ = os.Stderr.WriteString("config_load_failed: " + err.Error() + "\n")
		os.Exit(1)
	}

	appLogger, err := logger.New("negar-backend", cfg.AppEnv, cfg.LogLevel)
	if err != nil {
		_, _ = os.Stderr.WriteString("logger_init_failed: " + err.Error() + "\n")
		os.Exit(1)
	}
	defer func() { _ = appLogger.Sync() }()

	appLogger.Info("startup", zap.String("phase", "config_loaded"))

	db, err := gorm.Open(mysql.Open(cfg.MySQLDSN()), &gorm.Config{})
	if err != nil {
		appLogger.Fatal("mysql_connect_failed", zap.String("dependency", "mysql"), zap.Error(err))
	}
	appLogger.Info("startup", zap.String("phase", "mysql_connected"))

	if err = repositories.AssertSchema(db); err != nil {
		appLogger.Fatal("schema_check_failed", zap.String("dependency", "mysql"), zap.Error(err))
	}
	appLogger.Info("startup", zap.String("phase", "schema_verified"))

	rdb := redis.NewClient(&redis.Options{Addr: cfg.RedisAddr, Password: cfg.RedisPassword, DB: cfg.RedisDB})
	if err = rdb.Ping(context.Background()).Err(); err != nil {
		appLogger.Fatal("redis_connect_failed", zap.String("dependency", "redis"), zap.Error(err))
	}
	appLogger.Info("startup", zap.String("phase", "redis_connected"))

	deps := initRepositories.New(db, rdb)
	ir := repositories.NewInitialRepositories(deps)
	server := core.NewServer(cfg, mainController.DepsFromInitialRepositories(ir, cfg), appLogger)

	listenErrCh := make(chan error, 1)
	go func() {
		appLogger.Info("http_server_listening", zap.String("port", cfg.AppPort))
		listenErrCh <- server.Listen(":" + cfg.AppPort)
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-sigCh:
		appLogger.Info("shutdown_signal_received", zap.String("signal", sig.String()))
	case listenErr := <-listenErrCh:
		if listenErr != nil {
			appLogger.Fatal("http_server_stopped", zap.Error(listenErr))
		}
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err = server.ShutdownWithContext(ctx); err != nil {
		appLogger.Error("http_server_shutdown_failed", zap.Error(err))
	} else {
		appLogger.Info("http_server_shutdown_complete")
	}

	sqlDB, dbErr := db.DB()
	if dbErr != nil {
		appLogger.Error("mysql_handle_failed", zap.Error(dbErr))
	} else if sqlDB != nil {
		if closeErr := sqlDB.Close(); closeErr != nil {
			appLogger.Error("mysql_close_failed", zap.Error(closeErr))
		}
	}

	if err = rdb.Close(); err != nil {
		appLogger.Error("redis_close_failed", zap.Error(err))
	}

	appLogger.Info("shutdown_complete")
}
