# Top-level Makefile
.PHONY: *

help: ## Show help
	@echo "[global]"
	@echo "Available commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	
	@echo ""
	@echo "[backend]"
	@$(MAKE) --directory backend help

	@echo ""
	@echo "[frontend]"
	@$(MAKE) --directory frontend help

install: ## install all the dependencies for both BE and FE and setup local database
	./check-prereqs.sh
	yarn install
	@$(MAKE) --directory backend install
	@$(MAKE) --directory frontend install
	@$(MAKE) --directory backend init_db

up-be: ## start BE locally
	@$(MAKE) --directory backend up

up-fe: ## start FE locally
	@$(MAKE) --directory frontend up

# this command is used by playwright to start all services for testing
start-playwright-services:
	@$(MAKE) --directory backend setup-clean-test-database
	cd backend && yarn run dotenv -e .env.test ts-node prisma/seed/playwright.ts
	cd backend && DISABLE_REQUEST_LOGGING=false CONFIG_PATH=.env.test node dist/src/main

test-e2e-playwright: ## run playwright e2e tests
	cd frontend && yarn run build --mode test
	cd backend && yarn run build
	yarn run playwright test

test-e2e-playwright-dev: ## run playwright UI tests against the running development instance
	PLAYWRIGHT_PORT=5173 yarn run playwright test --ui

format: ## Format files
	yarn run eslint --fix

test: ## run all tests
	yarn run eslint
	@$(MAKE) test-e2e-playwright


test-all: ## run all tests (including backend and frontend)
	@$(MAKE) --directory frontend test
	@$(MAKE) --directory backend test
	@$(MAKE) test
