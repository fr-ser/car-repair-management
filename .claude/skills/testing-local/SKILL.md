---
name: testing-local
description: Patterns about writing and running tests in this project.
---

# Testing skill

Use this when writing, updating, or reviewing tests in this project.

## Step 1 — Read the vitest config before writing tests

Always read the relevant config before writing or modifying test files:

- Backend unit/e2e: `backend/vitest.config.ts`
- Frontend unit: `frontend/vitest.config.ts` + `frontend/test/vitest.setup.ts`
- Playwright e2e: `playwright.config.ts`

This tells you what is already auto-configured so you don't add redundant boilerplate.

---

## Current config facts (as of last audit)

When you notice a difference between the current configurations and the summary below, update this file to reflect the new patterns.

### Backend — `backend/vitest.config.ts`

- **No `globals: true`** → must import everything from `'vitest'` explicitly:
  ```ts
  import { beforeEach, describe, expect, it, vi } from 'vitest';
  ```
- **`clearMocks: true`** → mock call history is cleared automatically between tests; no need for `vi.clearAllMocks()` in `beforeEach`
- Test file pattern: `**/*.{spec,e2e-spec}.[jt]s`
- E2e tests require `--no-file-parallelism` flag

### Frontend — `frontend/vitest.config.ts`

- **`globals: true`** → do NOT import `describe`, `it`, `expect`, `vi`, `beforeEach` etc. — they are global
- **No `clearMocks`/`restoreMocks`** → `vi.clearAllMocks()` still needs to be called manually in `beforeEach` when mocks are used
- `setupFiles: './test/vitest.setup.ts'` auto-imports `@testing-library/jest-dom` matchers
- Test file pattern: `src/**/*.test.tsx`

### Playwright — `playwright.config.ts`

- `fullyParallel: true` + default workers locally → multiple test files share the single test DB concurrently
- **Consequence**: never assert on absolute row counts across the whole table. Use `filter({ hasText: uniqueTitle })` to target only records created in the current test.
- `reuseExistingServer: !process.env.CI` → locally the test server is expected to already be running; Playwright won't start a fresh one
- In CI: `workers: 1` (sequential), `retries: 2`

---

## Running tests

```bash
# Backend unit (single file)
cd backend && yarn vitest run src/path/to/file.spec.ts

# Backend e2e (single file)
cd backend && yarn vitest run test/auth.e2e-spec.ts --no-file-parallelism

# Backend all tests
cd backend && make test

# Frontend unit (single file)
cd frontend && yarn vitest run src/path/to/file.test.tsx

# Frontend all tests
cd frontend && make test

# Playwright (single spec)
yarn playwright test tests/e2e/foo.spec.ts

# Playwright (all)
make test-e2e-playwright

# All tests
make test-all
```

---

## Snapshot tests

**Never regenerate snapshots without explicit user confirmation.** If snapshots are failing and regeneration seems like the fix, stop and ask first. Snapshots represent intentional baselines — silently overwriting them defeats their purpose.

---

## Patterns to follow

- Look at an existing test file in the same layer (unit/e2e/playwright) before writing a new one — match its import style, structure, and mock setup.
- Backend unit tests use `vi.fn()` mocks on a `mockPrisma` object injected into the service under test.
- Playwright tests log in via the login page; credentials come from `tests/e2e/config.ts`.
- All test-level strings (descriptions, seed data, mock values) must be in English (see Language rule in CLAUDE.md).

