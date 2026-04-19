# Negar Backend

Production-hardened Fiber + MySQL + Redis backend for Negar.

## Key Runtime Guarantees

- Migration-driven schema only (no runtime `AutoMigrate`).
- Strict config validation on startup (fail-fast).
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
- `REDIS_ADDR`
- `REDIS_PASSWORD` (optional)
- `REDIS_DB`
- `AUTH_RATE_LIMIT_WINDOW`
- `AUTH_RATE_LIMIT_MAX`
- `FRONTEND_URL`

## Migrations (Dev + Prod)

Schema is managed under `migrations/`:

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

### Development workflow

1. Start DB/Redis.
2. Apply all `*.up.sql` migrations in order.
3. Run backend with `go run .`.
4. For schema changes: add a new numbered `up/down` migration pair, run it locally, then update models/repositories.

### Production workflow

1. Build and deploy artifact.
2. Run migrations before app rollout (or as a release pre-step).
3. Start application; it performs schema presence checks and fails fast when tables are missing.
4. Rollback with matching `*.down.sql` only when explicitly required.

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
