# Bibliotheca

Bibliotheca is a warm, minimal full-stack book management app for personal reading workflows.

## Stack
- Backend: Go, Fiber, MySQL, Redis, GORM
- Architecture: clean/hexagonal-ish layers (`domain`, `application`, `ports`, `adapters`)
- Frontend: React + Vite + TypeScript + Tailwind + Zustand

## Features
- Auth (register/login/refresh/logout/me)
- Personal library CRUD
- Status flows: currently reading, finished, next to read
- Bookmark progress tracking and auto-remaining pages
- Wishlist with multiple purchase links
- Dashboard summary and recent books
- Profile update (name/password)

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

## Why this architecture
The backend keeps business logic in application services and persistence behind repository interfaces, keeping handlers thin and making the app easy to extend while staying intentionally simple.
