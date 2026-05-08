# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Keep this file updated when new patterns emerge.

## Project Overview

A car repair shop management application — monorepo with a NestJS backend and React frontend.
The backend serves frontend static assets in production.
All endpoints are JWT-protected except login.

This project is the successor of a legacy application (`werkstattapp-legacy`, also in the VS Code workspace).
The legacy app defines all business logic and domain rules — refer to it when in doubt about what the application should do.
Do not follow its technical patterns; use the conventions established in this repository instead.

## Tooling Conventions

**Make** is for three things:

- Cross-workspace commands that span multiple packages (`build-all`, `test-all`, `format-all`, `install-all`)
- Multi-step or complex commands that benefit from Makefile's sequential syntax (deployment targets, `test-e2e`, `start-playwright-services`)
- Custom dev commands specific to this project (`start-be`, `start-fe`, `setup-clean-test-database`, `db-create-migration`, trigger commands, `run-prisma-studio`)

**npm run** is for the classic per-package commands only: `dev`, `build`, `test`, `lint`, `format`.
These stay in `package.json` for familiarity — CI, editors, and developers expect them there.

When adding a new command: if it is `dev/build/test/lint/format`, add it to the relevant `package.json`.
Everything else goes in the `Makefile`.

## Commands

### Root (Makefile)

```bash
make install-all          # Install all dependencies
make build-all            # Build both for production
make format-all           # Auto-fix lint issues (root, backend, frontend)
make test-all             # All tests: frontend, backend, e2e
make test-e2e-dev         # Playwright e2e tests with UI
```

### Remote target (Raspberry Pi) — always use the Makefile as reference

```bash
make deploy-ssh           # Open SSH terminal on production machine
make deploy-script        # Copy backend/scripts/ to production machine
make deploy-database-to-local   # Pull production DB to local (backend/production.db)
make deploy-database-to-remote  # Push local production.db to remote as production.copy.db
make deploy-router        # SSH tunnel to Fritz!Box UI
```

Log file (no Makefile target — use directly):

```bash
scp -P ${SSH_PORT} ${SSH_USER}@${SSH_ADDRESS}:~/apps/car-repair/app.log ./app.log
```

All remote commands use `SSH_PORT`, `SSH_USER`, and `SSH_ADDRESS` env vars.

### Backend (`backend/`)

```bash
make test                      # Lint + type check + unit + e2e tests
make setup-clean-test-database # Recreate clean test DB
npm run build                  # Compile TypeScript
npm run lint                   # Run ESLint
npm run format                 # Auto-fix ESLint
```

### Frontend (`frontend/`)

```bash
npm run build   # Production build
npm run test    # Lint + unit tests
npm run lint    # Run ESLint
npm run format  # Auto-fix ESLint + Prettier
```

## Architecture

### Tech Stack

- **Backend**: NestJS 11, TypeScript, Prisma ORM, SQLite
- **Frontend**: React 18, React Router v7, TanStack Query v5, MUI v7, Vite
- **Auth**: JWT in cookies (argon2 password hashing), global `JwtAuthGuard` on all routes
- **Testing**: Vitest (unit + backend e2e), Playwright (full e2e)
- **Package manager**: npm

### Backend structure (`backend/src/`)

Domain modules: `auth/`, `cars/`, `clients/`, `articles/`, `orders/`. Each module follows NestJS convention (module, controller, service, DTOs).

Key cross-cutting concerns in `common/`:

- Global JWT auth guard applied to all endpoints
- Global validation pipe with `transform: true`
- Request logging via morgan middleware

The backend also serves the compiled frontend as static files.

### Frontend structure (`frontend/src/`)

- `pages/` — Route-level page components
- `components/` — Reusable UI components (e.g. `DecimalTextField`, `MaskedTextField`, `MenuBar`)
- `services/backend-service.ts` — Centralized HTTP client for all API calls
- `hooks/` — Custom hooks: `useNotification`, `useConfirmation`, `useDebounce`
- `types/` — Shared TypeScript types
- `theme.ts` — MUI theme

State management uses TanStack Query for all server state. The app uses German locale (dayjs, date formats).

### Data model

**Client** — has many **Cars** (optional FK).
**Car** stores extensive vehicle details (registration, engine, service dates).
**Article** is inventory.
**Order** (Auftrag) — belongs to one **Car** and one **Client**. Has many **OrderPositions** (headings or items). Items can reference an **Article** (adjusts article inventory on save/update/delete).
**User** stores hashed credentials only.

Dates are stored as strings in SQLite (no native Date type).

### API conventions

- Base path: `/api/`
- List endpoints support `page`, `pageSize`, and `search` query params
- Auth via JWT cookie; sign-in at `POST /api/auth/sign-in`

### Environment

- Dev DB: `backend/dev.db`, Test DB: `backend/test.db`
- Dev env file: `backend/.env.development`; test env: `backend/.env.test`
- Default local credentials: `admin` / `local`

### Import ordering (Prettier)

Enforced by `@trivago/prettier-plugin-sort-imports`: external packages → `@/` paths → relative imports. Single quotes throughout.

### Import paths (Frontend)

Prefer `@/src/...` absolute imports over relative ones. Allowed exceptions:

- Direct siblings in the same directory (e.g. `./utils`)
- Test files going one level up to the file under test (e.g. `../ComponentName` from a `__tests__/` folder)

### Exports (Frontend)

Use named exports throughout (`export function Foo`, `export const bar`).
Exception: when a file has a single export whose name matches the filename, use a default export (e.g. `export default function LoginPage` in `LoginPage.tsx`, `export default theme` in `theme.ts`).

### Language

All non-user-facing values must be in English: variable names, constants, enum values, database field values, seed data content, comments, commit messages, test descriptions, and any other code-level strings. German is only used where it is directly displayed to the end user in the UI (e.g. button labels, column headers, form labels, error messages shown on screen).

## AI Agent instructions

- Plans should not include manual testing steps.
  Verification sections should only reference automated tests (unit, e2e).

- In markdown files, use one sentence per line in prose paragraphs.

- **IMPORTANT: Never read or write gitignored files without approval.**
  This includes production environment files (`.env`, `.env.production`, `deployment/production/`, `.envrc`) and any other file listed in `.gitignore`.
  These may contain secrets or production configuration that must not be accessed or modified by an agent unless the user explicitly approved it.

- **The app is accessed over plain HTTP (no HTTPS) in production** — users open it directly via the Raspberry Pi's local IP address.
  Do not use browser APIs that require a secure context (e.g. `crypto.randomUUID`, `navigator.clipboard`, Web Bluetooth, etc.).
  Use plain alternatives instead (e.g. a module-level counter or `Math.random()`-based ID for local keys).

- **Backend scripts (`backend/scripts/`) must be plain `.js` files using only Node.js built-ins.**
  The production machine (Raspberry Pi ARMv7) cannot compile native addons and `prisma generate` fails there.
  Use `node:sqlite` (built into Node.js ≥ 22.5) for database access.
  Run with `node scripts/foo.js`, not `yarn tsx`.
