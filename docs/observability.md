# Observability Baseline

Negar separates **operational observability** from **product analytics**.

## Operational signals (backend)

### Logs
- Structured Zap logs with consistent request fields from middleware:
  - `request_id`, `method`, `path`, `status_code`, `duration_ms`, `ip`, and `user_id` when available.
- Auth diagnostics:
  - `auth_missing_bearer_token`, `auth_invalid_access_token`
  - `auth_login_invalid_credentials`, `auth_login_rate_limited`
  - `auth_refresh_failed`
- Runtime lifecycle:
  - startup phases (config, MySQL, schema, Redis, listening)
  - shutdown signal and dependency close outcomes.

### Metrics endpoint
- `GET /metrics` (Prometheus text format).
- Includes:
  - `negar_http_requests_total`
  - `negar_http_request_duration_milliseconds` (histogram)
  - `negar_http_request_errors_total`
  - `negar_auth_failures_total`
  - `negar_refresh_failures_total`
  - `negar_rate_limited_total`
  - `negar_dependency_ready{name="mysql|redis"}`

### Health/readiness
- `GET /health`: liveness (always lightweight).
- `GET /ready`: checks MySQL + Redis reachability with timeout via runtime readiness checker.

## Recommended dashboards/alerts
- Error-rate spike: `negar_http_request_errors_total`.
- Auth anomaly: `negar_auth_failures_total` by reason.
- Dependency readiness drop: `negar_dependency_ready == 0`.
- Latency regression: histogram buckets from request duration metric.
