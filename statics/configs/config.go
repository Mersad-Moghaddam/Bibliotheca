package configs

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	AppPort              string
	JWTSecret            string
	AccessTokenTTL       time.Duration
	RefreshTokenTTL      time.Duration
	MySQLHost            string
	MySQLPort            string
	MySQLUser            string
	MySQLPassword        string
	MySQLDatabase        string
	RedisAddr            string
	RedisPassword        string
	RedisDB              int
	RateLimitWindow      time.Duration
	RateLimitMaxAttempts int64
	FrontendURL          string
}

func Load() (*Config, error) {
	redisDB, err := strconv.Atoi(getEnv("REDIS_DB", "0"))
	if err != nil {
		return nil, fmt.Errorf("invalid REDIS_DB: %w", err)
	}
	accessTTL, err := time.ParseDuration(getEnv("ACCESS_TOKEN_TTL", "15m"))
	if err != nil {
		return nil, fmt.Errorf("invalid ACCESS_TOKEN_TTL: %w", err)
	}
	refreshTTL, err := time.ParseDuration(getEnv("REFRESH_TOKEN_TTL", "168h"))
	if err != nil {
		return nil, fmt.Errorf("invalid REFRESH_TOKEN_TTL: %w", err)
	}
	rateWindow, err := time.ParseDuration(getEnv("AUTH_RATE_LIMIT_WINDOW", "1m"))
	if err != nil {
		return nil, fmt.Errorf("invalid AUTH_RATE_LIMIT_WINDOW: %w", err)
	}
	rateMax, err := strconv.ParseInt(getEnv("AUTH_RATE_LIMIT_MAX", "20"), 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid AUTH_RATE_LIMIT_MAX: %w", err)
	}

	return &Config{
		AppPort:              getEnv("APP_PORT", "8080"),
		JWTSecret:            getEnv("JWT_SECRET", "super-secret-change-me"),
		AccessTokenTTL:       accessTTL,
		RefreshTokenTTL:      refreshTTL,
		MySQLHost:            getEnv("MYSQL_HOST", "localhost"),
		MySQLPort:            getEnv("MYSQL_PORT", "3306"),
		MySQLUser:            getEnv("MYSQL_USER", "root"),
		MySQLPassword:        getEnv("MYSQL_PASSWORD", "root"),
		MySQLDatabase:        getEnv("MYSQL_DATABASE", "libro"),
		RedisAddr:            getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:        getEnv("REDIS_PASSWORD", ""),
		RedisDB:              redisDB,
		RateLimitWindow:      rateWindow,
		RateLimitMaxAttempts: rateMax,
		FrontendURL:          getEnv("FRONTEND_URL", "http://localhost:5173"),
	}, nil
}

func (c *Config) MySQLDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", c.MySQLUser, c.MySQLPassword, c.MySQLHost, c.MySQLPort, c.MySQLDatabase)
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
