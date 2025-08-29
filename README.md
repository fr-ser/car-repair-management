# Project Setup

## Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (recommended via [asdf](https://asdf-vm.com))
- [Yarn](https://yarnpkg.com/)
- [Make](https://www.gnu.org/software/make/)

You can run the following command `./check-prereqs.sh` to check the requirements or simply rum `make install`, requirements will be checked before trying to install the env!

---

## Project Structure

```
.
├── backend/      # Backend service (API, database, etc.)
│   ├── .env      # Environment configuration for backend (required)
│   ├── src/      # Backend source code
│   └── Makefile  # Backend-specific commands
├── frontend/     # Frontend service (UI application)
│   ├── .env      # Environment configuration for frontend (required)
│   ├── src/      # Frontend source code
│   └── Makefile  # Frontend-specific commands
├── Makefile      # Top-level commands (orchestrates backend & frontend)
└── README.md     # This file
```

---

## Environment Configuration
Before starting, you need to create a `.env` file for the backend:

**File:** `backend/.env`
```env
DATABASE_URL="file:../local.db"
JWT_SECRET='super-secret'
PORT='8080'
```

> ⚠️ Without this file, backend services will not start.

Before starting, you need to create a `.env` file for the frontend:

**File:** `frontend/.env`
```env
VITE_API_URL=http://localhost:8080
```

> ⚠️ Without this file, frontend may not be able to connect to your local BE.


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

### Start backend only
```bash
make up-be
```

### Start frontend only
```bash
make up-fe
```

### Start both
```bash
make up-be
make up-fe
```
*(Run them in two terminals or in the background)*

---

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

## Stopping Services
Stop everything:

```bash
make down-all
```

---

## Testing
Run Playwright end-to-end tests:

```bash
make test-e2e-playwright
```
