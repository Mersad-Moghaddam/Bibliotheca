package migrator

import (
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/go-sql-driver/mysql"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

type Config struct {
	MySQLDSN      string
	MigrationsDir string
}

func Open(cfg Config) (*migrate.Migrate, func() error, error) {
	if cfg.MySQLDSN == "" {
		return nil, nil, fmt.Errorf("mysql dsn is required")
	}
	if cfg.MigrationsDir == "" {
		cfg.MigrationsDir = "migrations"
	}

	absDir, err := filepath.Abs(cfg.MigrationsDir)
	if err != nil {
		return nil, nil, fmt.Errorf("resolve migrations dir: %w", err)
	}
	if _, err = os.Stat(absDir); err != nil {
		return nil, nil, fmt.Errorf("migrations dir not accessible: %w", err)
	}

	db, err := sql.Open("mysql", cfg.MySQLDSN)
	if err != nil {
		return nil, nil, fmt.Errorf("open mysql: %w", err)
	}

	if err = db.Ping(); err != nil {
		_ = db.Close()
		return nil, nil, fmt.Errorf("ping mysql: %w", err)
	}

	driver, err := mysql.WithInstance(db, &mysql.Config{MigrationsTable: "schema_migrations"})
	if err != nil {
		_ = db.Close()
		return nil, nil, fmt.Errorf("build migration mysql driver: %w", err)
	}

	m, err := migrate.NewWithDatabaseInstance("file://"+absDir, "mysql", driver)
	if err != nil {
		_ = db.Close()
		return nil, nil, fmt.Errorf("open migrate: %w", err)
	}

	cleanup := func() error {
		srcErr, dbErr := m.Close()
		if srcErr != nil {
			return srcErr
		}
		return dbErr
	}

	return m, cleanup, nil
}

func IsNoChange(err error) bool {
	return err != nil && errors.Is(err, migrate.ErrNoChange)
}
