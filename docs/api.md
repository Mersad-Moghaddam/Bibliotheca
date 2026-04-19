# API and OpenAPI

The canonical OpenAPI document is at `docs/api/openapi.yaml`.

## Coverage
The spec documents:
- auth (`register`, `login`, `refresh`, `logout`, `me`)
- dashboard/analytics/insights
- books/progress/notes
- reading sessions and goals
- wishlist and purchase links
- profile/password/reminders
- health and readiness

## How to view
Use any OpenAPI viewer, for example:

```bash
npx @redocly/cli preview-docs docs/api/openapi.yaml
```

Or import the file into Swagger Editor.

## Update workflow
1. Change API route/controller behavior.
2. Update `docs/api/openapi.yaml` in the same PR.
3. Run backend tests and any client contract tests.
