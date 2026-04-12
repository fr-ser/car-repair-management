# Backend

Available commands can be found with: `make help`

## Folder Structure

```txt
src/
├── main.ts                 # Entry point
├── app.module.ts           # Root module
├── some-module/
│   ├── dto/                # Data Transfer Objects
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── common/                       # Shared code
│   ├── interfaces                # TypeScript interfaces
│   ├── any-other-common-thing
│   └── utils/                    # Global helpers go here
└── config.ts                     # Configuration
```

## Dropbox Integration

The app uses Dropbox for backups.
You need a Dropbox app with `DROPBOX_CLIENT_ID`, `DROPBOX_CLIENT_SECRET`, and `DROPBOX_REFRESH_TOKEN` set in your environment.

### Getting a refresh token

This is a one-time setup step.
Refresh tokens do not expire unless explicitly revoked.

**1. Register the redirect URI in your Dropbox app.**
Go to the [Dropbox app console](https://www.dropbox.com/developers/apps), open your app, and add `http://localhost` under _OAuth 2 → Redirect URIs_.

**2. Run the helper script** from the repo root:

```bash
make dropbox-refresh-token
```

The script requires `DROPBOX_CLIENT_ID` and `DROPBOX_CLIENT_SECRET` to be set (via `.envrc` or exported manually).
It will print a Dropbox authorization URL, wait for you to paste the resulting auth code, then print the `DROPBOX_REFRESH_TOKEN` value to add to your `.envrc`.

**3. Add the token to `.envrc`.**

```bash
export DROPBOX_REFRESH_TOKEN=<value printed by the script>
```

## Authentication

Most endpoints are authenticated and require a JWT to access them.

Locally this token can be used:

```sh
curl localhost:8080/api/articles -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AbG9jYWwuY29tIiwiaWF0IjoxNzU2NjU3OTEyLCJleHAiOjY0OTAyOTc5MTJ9.v5yd9UItMQh7Sj48dZn7qC1eIoNZ3iJNJyUH-UBZZ3c'
```

This token has been manually generated for a very long expiration.
As long as the JWT secret stays the same it can be used.
