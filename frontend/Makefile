.PHONY: *

help: ## Show help
	@echo "Available commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
up-noninteractive: ## start FE in non-interactive mode
	yarn dev:noninteractive
up: ## start FE in interactive mode
	yarn dev
test-cov: ## run tests with coverage report
	yarn test:cov
	
install: ## install all the dependencies
	yarn install

down: ## stop all the dependencies (currently there are none)
	echo DOWN

build: ## build all assets for production mode
	yarn build-only