# Phase 3 foundations

## Coach / insights evolution

- The coach insight engine now emits deterministic `confidence` and `explanationKey` fields.
- Explanations are signal-based (activity gap, near completion, goal risk, backlog pattern) so recommendations are explainable and localizable.
- Recommendation noise is reduced by strict priority ordering.

## Reminder delivery pipeline

- Reminder settings now include `timezone`.
- Background worker (`reminderService.Worker`) runs every minute:
  1. selects users with enabled reminders,
  2. evaluates due slots with timezone-aware scheduling,
  3. creates idempotent `reminder_deliveries` rows,
  4. dispatches via channel abstraction (`Sender`),
  5. updates lifecycle status with retries/backoff.
- Current default channel is `in_app` via structured logs; provider adapters can implement `Sender`.

## Permission and audit foundation

- Users now have explicit `role` (`reader`, `admin`).
- JWT access/refresh tokens carry role claim.
- Auth middleware places `userRole` in request context for policy checks.
- `audit_events` table records sensitive changes (profile, password, reminders, books, wishlist, reading events).

## Performance

- Added indexes for reminder scheduling, book list hot path, and reading sessions by date.
- Book insights now reuse a single in-memory analytics build from one book list fetch.
- Coach page memoizes insight derivation to avoid repeated recomputation on unrelated renders.
