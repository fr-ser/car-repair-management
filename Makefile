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

build: ## build all assets for production mode
	@$(MAKE) --directory backend build
	@$(MAKE) --directory frontend build

run-server-production: ## start server in production mode (serving both the API and frontend)
	cd backend && STATIC_FILE_ROOT=dist/static CONFIG_PATH=.env.development yarn start:prod

test-e2e-playwright: ## run playwright e2e tests
	yarn run playwright test

format: ## Format files
	yarn run eslint --fix

test: ## run all tests
	yarn run eslint
	@$(MAKE) test-e2e-playwright
