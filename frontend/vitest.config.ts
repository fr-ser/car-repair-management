import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@shared': path.resolve(__dirname, '../backend/src/common'),
      'decimal.js': path.resolve(
        __dirname,
        'node_modules/decimal.js/decimal.mjs',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.tsx'],
    setupFiles: './test/vitest.setup.ts',
  },
});
