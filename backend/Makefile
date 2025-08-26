init_db:
	yarn db:dev:restart

remove_db:
	yarn db:dev:rm

up: init_db
	yarn start:dev

down-v: remove_db

test: init_db
	yarn test:e2e

test-cov: init_db
	yarn test:e2e:cov

run_prisma_studio:
	npx prisma studi

install:
	yarn install