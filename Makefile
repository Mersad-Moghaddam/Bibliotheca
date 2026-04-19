.PHONY: dev dev-backend dev-frontend build test lint format seed prod-up

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

seed:
	docker compose exec -T mysql mysql -uroot -p$${MYSQL_ROOT_PASSWORD:-root} $${MYSQL_DATABASE:-negar} < backend/seeds/seed.sql

prod-up:
	docker compose -f docker-compose.prod.yml up --build -d
