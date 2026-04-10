.PHONY: *

help: ## Show help
	@echo "Available make commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

	@echo "Available npm/yarn commands:"
	@npm run

up: ## starts the BE server
	yarn start:dev

setup-clean-test-database: ## (re)create a clean test database
	rm -f test.db
	yarn run dotenv -e .env.test prisma migrate dev

test: ## runs all tests
	yarn run dotenv -e .env.test prisma generate
	yarn run test:unit
	yarn run lint
	yarn tsc --noEmit
	@$(MAKE) setup-clean-test-database
	yarn run test:e2e

test-cov: ## runs all tests once with coverage report
	yarn run dotenv -e .env.test prisma generate
	yarn run test:unit
	yarn run lint
	yarn tsc --noEmit
	@$(MAKE) setup-clean-test-database
	yarn run test:e2e:cov

run-prisma-studio: ## start prisma studio
	yarn run dotenv -e .env.development prisma studio

install: ## install all the dependencies
	yarn install

db-create-migration: ## create prisma client and migrate DB
	yarn run dotenv -e $${CONFIG_PATH:-.env.development} prisma migrate dev

_login: ## (internal) authenticate and store session cookie
	@/usr/bin/curl -s -c /tmp/.car-repair-session \
		-X POST http://localhost:8080/api/auth/sign-in \
		-H "Content-Type: application/json" \
		-d '{"userName":"admin","password":"local"}' > /dev/null

_trigger: ## (internal) POST to a trigger endpoint; usage: make _trigger PATH=backup
	@/usr/bin/curl -s -o /dev/null -w "%{http_code}" \
		-b /tmp/.car-repair-session \
		-X POST http://localhost:8080/api/daily-tasks/trigger/$(PATH)
	@echo ""

trigger-backup: _login ## manually trigger backup (requires running dev server)
	@$(MAKE) _trigger PATH=backup

trigger-birthday: _login ## manually trigger birthday reminders (requires running dev server)
	@$(MAKE) _trigger PATH=birthday

trigger-tuev: _login ## manually trigger TÜV reminders (requires running dev server)
	@$(MAKE) _trigger PATH=tuev

db-init: ## initialise a new dev database
	rm -f ./dev.db
	yarn run dotenv -e .env.development prisma migrate dev
	yarn run dotenv -e .env.development tsx prisma/seed/dev.ts
