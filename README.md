# Libro

**Tagline:** _Your Personal Library_

Libro is a minimal personal book tracking application with a warm, library-inspired experience.

## Branding
- **Name:** Libro
- **Personality:** warm, minimal, classical, calm, personal
- **Design language:** paper-like surfaces, deep walnut accents, soft shadows, and low-clutter layouts

## UI Philosophy
- Fast core actions: add books quickly, update reading progress in one interaction
- Calm visuals with readable typography and clear page sections
- Cozy, library-style visual identity with local SVG illustrations and logo assets

## Stack
- Backend: Go, Fiber, MySQL, Redis, GORM
- Architecture: clean/hexagonal-ish layers (`domain`, `application`, `ports`, `adapters`)
- Frontend: React + Vite + TypeScript + Tailwind + Zustand

## Features
- Auth (register/login/refresh/logout/me)
- Personal library CRUD
- Status flows: currently reading, finished, next to read
- Bookmark progress tracking and auto remaining pages
- Wishlist with multiple purchase links
- Dashboard summary and recent books
- Profile update (name/password)


## Theme System
- Libro includes a global warm **Light Mode** and a dim-library **Dark Mode**.
- Use the top-right toggle to switch instantly between themes:
  - 🌙 Moon icon switches from Light to Dark
  - ☀️ Sun icon switches from Dark to Light
- Theme values are implemented with shared design tokens (CSS variables) and applied across all pages/components.
- User preference is persisted in `localStorage` under the key `libro-theme`.
- On first load, Libro defaults to Light Mode.

## Screenshots
> Add screenshots here after running the app locally.

## Project Structure
```
/backend
/frontend
/docs
```

## Backend Run
```bash
cd backend
cp .env.example .env
go mod tidy
go run ./cmd/api
```

## Frontend Run
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Docker Compose
```bash
docker compose up --build
```
Frontend: http://localhost:5173  
Backend: http://localhost:8080

## Env Variables
See:
- `backend/.env.example`
- `frontend/.env.example`

## API Overview
Base: `/api/v1`
- Auth: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`
- Books: `GET/POST /books`, `GET/PUT/DELETE /books/:id`, `PATCH /books/:id/status`, `PATCH /books/:id/bookmark`
- Wishlist: `GET/POST /wishlist`, `GET/PUT/DELETE /wishlist/:id`
- Purchase Links: `POST /wishlist/:id/links`, `PUT/DELETE /wishlist/:id/links/:linkId`
- Dashboard: `GET /dashboard/summary`
- Users: `PUT /users/profile`, `PUT /users/password`

## Backend identity
The backend service is named **libro-backend** and keeps business logic in application services with repository-driven persistence adapters.
