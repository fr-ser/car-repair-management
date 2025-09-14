# Frontend

This is the frontend documentation.
Please also refer to the overall project documentation for guidance.

## Structure

```text
src/
├── assets/           # Static files (images, fonts, icons, etc.)
├── components/       # Reusable UI components (buttons, modals, etc.)
│   └── Button/
│       ├── Button.tsx
│       ├── Button.test.tsx
│       └── Button.module.css (or .scss / tailwind / styled)
├── pages/         # Feature-based components (e.g., auth, dashboard, chat)
│   └── client/
│       ├── __tests__/
│       ├── components/
│       ├── hooks/
│       ├── ClientListPage.tsx
│       └── ClientDetailsPage.tsx
├── hooks/            # Reusable custom hooks
├── services/         # API calls, external services (e.g. fetch, axios, etc.)
├── types/            # TypeScript type definitions & interfaces
├── utils/            # General utility functions (date formatters, validators, etc.)
└── main.tsx          # App entry point with routes (or index.tsx)
```
