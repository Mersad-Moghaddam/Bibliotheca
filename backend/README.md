# Negar Backend

Production-hardened Fiber + MySQL + Redis backend for Negar.

## Key Runtime Guarantees

- SQL migrations are the source of truth (no runtime `AutoMigrate` in production boot).
- Startup is fail-fast on config, DB/Redis connectivity, and migration-version safety checks.
- Unified API response envelopes.
- Explicit request validation for write endpoints.
- Request IDs + JSON structured logs.
- Graceful shutdown for HTTP, MySQL, and Redis.

## Environment

All variables are required unless noted.

- `APP_PORT`
- `JWT_SECRET` (minimum 32 chars)
- `ACCESS_TOKEN_TTL`
- `REFRESH_TOKEN_TTL`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_DSN` (optional override for migration command)
- `REDIS_ADDR`
- `REDIS_PASSWORD` (optional)
- `REDIS_DB`
- `AUTH_RATE_LIMIT_WINDOW`
- `AUTH_RATE_LIMIT_MAX`
- `FRONTEND_URL`
- `REQUIRED_SCHEMA_VERSION` (optional, default: latest migration version expected by backend)

---

## Migration Philosophy

Negar uses **`golang-migrate/migrate v4`** with SQL migration files under `backend/migrations`.

- Migrations are explicit `*.up.sql` / `*.down.sql` pairs.
- Migration history is deterministic and ordered by numeric prefix.
- Backend runtime does **not** alter schema.
- Schema evolution is an explicit pre-start step in local/dev/CI/prod.

### Current migration set

- `000001_create_users_table`
- `000002_create_books_table`
- `000003_create_wishlist_table`
- `000004_create_purchase_links_table`
- `000005_add_user_reminder_settings`
- `000006_reading_deep_features`
- `000007_upgrade_reading_goals_personalization`
- `000008_create_reading_events`
- `000009_add_books_finish_flow_fields`
- `000010_add_next_to_read_queue_fields`
- `000011_phase3_foundations`
- `000012_schema_hardening`

---

## Migration Command Workflow

All migration commands run from repo root via `make`, or directly from `backend/` using `go run ./cmd/migrate`.

### Create a new migration

```bash
make migrate-create NAME=add_book_language
```

### Apply all pending migrations

```bash
make migrate-up
```

### Roll back one or more migrations

```bash
make migrate-down STEPS=1
make migrate-down STEPS=2
```

### Move by relative steps (forward/backward)

```bash
make migrate-steps STEPS=1
make migrate-steps STEPS=-1
```

### Check current schema version / dirty state

```bash
make migrate-version
```

### Force-fix dirty state (after manual correction)

```bash
make migrate-force VERSION=12
```

### Move directly to a version

```bash
make migrate-goto VERSION=12
```

### Drop all managed tables (local/dev only)

```bash
make migrate-drop
```

---

## Local Development Workflow

1. Start MySQL + Redis.
2. Run migrations: `make migrate-up`.
3. Optional seed data: `make seed`.
4. Start backend: `cd backend && go run .`.

If startup fails with `schema_check_failed`, inspect `make migrate-version`, apply missing migrations, and retry.

---

## Docker / Compose Workflow

When using Compose, run migration command against containerized MySQL before starting traffic:

```bash
# from repo root (with mysql service available)
cd backend && go run ./cmd/migrate -action up
```

Then start/roll backend container.

---

## Production Workflow

1. Build and deploy artifact.
2. Run migration command as a release pre-step (`make migrate-up` or equivalent pipeline command).
3. Verify migration status (`make migrate-version` => latest version, `dirty=false`).
4. Start backend.

Rollback strategy:
- Prefer forward-fix migrations for production incidents.
- Use `down` migrations only with explicit operator intent and data impact review.

---

## Seeds and Migrations

- Schema changes belong in migrations.
- Demo/sample data belongs in `seeds/seed.sql`.
- Run seeds only after migrations are at expected version.

---

## Startup Schema Safety Behavior

On startup, backend:

1. Connects to MySQL.
2. Verifies `schema_migrations` exists and is not dirty.
3. Verifies schema version is at least `REQUIRED_SCHEMA_VERSION`.
4. Performs model/table column presence assertions as an additional guardrail.

Backend exits early if checks fail, preventing runtime behavior against partial schema.

## Response Contract

- Success: `{ "data": ..., "meta": ...? }`
- Error: `{ "code": "...", "message": "...", "details": ...? }`
- Validation error details:

```json
{
  "code": "validation_error",
  "message": "Request validation failed",
  "details": {
    "fields": {
      "fieldName": "reason"
    }
  }
}
```

## Health Endpoints

- `GET /health`
- `GET /ready`
- `GET /metrics` (operational metrics for scraping)

## Local run

```bash
go mod download
go run .
```

## Tests

```bash
go test ./...
```

## OpenAPI

Canonical API specification: `../docs/api/openapi.yaml`.
