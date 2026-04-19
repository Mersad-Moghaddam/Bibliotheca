# Runbooks

## Local development runbook
1. Start dependencies with Docker (`docker compose up -d mysql redis`), or full stack with `docker compose up --build`.
2. Apply backend migrations from `backend/migrations`.
3. Backend:
   - `cd backend && go run .`
4. Frontend:
   - `cd frontend && npm ci && npm run dev`
5. Smoke-check:
   - `GET /health`
   - `GET /ready`
   - `GET /metrics`
   - Register → login → dashboard.

## Production deployment runbook
1. Build/publish backend and frontend images.
2. Run DB migrations before backend rollout.
3. Deploy backend first, then frontend/nginx.
4. Verify:
   - `/health` returns 200.
   - `/ready` returns 200 (MySQL + Redis ready).
   - `/metrics` accessible to scraper.
   - Auth refresh flow works.

## Rollback guidance
1. Roll back frontend image if UI regression only.
2. Roll back backend image for API/runtime regressions.
3. For schema changes, only roll back DB if migrations are explicitly reversible and data-safe.
4. Re-verify `/ready` and critical auth/dashboard flows.

## Debugging quick guide
- 401 bursts: inspect auth failure logs and `negar_auth_failures_total`.
- Unexpected logouts: check `forced_logout_refresh_failure` product analytics and backend refresh errors.
- High latency: inspect request duration histogram in `/metrics`.
- Readiness flaps: inspect `negar_dependency_ready` and MySQL/Redis connectivity.

## Common failure modes
- Missing/invalid env variable: backend fails fast on startup config load.
- Redis unavailable: `/ready` fails and refresh/rate-limit paths may degrade.
- MySQL unavailable: backend startup or readiness fails.
- CORS misconfiguration (`FRONTEND_URL` mismatch): browser auth/API requests fail.
