# Deployment

## Environment

When the environment files need to be updated it has to be done in two places:

- `.env.production` - local

  - This needs to be done inside the repository before building the frontend.
  - The variables are interpolated into the frontend code itself.

- `.env` - remote
  - This needs to be done on the remote before restarting the backend.
  - Make sure `STATIC_FILE_ROOT=dist/static` is set in the remote `.env`.

## Release

To build, test, and upload a new version to the server:

```bash
make deploy-build
```

To activate the uploaded version on the server (causes brief downtime):

```bash
make deploy-upgrade
```

To roll back to the previous version on the server:

```bash
ssh -p $SSH_PORT $SSH_USER@$SSH_ADDRESS 'cd ~/apps/deployment && make revert'
```

## Scheduled tasks

Backup and notification jobs run inside the NestJS process via `@nestjs/schedule` — no external cron jobs are needed for application tasks.

## CRON

The job to truncate large log files:

```txt
0 5 * * * echo "$(tail -n 10000 ~/apps/car-repair/app.log)" > ~/apps/car-repair/app.log
```

The job to renew certificates:

```txt
0 2 * * 1 certbot renew --webroot -w ~/apps/car-repair/dist/static/
```
