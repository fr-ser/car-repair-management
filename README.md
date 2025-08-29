# Car Repair Management

This is an application to manage a small car repair shop.

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (recommended via [asdf](https://asdf-vm.com))
- [Yarn](https://yarnpkg.com/)
- [Make](https://www.gnu.org/software/make/)

You can run the following command `./check-prereqs.sh` to check the requirements or simply rum `make install`, requirements will be checked before trying to install the env!

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

## Build for Production

Build backend and frontend assets:

```bash
make build
```

Run the server in production mode (serving both API & frontend):

```bash
make run-server-production
```

---

## Testing

Run Playwright end-to-end tests: `make test-e2e-playwright`

In order to run tests with a UI use: `yarn run playwright test --ui`
