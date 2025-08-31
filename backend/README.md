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
