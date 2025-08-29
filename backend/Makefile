.PHONY: *

help: ## Show help
	@echo "Available commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

	@echo "Available npm commands:"
	@npm run

# Ensure .env exists before running any target
.env:
	@test -f .env || (echo "❌ Missing .env file! Please create it before running make." && exit 1)

init_db: ## initialise an empty database
	touch ./dev.db
	yarn prisma migrate deploy

up: .env init_db ## initialise an empty database and starts the BE server
	yarn start:dev

test: ## initialise an empty database and runs all tests in watch mode
	yarn test
	yarn lint
	rm -f ./test.db
	touch ./test.db
	yarn run dotenv -e .env.test yarn run prisma migrate deploy
	yarn run test:e2e

test-cov: init_db ## initialise an empty database and runs all tests once with coverage report
	yarn test:e2e:cov

run_prisma_studio: ## start prisma studio
	yarn prisma studio

install: ## install all the dependencies
	yarn install

build: ## build all assets for production mode
	rm -rf dist && yarn build

migrate: ## run prisma migrate dev to create generated/ directory and migrate DB
	@echo "$${CONFIG_PATH:-.env}"
	yarn run dotenv -e $${CONFIG_PATH:-.env} prisma migrate dev
