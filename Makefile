.PHONY: dev dev-backend dev-frontend build test lint format seed prod-up \
	migrate-up migrate-down migrate-steps migrate-version migrate-force migrate-goto migrate-create migrate-drop

dev:
	@echo "Starting backend and frontend in parallel (requires two terminals for logs)."
	@echo "Run: make dev-backend  and  make dev-frontend"

dev-backend:
	cd backend && go run .

dev-frontend:
	cd frontend && npm run dev

build:
	cd backend && go build ./...
	cd frontend && npm run build

test:
	cd backend && go test ./...
	cd frontend && npm run test

lint:
	cd backend && golangci-lint run ./...
	cd frontend && npm run lint

format:
	cd backend && gofmt -w $(shell find . -name '*.go' -not -path './vendor/*')
	cd frontend && npm run format

migrate-up:
	cd backend && go run ./cmd/migrate -action up

migrate-down:
	cd backend && go run ./cmd/migrate -action down -steps $${STEPS:-1}

migrate-steps:
	cd backend && go run ./cmd/migrate -action steps -steps $${STEPS:-1}

migrate-version:
	cd backend && go run ./cmd/migrate -action version

migrate-force:
	cd backend && go run ./cmd/migrate -action force -version $${VERSION:?set VERSION=<number>}

migrate-goto:
	cd backend && go run ./cmd/migrate -action goto -version $${VERSION:?set VERSION=<number>}

migrate-drop:
	cd backend && go run ./cmd/migrate -action drop

migrate-create:
	cd backend && ./scripts/new_migration.sh $${NAME:?set NAME=<snake_case_name>}

seed:
	docker compose exec -T mysql mysql -uroot -p$${MYSQL_ROOT_PASSWORD:-root} $${MYSQL_DATABASE:-negar} < backend/seeds/seed.sql

prod-up:
	docker compose -f docker-compose.prod.yml up --build -d
