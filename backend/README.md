# Backend

A [Nest](https://github.com/nestjs/nest) backend.

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

<!-- TODO: remove all port fallbacks across the code and use config -->
<!-- TODO: move towards vitest to use same test framework as frontend -->

## Authentication

Most endpoints are authenticated and require a JWT to access them.

Locally this token can be used:

```sh
curl localhost:8080/api/articles -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AbG9jYWwuY29tIiwiaWF0IjoxNzU2NjU3OTEyLCJleHAiOjY0OTAyOTc5MTJ9.v5yd9UItMQh7Sj48dZn7qC1eIoNZ3iJNJyUH-UBZZ3c'
```

This token has been manually generated for a very long expiration.
As long as the JWT secret stays the same it can be used.
