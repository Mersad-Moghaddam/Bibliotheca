# Release & Deployment Notes

## Production readiness checks
- Confirm all required backend env variables are set.
- Run SQL migrations before deploying the backend.
- Verify MySQL and Redis reachability from backend runtime.
- Validate `FRONTEND_URL` and reverse-proxy `/api/v1` path.

## Build artifacts
- Backend: `backend/Dockerfile` builds distroless runtime image.
- Frontend: `frontend/Dockerfile` builds static assets served by nginx.

## CI gates
- Backend workflow: gofmt/golangci-lint/go test.
- Frontend workflow: npm ci, lint, tests, build.

## Post-deploy validation
- `GET /health` should return 200.
- `GET /ready` should return 200 only when MySQL and Redis are reachable.
- `GET /metrics` should return Prometheus-formatted operational metrics.
- Perform an auth login + refresh smoke test.
