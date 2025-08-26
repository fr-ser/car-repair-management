# Top-level Makefile
.PHONY: up down

install:
	@$(MAKE) -C backend install
	@$(MAKE) -C frontend install

up:
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