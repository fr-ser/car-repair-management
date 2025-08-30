.PHONY: *

help: ## Show help
	@echo "Available make commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

	@echo "Available npm/yarn commands:"
	@npm run

init-db: ## initialise an empty database
	touch ./dev.db
	yarn run dotenv -e .env.development prisma migrate deploy
	yarn run dotenv -e .env.development ts-node prisma/seed/dev.ts

up: ## starts the BE server
	yarn start:dev

setup-clean-test-database: ## (re)create a clean test database
	rm -f test.db
	yarn run dotenv -e .env.test prisma migrate dev

test: ## runs all tests
	yarn run test
	yarn run lint
	@$(MAKE) setup-clean-test-database
	yarn run test:e2e

test-cov: ## runs all tests once with coverage report
	yarn run test
	yarn run lint
	@$(MAKE) setup-clean-test-database
	yarn run test:e2e:cov

run-prisma-studio: ## start prisma studio
	yarn prisma studio

install: ## install all the dependencies
	yarn install

migrate: ## run prisma migrate dev to create prisma client and migrate DB
	@echo "$${CONFIG_PATH:-.env.development}"
	yarn run dotenv -e $${CONFIG_PATH:-.env.development} prisma migrate deploy
