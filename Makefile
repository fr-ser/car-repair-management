# Top-level Makefile
.PHONY: *

help: ## Show help
	@echo "[global]"
	@echo "Available commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	
	@echo "[backend]"
	@$(MAKE) -C backend help
	@echo "[frontend]"
	@$(MAKE) -C frontend help

install: ## install all the dependencies for both BE and FE
	@$(MAKE) -C backend install
	@$(MAKE) -C frontend install

up-be: ## start BE locally
	@$(MAKE) -C backend up

up-fe: ## start FE locally
	@$(MAKE) -C frontend up

build: ## build all assets for production mode
	@$(MAKE) -C backend build
	@$(MAKE) -C frontend build

run-server-production: ## start server in production mode (serving both the API and frontend)
	cd backend && STATIC_FILE_ROOT=dist/static CONFIG_PATH=../.env.development yarn start:prod

down-all: ## stop all (both be and fe)
	@$(MAKE) -C backend down-v
	@$(MAKE) -C frontend down

test-e2e-playwright: ## run playwright e2e tests
	yarn playwright test
