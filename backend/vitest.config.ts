import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.{spec,e2e-spec}.[jt]s'],
    environment: 'node',
    env: {
      CONFIG_PATH: '.env.test',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
  // the swc part is required for nest e2e tests
  // module type must be overridden: .swcrc sets commonjs for nest build,
  // but vitest requires ESM
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
