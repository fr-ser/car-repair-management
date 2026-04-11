.PHONY: *

help: ## Show help
	@echo "Available make commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

	@echo "Available npm commands:"
	@npm run

up-non-interactive: ## start FE in non-interactive mode
	npm run dev:non-interactive

up: ## start FE in interactive mode
	npm run dev

test: ## run all tests
	npm run lint
	npm run test

test-cov: ## run all tests with coverage report
	npm run lint
	npm run test:cov

install: ## install all the dependencies
	npm install
