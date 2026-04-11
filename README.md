# Car Repair Management

This is an application to manage a small car repair shop.

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (recommended via [asdf](https://asdf-vm.com))
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- [Make](https://www.gnu.org/software/make/)

You can run the following command `./check-prereqs.sh` to check the requirements or simply run `make install`, requirements will be checked before trying to install the env!

---

## Project Structure

```txt
.
├── backend/      # Backend service (API, database, etc.)
│   ├── src/      # Backend source code
│   └── Makefile  # Backend-specific commands
├── frontend/     # Frontend service (UI application)
│   ├── src/      # Frontend source code
│   └── Makefile  # Frontend-specific commands
├── Makefile      # Top-level commands (orchestrates backend & frontend)
└── README.md     # This file
```

---

## Makefile Help

You can always see available commands by running:

```bash
make help
```

---

## Installation

Install all dependencies for backend and frontend:

```bash
make install
```

---

## Running the Project

Run the following commands in separate terminals:

- Start backend: `make up-be`
- Start frontend: `make up-fe`

If not done before a local development database should also be created:
`make --directory backend db-init`

This will create also a database seed with a user:

- local user: `admin`
- local password: `local`

## Build for Production

Build backend and frontend assets:

```bash
make build
```

---

## Testing

Run Playwright end-to-end tests: `make test-e2e-playwright`

In order to run tests with a UI use: `npx playwright test --ui`

---

## Architecture Decision Records

### ADR-001: npm instead of yarn

**Date:** 2026-04-11

**Decision:** Use npm as the package manager for all three packages (root, backend, frontend).

**Context:** The project originally used yarn v1.
The production server (Raspberry Pi ARMv7) runs `yarn install` during deployment, and the linking step consistently took 10+ minutes due to yarn v1's parallel filesystem writes on the Pi's SD card storage.

**Consequences:** `npm ci` replaced `yarn install --production --frozen-lockfile` in the deployment script.
npm performs sequential writes during linking, which is significantly faster on SD-card-backed storage.
`package-lock.json` files replace `yarn.lock` files in each package directory.
The deployment script only runs `npm ci` when the lockfile has changed; code-only deploys skip the install entirely via a hardlinked `node_modules` copy.
