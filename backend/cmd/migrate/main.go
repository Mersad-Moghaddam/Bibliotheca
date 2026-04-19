package main

import (
	"flag"
	"fmt"
	"os"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"negar-backend/pkg/migrator"
)

func main() {
	action := flag.String("action", "up", "migration action: up | down | steps | goto | force | version | drop")
	steps := flag.Int("steps", 1, "number of steps for action=steps or action=down")
	version := flag.Uint("version", 0, "target version for action=goto or action=force")
	path := flag.String("path", "migrations", "path to migrations directory")
	flag.Parse()

	dsn, err := mysqlDSNFromEnv()
	if err != nil {
		exitErr(err)
	}

	m, cleanup, err := migrator.Open(migrator.Config{MySQLDSN: dsn, MigrationsDir: *path})
	if err != nil {
		exitErr(err)
	}
	defer func() {
		if closeErr := cleanup(); closeErr != nil {
			fmt.Fprintf(os.Stderr, "cleanup failed: %v\n", closeErr)
		}
	}()

	switch *action {
	case "up":
		err = m.Up()
	case "down":
		err = m.Steps(-*steps)
	case "steps":
		err = m.Steps(*steps)
	case "goto":
		if *version == 0 {
			exitErr(fmt.Errorf("-version is required for action=goto"))
		}
		err = m.Migrate(*version)
	case "force":
		err = m.Force(int(*version))
	case "drop":
		err = m.Drop()
	case "version":
		v, dirty, vErr := m.Version()
		if vErr == migrate.ErrNilVersion {
			fmt.Println("version=0 dirty=false")
			return
		}
		if vErr != nil {
			exitErr(vErr)
		}
		fmt.Printf("version=%d dirty=%t\n", v, dirty)
		return
	default:
		exitErr(fmt.Errorf("unknown action %q", *action))
	}

	if migrator.IsNoChange(err) {
		fmt.Println("no change")
		return
	}
	if err != nil {
		exitErr(err)
	}

	v, dirty, vErr := m.Version()
	if vErr == nil {
		fmt.Printf("ok version=%d dirty=%t at=%s\n", v, dirty, time.Now().Format(time.RFC3339))
	}
}

func mysqlDSNFromEnv() (string, error) {
	if dsn := os.Getenv("MYSQL_DSN"); dsn != "" {
		return dsn, nil
	}

	required := func(key string) (string, error) {
		v := os.Getenv(key)
		if v == "" {
			return "", fmt.Errorf("missing env %s", key)
		}
		return v, nil
	}

	host, err := required("MYSQL_HOST")
	if err != nil {
		return "", err
	}
	port, err := required("MYSQL_PORT")
	if err != nil {
		return "", err
	}
	user, err := required("MYSQL_USER")
	if err != nil {
		return "", err
	}
	pass, err := required("MYSQL_PASSWORD")
	if err != nil {
		return "", err
	}
	db, err := required("MYSQL_DATABASE")
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=UTC&multiStatements=true", user, pass, host, port, db), nil
}

func exitErr(err error) {
	_, _ = fmt.Fprintf(os.Stderr, "migration command failed: %v\n", err)
	os.Exit(1)
}
