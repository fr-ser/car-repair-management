import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.tsx'],
    setupFiles: './test/vitest.setup.ts',
    coverage: {
      provider: 'v8', // built-in coverage provider
      reporter: ['text', 'lcov'], // text in console + HTML report
      reportsDirectory: './coverage', // output folder
      all: true, // collect coverage from all files, not just tested
      include: ['src/**/*.{ts,tsx}'], // which files to include
      exclude: ['node_modules/', 'test/'], // exclude tests and deps
    },
  },
});
