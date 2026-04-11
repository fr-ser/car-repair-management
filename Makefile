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
	cd backend && yarn run dotenv -e .env.test tsx prisma/seed/playwright.ts
	cd backend && DISABLE_REQUEST_LOGGING=false CONFIG_PATH=.env.test node dist/main

test-e2e-playwright: ## run playwright e2e tests
	cd backend && yarn run dotenv -e .env.test prisma generate
	cd frontend && yarn run build --mode test
	cd backend && yarn run build
	yarn run playwright test

test-e2e-playwright-dev: ## run playwright UI tests against the running development instance
	CONFIG_PATH=./backend/.env.development PLAYWRIGHT_PORT=5173 yarn run playwright test --ui

format: ## Format files (root only)
	yarn run eslint --fix

format-all: ## Format files in root, backend, and frontend
	yarn run eslint --fix
	cd backend && yarn run eslint --fix
	cd frontend && yarn run eslint --fix

test: ## run all tests
	yarn run eslint
	@$(MAKE) test-e2e-playwright


build: ## build backend and frontend for production
	cd backend && yarn run build
	cd frontend && yarn run build
	mkdir -p backend/dist/static
	cp -r frontend/dist/. backend/dist/static

deploy-build: build test-all ## build, test, and upload to production machine
	@test -f backend/.env.production || (echo "Production env for the frontend not found!" && exit 1)

	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS} 'mkdir -p ~/apps/next-car-repair'
	scp -P $${SSH_PORT} -r ./backend/dist $${SSH_USER}@$${SSH_ADDRESS}:~/apps/next-car-repair
	scp -P $${SSH_PORT} ./backend/package.json ./backend/yarn.lock $${SSH_USER}@$${SSH_ADDRESS}:~/apps/next-car-repair
	scp -P $${SSH_PORT} -r ./deployment $${SSH_USER}@$${SSH_ADDRESS}:~/apps

	@echo "To replace the old version run 'make deploy-upgrade' here or"
	@echo "'cd ~/apps/deployment && make update' on the deployment target"

deploy-upgrade: ## update the application on the production machine (causes downtime)
	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS} 'cd ~/apps/deployment && make update'

deploy-ssh: ## open SSH terminal on production machine
	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS}

scp-database-to-local: ## copy the production database to the local machine
	scp -P $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS}:~/apps/car-repair/production.db ./production.db

scp-database-to-deploy: ## copy the local database to the production machine
	scp -P $${SSH_PORT} ./production.db $${SSH_USER}@$${SSH_ADDRESS}:~/apps/car-repair/production.copy.db

test-all: ## run all tests (including backend and frontend)
	@$(MAKE) --directory frontend test
	@$(MAKE) --directory backend test
	@$(MAKE) test
