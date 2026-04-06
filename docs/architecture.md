# Bibliotheca Architecture

- **Domain**: `internal/domain` holds entities and enums.
- **Ports**: repository/session interfaces.
- **Application**: use-cases for auth/books/wishlist/users/dashboard.
- **Adapters**:
  - HTTP handlers and middleware with Fiber.
  - GORM persistence adapters.
  - Redis store adapter for refresh tokens + auth rate limiting.

This balances clean architecture clarity with practical simplicity.
