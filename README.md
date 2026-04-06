# Libro

Libro is a full-stack personal library manager organized as a clean monorepo with a fully separated Go backend and React frontend.

## Monorepo Structure

```text
.
├── backend/             # Go API service (single backend architecture)
│   ├── cmd/
│   ├── config/
│   ├── internal/
│   ├── pkg/
│   ├── migrations/
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
├── frontend/            # React + Vite SPA
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── docs/
│   └── architecture.md
├── docker-compose.yml
├── .env.example
└── .gitignore
```

## Environment Files

- Backend env template: `backend/.env.example`
- Frontend env template: `frontend/.env.example`
- Optional compose override template: `.env.example`

Setup:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Run Backend (local)

```bash
cd backend
go mod tidy
go run ./cmd/api
```

Backend API base URL: `http://localhost:8080/api/v1`

## Run Frontend (local)

```bash
cd frontend
npm install
npm run dev
```

Frontend app URL: `http://localhost:5173`

## Run with Docker Compose

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- MySQL: `localhost:3306`
- Redis: `localhost:6379`

## Database Migrations

SQL migrations are maintained in `backend/migrations`.

Use your preferred migration runner with that directory when applying schema changes externally.

## Architecture Notes

- Only one backend architecture exists, fully isolated in `backend/`.
- Frontend is fully self-contained in `frontend/` and interacts with backend through HTTP APIs only.
- Root-level files are monorepo coordination and documentation only.

See `docs/architecture.md` for more detail.
