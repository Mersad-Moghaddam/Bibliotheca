package configs

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	AppPort               string
	AppEnv                string
	LogLevel              string
	JWTSecret             string
	AccessTokenTTL        time.Duration
	RefreshTokenTTL       time.Duration
	MySQLHost             string
	MySQLPort             string
	MySQLUser             string
	MySQLPassword         string
	MySQLDatabase         string
	RedisAddr             string
	RedisPassword         string
	RedisDB               int
	RateLimitWindow       time.Duration
	RateLimitMaxAttempts  int64
	FrontendURL           string
	RequiredSchemaVersion uint
}

func Load() (*Config, error) {
	appPort, err := requiredEnv("APP_PORT")
	if err != nil {
		return nil, err
	}
	jwtSecret, err := requiredEnv("JWT_SECRET")
	if err != nil {
		return nil, err
	}
	if len(jwtSecret) < 32 {
		return nil, fmt.Errorf("JWT_SECRET must be at least 32 chars")
	}
	redisDB, err := parseInt("REDIS_DB")
	if err != nil {
		return nil, err
	}
	accessTTL, err := parseDuration("ACCESS_TOKEN_TTL")
	if err != nil {
		return nil, err
	}
	refreshTTL, err := parseDuration("REFRESH_TOKEN_TTL")
	if err != nil {
		return nil, err
	}
	rateWindow, err := parseDuration("AUTH_RATE_LIMIT_WINDOW")
	if err != nil {
		return nil, err
	}
	rateMaxRaw, err := requiredEnv("AUTH_RATE_LIMIT_MAX")
	if err != nil {
		return nil, err
	}
	rateMax, err := strconv.ParseInt(rateMaxRaw, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid AUTH_RATE_LIMIT_MAX: %w", err)
	}
	mysqlHost, err := requiredEnv("MYSQL_HOST")
	if err != nil {
		return nil, err
	}
	mysqlPort, err := requiredEnv("MYSQL_PORT")
	if err != nil {
		return nil, err
	}
	mysqlUser, err := requiredEnv("MYSQL_USER")
	if err != nil {
		return nil, err
	}
	mysqlPassword, err := requiredEnv("MYSQL_PASSWORD")
	if err != nil {
		return nil, err
	}
	mysqlDatabase, err := requiredEnv("MYSQL_DATABASE")
	if err != nil {
		return nil, err
	}
	redisAddr, err := requiredEnv("REDIS_ADDR")
	if err != nil {
		return nil, err
	}
	frontendURL, err := requiredEnv("FRONTEND_URL")
	if err != nil {
		return nil, err
	}

	requiredSchemaVersion := uint(parseIntOrDefault("REQUIRED_SCHEMA_VERSION", 12))

	return &Config{
		AppPort:               appPort,
		AppEnv:                envOrDefault("APP_ENV", "development"),
		LogLevel:              envOrDefault("LOG_LEVEL", ""),
		JWTSecret:             jwtSecret,
		AccessTokenTTL:        accessTTL,
		RefreshTokenTTL:       refreshTTL,
		MySQLHost:             mysqlHost,
		MySQLPort:             mysqlPort,
		MySQLUser:             mysqlUser,
		MySQLPassword:         mysqlPassword,
		MySQLDatabase:         mysqlDatabase,
		RedisAddr:             redisAddr,
		RedisPassword:         os.Getenv("REDIS_PASSWORD"),
		RedisDB:               redisDB,
		RateLimitWindow:       rateWindow,
		RateLimitMaxAttempts:  rateMax,
		FrontendURL:           frontendURL,
		RequiredSchemaVersion: requiredSchemaVersion,
	}, nil
}

func (c *Config) MySQLDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", c.MySQLUser, c.MySQLPassword, c.MySQLHost, c.MySQLPort, c.MySQLDatabase)
}

func requiredEnv(key string) (string, error) {
	if v := os.Getenv(key); v != "" {
		return v, nil
	}
	return "", fmt.Errorf("missing required env: %s", key)
}

func parseDuration(key string) (time.Duration, error) {
	v, err := requiredEnv(key)
	if err != nil {
		return 0, err
	}
	d, err := time.ParseDuration(v)
	if err != nil {
		return 0, fmt.Errorf("invalid %s: %w", key, err)
	}
	return d, nil
}

func parseInt(key string) (int, error) {
	v, err := requiredEnv(key)
	if err != nil {
		return 0, err
	}
	iv, err := strconv.Atoi(v)
	if err != nil {
		return 0, fmt.Errorf("invalid %s: %w", key, err)
	}
	return iv, nil
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func parseIntOrDefault(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	iv, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return iv
}
