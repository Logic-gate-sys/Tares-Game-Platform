.DEFAULT_GOAL := help
.PHONY: help install dev dev-services dev-client prod-build prod-up down logs \
        lint test test-user test-wss clean

help:
	@printf '%s\n' \
		'Tares development and production commands:' \
		'  make install       Install user-service and web-client dependencies' \
		'  make dev           Start backend infrastructure in Docker and Vite on the host' \
		'  make down          Stop compose services' \
		'  make logs          Follow compose logs' \
		'  make lint          Run service linters' \
		'  make test          Run backend and client tests' \
		'  make clean         Remove generated build artifacts'

install:
	cd backend_platform/user_microservice && npm ci --legacy-peer-deps
	cd web-client && npm ci --legacy-peer-deps
	cd backend_platform/wss_microservice && go mod download

dev:
	cd web-client && VITE_BASE_URL=http://localhost:8081 npm run dev

down:
	docker compose --profile dev --profile prod down

logs:
	docker compose --profile dev --profile prod logs -f

lint:
	cd backend_platform/user_microservice && npm run lint
	cd web-client && npm run lint
	cd backend_platform/wss_microservice && gofmt -w . && go vet ./...

test: test-user test-wss
	cd web-client && npm test -- --run

test-user:
	cd backend_platform/user_microservice && npm test -- --run

test-wss:
	cd backend_platform/wss_microservice && go test ./...

clean:
	rm -rf web-client/dist backend_platform/wss_microservice/tmp
