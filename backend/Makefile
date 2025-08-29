.PHONY: *

help: ## Show help
	@echo "Available make commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

	@echo "Available npm/yarn commands:"
	@npm run

init_db: ## initialise an empty database
	touch ./dev.db
	yarn run dotenv -e .env.development yarn prisma migrate deploy

up: init_db ## initialise an empty database and starts the BE server
	yarn start:dev

test: ## runs all tests
	yarn run test
	yarn run lint
	yarn run test:e2e

test-cov: ## runs all tests once with coverage report
	yarn run test
	yarn run lint
	yarn run test:e2e:cov

run_prisma_studio: ## start prisma studio
	yarn prisma studio

install: ## install all the dependencies
	yarn install

build: ## build all assets for production mode
	rm -rf dist && yarn build

migrate: ## run prisma migrate dev to create generated/ directory and migrate DB
	@echo "$${CONFIG_PATH:-.env}"
	yarn run dotenv -e $${CONFIG_PATH:-.env} prisma migrate dev
