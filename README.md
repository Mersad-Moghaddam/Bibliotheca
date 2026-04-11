# Libro Monorepo

Libro is a full-stack personal reading tracker with a Go/Fiber backend and a React/Vite frontend.

## Architecture Overview

- **Frontend (`frontend/`)**: React 19 + Vite + TypeScript + Zustand + Tailwind.
  - Routing/UI composition in `src/pages`, `src/components`, and `src/layouts`.
  - API access in `src/api` and feature-level API adapters in `src/features`.
- **Backend (`backend/`)**: Go + Fiber + GORM + MySQL + Redis.
  - HTTP controllers in `controllers`, business logic in `services`, persistence in `repositories`.
  - Shared utilities and static concerns in `pkg` and `statics`.
- **Infrastructure**:
  - `docker-compose.yml` provides MySQL + Redis + app services.
  - Root `.env.example` centralizes local development defaults.

## Development Setup

### Prerequisites

- Go `1.24+`
- Node.js `20+` and npm
- Docker (optional, for full stack dependencies)

### Local development

```bash
# Backend
cd backend
go mod download
go run .

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

### Monorepo shortcuts

Use root make targets for consistent workflows:

```bash
make build
make test
make lint
```

## Test Strategy

Libro now applies layered tests:

- **Frontend**
  - Unit/state tests (e.g., Zustand auth store)
  - Component interaction tests (React Testing Library)
  - Page-level tests with mocked API boundaries
- **Backend**
  - Service unit tests for auth and book transitions
  - Integration-style test wiring service + real repository over in-memory SQLite

Run all tests from root:

```bash
make test
```

## Quality Gates

- Frontend linting/formatting/type safety:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Backend linting/testing:
  - `golangci-lint run ./...`
  - `go test ./...`

## Consistency Rules

- **Error handling style**
  - Return domain errors from services (`customErr`) for predictable controller responses.
  - Avoid panics in request flows; propagate errors with context from repository/service boundaries.
- **Folder naming conventions**
  - Keep feature folders lowercase (`bookService`, `authService`, `language-toggle`).
  - Place tests next to the package they validate whenever possible.
- **Code hygiene**
  - Keep lint checks green before merge.
  - Remove unused imports/dependencies and dead code as part of each PR.

## Repository Structure

```text
.
├── backend/
├── frontend/
├── docs/
├── Makefile
└── docker-compose.yml
```
