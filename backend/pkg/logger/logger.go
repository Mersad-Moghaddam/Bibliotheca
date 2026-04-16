package logger

import (
	"fmt"
	"os"
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

const (
	EnvDevelopment = "development"
	EnvProduction  = "production"
)

func New(serviceName, env, level string) (*zap.Logger, error) {
	cfg := zap.NewProductionConfig()
	if strings.EqualFold(env, EnvDevelopment) || strings.EqualFold(env, "local") {
		cfg = zap.NewDevelopmentConfig()
	}

	cfg.Encoding = "json"
	cfg.OutputPaths = []string{"stdout"}
	cfg.ErrorOutputPaths = []string{"stderr"}
	cfg.EncoderConfig.TimeKey = "timestamp"
	cfg.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	cfg.EncoderConfig.MessageKey = "event"
	cfg.DisableStacktrace = true

	if level == "" {
		if strings.EqualFold(env, EnvDevelopment) || strings.EqualFold(env, "local") {
			level = "debug"
		} else {
			level = "info"
		}
	}

	var lvl zapcore.Level
	if err := lvl.Set(strings.ToLower(level)); err != nil {
		return nil, fmt.Errorf("invalid log level %q: %w", level, err)
	}
	cfg.Level = zap.NewAtomicLevelAt(lvl)

	logger, err := cfg.Build(
		zap.AddCaller(),
		zap.AddCallerSkip(1),
		zap.AddStacktrace(zapcore.ErrorLevel),
		zap.Fields(
			zap.String("service", serviceName),
			zap.String("environment", env),
			zap.Int("pid", os.Getpid()),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("build logger: %w", err)
	}
	return logger, nil
}
