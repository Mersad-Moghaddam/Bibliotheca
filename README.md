# Libro Monorepo

Libro is a full-stack personal reading tracker with a Go/Fiber backend and a React/Vite frontend.

## Repository Structure

```text
.
├── backend/            # Go backend application
│   ├── apiSchema/
│   ├── controllers/
│   ├── middleware/
│   ├── migrations/
│   ├── models/
│   ├── pkg/
│   ├── repositories/
│   ├── services/
│   ├── statics/
│   ├── template/
│   ├── tests/
│   ├── dev.env
│   ├── go.mod
│   ├── go.sum
│   ├── main.go
│   └── README.md
├── frontend/           # React frontend application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── .gitignore
```

## Run Backend (Local)

```bash
cd backend
go mod download
go run .
```

Backend runs on `http://localhost:8080` by default.

## Run Frontend (Local)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Run with Docker Compose

From repo root:

```bash
docker compose up --build
```

Services:
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- MySQL: `localhost:3306`
- Redis: `localhost:6379`

## Notes

- Backend environment defaults are defined in `backend/dev.env`.
- Frontend API target can be overridden with `VITE_API_URL`.
