# Negar Senior Architecture & UX Audit (Phase 0)

## Scope audited
- Frontend app shell, routing, pages, API client, UI primitives.
- Backend bootstrap, controllers, services, repositories, config, error handling.
- Product UX posture against premium SaaS expectations (information architecture, state quality, consistency, extensibility).

## Current strengths worth preserving
- Clear base stack choices for velocity: Fiber + GORM + React + Zustand.
- Existing CRUD/user flow works end-to-end with auth + refresh token handling.
- UI already has primitive components and initial tokenized Tailwind theme.
- Backend has service/repository layers (good starting seam for refactor).

## Architectural weaknesses (frontend)
1. **Page-level god files**
   - `src/pages/AppPages.tsx` centralizes many domains (dashboard, library, reading, wishlist, profile), producing high coupling and difficult testability.
   - Side effects, UI logic, data fetching, and mutation handling are mixed per component.

2. **Route composition duplication**
   - `src/App.tsx` manually wraps every protected route with repeated `Protected + AppLayout` chains.
   - Hard to enforce global route-level concerns (analytics, error boundaries, loading shells).

3. **API typing & contract drift risk**
   - Local unions like `Book[] | { items: Book[] }` repeated in many components indicate unstable response contracts.
   - No centralized domain client per feature (books/wishlist/auth), making it harder to version API calls.

4. **State and async patterns are not standardized**
   - Multiple components manage `loading/error/message` ad hoc.
   - No consistent query cache/revalidation model; manual reloads after mutations increase race-condition risk.

5. **Primitive layer is present but under-systematized**
   - Design tokens exist, but semantic surfaces and typography rhythm were not consistently enforced across layouts.
   - Navigation and landing hierarchy were MVP-level and not yet SaaS-grade.

## Architectural weaknesses (backend)
1. **Controller input robustness gaps**
   - UUID parsing frequently ignores parse errors (`uid, _ := ...`), causing unsafe assumptions.
   - Body validation relies mostly on manual checks, lacking declarative schema validation at the boundary.

2. **Error taxonomy is too coarse**
   - `RespondError` maps broad categories but no structured machine-readable error codes (for frontend handling/telemetry).
   - Domain-specific failures (invalid state transitions, ownership, conflict causes) are collapsed.

3. **Business invariants spread across handlers/services**
   - Computed fields are assembled in controller helpers; domain behavior split between service and transport code.
   - Status-transition rules are not modeled as explicit policy/state machine.

4. **Operational readiness gaps for SaaS scale**
   - Startup auto-migration in app boot path may be risky in production deployments.
   - Missing request ID middleware, structured logging, timeout strategy, and readiness/liveness depth.
   - Config has insecure defaults (e.g., fallback JWT secret) and limited startup hard-fail constraints.

5. **Repository interface shape is mostly CRUD-oriented**
   - As product expands, use-case-specific read models (dashboard projections, pagination cursors, analytics) will need explicit query contracts.

## UX weaknesses vs premium SaaS bar
- Landing page lacked persuasive storytelling, trust cues, and value architecture.
- Sidebar and page scaffolding lacked semantic grouping and product framing.
- Visual system skewed warm/brown; less aligned with neutral editorial SaaS expectation.
- Surface hierarchy, spacing rhythm, and component contrast were inconsistent across screens.
- Empty/loading states exist, but product-level consistency and narrative quality can be improved.

## Target architecture (proposed)

### Frontend (feature-oriented)
```text
frontend/src
  app/
    router/
    providers/
    layouts/
  shared/
    ui/
    lib/
    config/
    styles/
  features/
    auth/
      api/
      components/
      hooks/
      routes/
      types/
    books/
    reading/
    wishlist/
    profile/
  entities/
    book/
    user/
    wishlist/
  pages/
    marketing/
```

### Backend (cleaner vertical slices)
```text
backend/
  cmd/api/main.go
  internal/
    platform/
      config/
      logger/
      http/
      persistence/
      cache/
    modules/
      auth/
        handler/
        service/
        repository/
        domain/
        dto/
      books/
      wishlist/
      users/
    shared/
      errors/
      middleware/
      validation/
      observability/
  migrations/
```

## Phased plan (incremental, low-risk)

### Phase 1 (implemented in this change set)
- Establish neutral premium design tokens and typography/surface foundation.
- Improve authenticated layout foundation (semantic nav grouping, refined shell, top context bar).
- Upgrade landing page to a stronger SaaS narrative section with clearer value communication.
- Keep existing functional flows and routes intact.

### Phase 2
- Split monolithic `AppPages.tsx` by feature route modules.
- Introduce feature API clients and DTO mappers; normalize response shape once.
- Add shared async helpers and error toast pattern.

### Phase 3
- Backend request validation middleware + strict UUID/path validation.
- Structured error envelope (`code`, `message`, `traceId`) and centralized mapping.
- Introduce command/query-oriented services for high-traffic paths.

### Phase 4
- Add observability stack (request ID, structured logs, metrics, tracing hooks).
- Hard production config guardrails, startup checks, and migration strategy separation.
- Background jobs/events for derived read models and notifications.

## SaaS-level concerns to address next
- Tenant readiness posture (if future multi-workspace model is planned).
- Audit trails for profile/security changes.
- Rate-limit strategy beyond auth endpoints.
- Pagination contracts for large libraries/wishlists.
- Security hardening: secret management, stricter CORS policy, token revocation observability.
