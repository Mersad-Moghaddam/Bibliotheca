# Product Analytics Event Model

Negar product analytics is implemented in `frontend/src/shared/analytics` and intentionally avoids sensitive payloads (no raw book notes, passwords, tokens, or freeform personal text).

## Event taxonomy

| Event | Fired when | Payload fields (non-sensitive) | Purpose |
|---|---|---|---|
| `landing_cta_clicked` | Landing page CTA clicked | `cta` | Funnel conversion measurement |
| `register_succeeded` | Register API succeeds | none | Sign-up success rate |
| `register_failed` | Register API fails | `code` | Sign-up friction diagnosis |
| `login_succeeded` | Login API succeeds | none | Auth conversion |
| `login_failed` | Login API fails | `code` | Auth failure distribution |
| `logout` | User logs out from app controls | `source` | Session behavior |
| `forced_logout_refresh_failure` | Refresh retry fails and app logs user out | none | Token lifecycle reliability |
| `book_created` | Book create mutation succeeds | none | Feature adoption |
| `book_updated` | Book update/status mutation succeeds | `book_id`, `status` | Editing/status patterns |
| `book_deleted` | Book delete settles | none | Churn behavior |
| `progress_updated` | Progress update succeeds | `book_id` | Reading progress cadence |
| `reading_session_logged` | Session create succeeds | `book_id` | Session engagement |
| `goal_updated` | Goal upsert succeeds | none | Goal feature adoption |
| `reminder_settings_changed` | Reminder settings update succeeds | none | Habit tooling adoption |
| `wishlist_item_created` | Wishlist add succeeds | none | Intent/backlog capture |
| `wishlist_item_deleted` | Wishlist delete succeeds | none | Wishlist maintenance |
| `wishlist_link_created` | Wishlist link add succeeds | none | Purchase intent enrichment |
| `locale_changed` | Locale toggled EN/FA | `locale` | Localization usage |
| `theme_changed` | Theme toggled | `theme` | UI preference usage |
| `coach_insight_interacted` | Coach insight retry action clicked | `action` | Insight UX interaction |

## Provider behavior
- Central entry point: `analytics.track(event, payload)`.
- If `window.dataLayer` exists, events push there.
- In development, events log to console for local verification.
- This design keeps provider wiring backend-agnostic and avoids ad hoc tracking calls.
