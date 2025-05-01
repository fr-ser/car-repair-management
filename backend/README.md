# Backend

## Development

Run `npm run db_seed` to get a local database with some data.

- If you want to update the seed you need to delete the current database first.
  You can use `npm run db_seed:overwrite` for this.

Run `npm run start:dev` to start the backend and reload on change.

Run `npm run test` to run all tests.

### Authorization

The backend uses basic auth and the users and their passwords are defined in the environment file.

## Tasks

The backend contains a "main" service, which is the backend server.

However, there are also "tasks", which are executed as cron jobs in this repository.

### Configuration variables

The required configuration is provided by the `local.env` file.

If, however, for development purposes you want to use different ones (i.e. to send a real email when working on the email task), you can use environment variables.

A very nice tool for that is [direnv](https://direnv.net/).

## Migrations

In order to create migrations use the following command:
`CONFIG_PATH=local.env NODE_OPTIONS='-r tsconfig-paths/register' npx typeorm-ts-node-commonjs migration:generate ./src/migrations/update-post-table -d ./src/db/dataSource.ts`.

In order to run migrations use:
`CONFIG_PATH=local.env NODE_OPTIONS='-r tsconfig-paths/register' npx typeorm-ts-node-commonjs migration:run -d ./src/db/dataSource.ts`.
