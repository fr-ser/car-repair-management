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

up: ## start locally both BE and FE and all the required dependencies
	@$(MAKE) -C backend up | sed 's/^/[backend] /' &
	@$(MAKE) -C frontend up-noninteractive | sed 's/^/[frontend] /' &

down:
	@pids=$$(lsof -ti :8080); \
	if [ -z "$$pids" ]; then \
	  echo "No process running on port 8080"; \
	else \
	  kill -9 $$pids && echo "killed :8080"; \
	fi
	
	@pids=$$(lsof -ti :5173); \
	if [ -z "$$pids" ]; then \
	  echo "No process running on port 5173"; \
	else \
	  kill -9 $$pids && echo "killed :8080"; \
	fi

# 	kill -9 $(lsof -ti :5173)
	@$(MAKE) -C backend down-v
	@$(MAKE) -C frontend down