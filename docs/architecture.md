# Negar Architecture

## Monorepo layout
- `backend`: Go 1.24 API (Fiber + GORM + MySQL + Redis + Zap).
- `frontend`: React 19 + TypeScript SPA (Vite + Zustand + TanStack Query + Axios + TailwindCSS).
- Root compose/docker and CI orchestrate local and production-style runs.

## Backend runtime shape
- Layering: `controllers -> services -> repositories`.
- Transport concerns remain in controllers (request parsing, validation, response envelope).
- Services hold domain logic and policies.
- Repositories isolate persistence and query behavior.

## API conventions
- Success envelope: `{ data, meta? }`.
- Error envelope: `{ code, message, details? }`.
- Auth uses bearer access tokens and rotating refresh tokens with Redis-backed token IDs.

## Frontend runtime shape
- Route-level composition in `App.tsx` and page modules in `src/pages`.
- Feature API hooks in `src/features/*`.
- Axios client handles auth header injection and refresh retry.
- i18n and theme providers persist current settings while honoring legacy Libro keys for compatibility.

## Operational behavior
- Readiness checks MySQL and Redis connectivity with timeout.
- Request IDs and structured request logs are applied globally.
- `/metrics` exposes operational counters/histograms and dependency readiness gauges.
- Startup fails fast on missing/invalid env.

## Product analytics behavior
- Product analytics is frontend-driven and centralized in `src/shared/analytics`.
- Event taxonomy is documented in `docs/analytics-event-model.md`.
- Product analytics payloads exclude sensitive data and are intentionally separate from backend operational logs/metrics.
