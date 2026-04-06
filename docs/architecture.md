# Libro Architecture

## Overview

Libro is a monorepo with strict frontend/backend separation:

- `backend/`: single, canonical Go backend architecture.
- `frontend/`: independent React + Vite application.
- Root: docs and cross-service orchestration only.

## Backend (`/backend`)

### Layers

- `cmd/api`: application entrypoint.
- `config`: environment-driven configuration loading.
- `internal/domain`: core domain models.
- `internal/ports`: repository and boundary interfaces.
- `internal/application`: use-case services.
- `internal/adapters/http`: Fiber router, middleware, handlers.
- `internal/adapters/persistence`: GORM repositories and DB wiring.
- `internal/adapters/cache`: Redis-backed auth/session storage.
- `pkg`: reusable technical utilities (JWT, password, app errors).
- `migrations`: SQL migration files.

### Runtime Dependencies

- MySQL for primary data storage.
- Redis for token/session and auth rate limiting support.

## Frontend (`/frontend`)

### Responsibilities

- UI rendering, routing, state, themes, and user interactions.
- API communication via HTTP client in `src/api`.
- No backend code imports or backend-structure coupling.

### Build/Runtime

- Vite-based development and build pipeline.
- Environment supplied through frontend-specific `.env` values (`VITE_*`).

## Infrastructure

- `docker-compose.yml` orchestrates `frontend`, `backend`, `mysql`, and `redis`.
- Backend image builds from `/backend` only.
- Frontend image builds from `/frontend` only.

## Design Guarantees

1. Exactly one backend architecture exists and lives in `/backend`.
2. Frontend is fully self-contained in `/frontend`.
3. No root-level legacy backend layers remain.
