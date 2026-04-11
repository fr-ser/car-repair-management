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
	npm install
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
	cd backend && npx dotenv -e .env.test tsx prisma/seed/playwright.ts
	cd backend && DISABLE_REQUEST_LOGGING=false CONFIG_PATH=.env.test node dist/main

test-e2e-playwright: ## run playwright e2e tests
	cd backend && npx dotenv -e .env.test prisma generate
	cd frontend && npm run build -- --mode test
	cd backend && npm run build
	npx playwright test

test-e2e-playwright-dev: ## run playwright UI tests against the running development instance
	CONFIG_PATH=./backend/.env.development PLAYWRIGHT_PORT=5173 npx playwright test --ui

format: ## Format files (root only)
	npx eslint --fix

format-all: ## Format files in root, backend, and frontend
	npx eslint --fix
	cd backend && npm run format
	cd frontend && npm run format

test: ## run all tests
	npx eslint
	@$(MAKE) test-e2e-playwright


build: ## build backend and frontend for production
	cd backend && npm run build
	cd frontend && npm run build
	mkdir -p backend/dist/static
	cp -r frontend/dist/. backend/dist/static

deploy-build: test-all build ## build, test, and upload to production machine
	@test -f backend/.env.production || (echo "Production env for the frontend not found!" && exit 1)

	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS} 'mkdir -p ~/apps/next-car-repair'
	rsync -az -e "ssh -p $${SSH_PORT}" ./backend/dist/ $${SSH_USER}@$${SSH_ADDRESS}:~/apps/next-car-repair/dist
	rsync -az -e "ssh -p $${SSH_PORT}" ./backend/package.json ./backend/package-lock.json $${SSH_USER}@$${SSH_ADDRESS}:~/apps/next-car-repair/
	rsync -az -e "ssh -p $${SSH_PORT}" ./backend/scripts/ $${SSH_USER}@$${SSH_ADDRESS}:~/apps/next-car-repair/scripts
	rsync -az -e "ssh -p $${SSH_PORT}" ./deployment-car-repair/ $${SSH_USER}@$${SSH_ADDRESS}:~/apps/deployment-car-repair

	@echo "To replace the old version run 'make deploy-upgrade' here or"
	@echo "'cd ~/apps/deployment && make update' on the deployment target"

deploy-upgrade: ## update the application on the production machine (causes downtime)
	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS} 'cd ~/apps/deployment-car-repair && make update'

deploy-ssh: ## open SSH terminal on production machine
	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS}

deploy-router: ## open Fritz!Box UI via SSH tunnel (set ROUTER_ADDRESS, e.g. 192.168.178.1)
	@echo "Tunnelling to Fritz!Box at $${ROUTER_ADDRESS} via $${SSH_USER}@$${SSH_ADDRESS}:$${SSH_PORT}"
	@echo "Open http://fritz.box:8080 in your browser (requires '127.0.0.1 fritz.box' in /etc/hosts)"
	ssh -p $${SSH_PORT} -L 8080:$${ROUTER_ADDRESS}:80 $${SSH_USER}@$${SSH_ADDRESS} -N

deploy-script: ## copy backend scripts to the production machine
	rsync -az -e "ssh -p $${SSH_PORT}" ./backend/scripts/ $${SSH_USER}@$${SSH_ADDRESS}:~/apps/car-repair/scripts

deploy-database-to-local: ## copy the production database to the local machine
	scp -P $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS}:~/apps/car-repair/production.db ./backend/production.db

deploy-database-to-remote: ## copy the local database to the production machine
	scp -P $${SSH_PORT} ./backend/production.db $${SSH_USER}@$${SSH_ADDRESS}:~/apps/car-repair/production.copy.db

test-all: ## run all tests (including backend and frontend)
	@$(MAKE) --directory frontend test
	@$(MAKE) --directory backend test
	@$(MAKE) test
