import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.{spec,e2e-spec}.[jt]s'],
    environment: 'node',
    clearMocks: true,
    env: {
      CONFIG_PATH: '.env.test',
      // Override one key per service so real .envrc credentials cannot be used in tests
      APP_MAIL_HOST: 'test-placeholder',
      DROPBOX_CLIENT_ID: 'test-placeholder',
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
