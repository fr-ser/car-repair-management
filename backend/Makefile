.PHONY: *

help: ## Show help
	@echo "Available commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

init_db: ## initialise an empty database
	yarn db:dev:restart

remove_db: ## delete the database
	yarn db:dev:rm

up: init_db ## initialise an empty database and starts the BE server
	yarn start:dev

down-v: remove_db ## delete the database and clean the volume

test: init_db ## initialise an empty database and runs e2e tests in watch mode
	yarn test:e2e

test-cov: init_db ## initialise an empty database and runs e2e tests once with coverage report
	yarn test:e2e:cov

run_prisma_studio: ## start prisma studio
	npx prisma studi

install: ## install all the dependencies
	yarn install

build: ## build all assets for production mode
	rm -rf dist && yarn build
