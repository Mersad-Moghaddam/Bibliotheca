# Negar

Negar is a full-stack reading tracker and productivity app for planning, tracking, and improving reading habits. It ships as a monorepo with a Go/Fiber backend and a React/Vite frontend.

## Features
- JWT auth with access/refresh flow.
- Dashboard summary, analytics, and reading insights.
- Library tracking (in-library, reading, finished, next-to-read).
- Sessions, goals, and progress updates.
- Wishlist with purchase links.
- Profile, password, and reminder settings.
- English/Persian localization with RTL/LTR switching.
- Theme persistence with legacy Libro compatibility fallback keys.

## Tech stack
### Backend
- Go 1.24
- Fiber v2
- GORM
- MySQL
- Redis
- Zap

### Frontend
- React 19 + TypeScript
- Vite
- Zustand
- TanStack Query
- Axios
- TailwindCSS
- React Hook Form + Zod

### Platform
- Docker + Docker Compose
- nginx (frontend serving + API proxy)
- GitHub Actions CI

## Repository structure
```text
.
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── docker-compose.prod.yml
└── Makefile
```

## Environment
Use:
- root `.env.example`
- `backend/dev.env`
- `frontend/.env.example`

### Required backend variables
`APP_PORT`, `APP_ENV`, `LOG_LEVEL`, `JWT_SECRET`, `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL`, `AUTH_RATE_LIMIT_WINDOW`, `AUTH_RATE_LIMIT_MAX`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `REDIS_ADDR`, `REDIS_PASSWORD` (optional), `REDIS_DB`, `FRONTEND_URL`.

## Local development
### Docker (recommended)
```bash
docker compose up --build
```

### Native
```bash
# backend
cd backend
go run .

# frontend
cd frontend
npm ci
npm run dev
```

## Migrations and seed
- Apply `backend/migrations/*.up.sql` in order before running the backend.
- Seed sample data:
```bash
docker compose exec -T mysql mysql -uroot -proot negar < backend/seeds/seed.sql
```

## Testing
```bash
# backend
cd backend
go test ./...

# frontend
cd frontend
npm test -- --run
```

## Linting and formatting
```bash
# backend
cd backend
gofmt -w .
golangci-lint run

# frontend
cd frontend
npm run lint
npm run format
```

## API / OpenAPI
- OpenAPI spec: `docs/api/openapi.yaml`
- API docs: `docs/api.md`

## Deployment notes
- Backend uses distroless runtime image (`backend/Dockerfile`).
- Frontend is built and served by nginx (`frontend/Dockerfile`, `frontend/nginx.conf`).
- Use `docker-compose.prod.yml` for production-style local rehearsal.
- Readiness endpoint (`/ready`) checks MySQL and Redis connectivity.

## Additional docs
- Architecture: `docs/architecture.md`
- Release/deployment: `docs/release-and-deployment.md`
- Libro -> Negar compatibility: `docs/compatibility.md`
