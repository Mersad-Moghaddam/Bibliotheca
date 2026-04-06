# Libro Backend

Libro is a personal reading tracker backend API for authentication, book management, reading progress, wishlist management, purchase links, and dashboard summaries.

## Final Backend Architecture

```
apiSchema/
controllers/
dev.env
go.mod
go.sum
logs/
middleware/
migrations/
models/
pkg/
repositories/
services/
statics/
template/
tests/
main.go
```

## Setup

1. Install Go 1.24+.
2. Start MySQL and Redis (for local development you can use `../docker-compose.yml` from the repository root).
3. Copy env values from `dev.env` or update as needed.
4. Install dependencies:
   ```bash
   go mod download
   ```

## Environment (`dev.env`)

`dev.env` is loaded automatically at startup and controls app port, DB settings, Redis settings, JWT settings, rate limiting, and frontend CORS origin.

## Database and Redis

- MySQL stores users, books, wishlist items, and purchase links.
- Redis stores refresh tokens and auth rate-limit counters.

## Migrations

Raw SQL migrations are in `migrations/` and match the UUID-based schema used by the app:

- `000001_create_users_table.*.sql`
- `000002_create_books_table.*.sql`
- `000003_create_wishlist_table.*.sql`
- `000004_create_purchase_links_table.*.sql`

## Run

```bash
go run .
```

Server health endpoint:

- `GET /health`

## Tests

```bash
go test ./...
```

## Architecture Notes

- **Controllers** are thin and only parse/validate request payloads and return responses.
- **Services** hold business logic.
- **Repositories** own persistence access and initialization.
- **apiSchema** contains request/response contracts.
- **statics** centralizes configs/constants/errors/translations.
- **middleware/auth** handles access-token verification.
