import path from 'path';
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
      src: path.resolve(__dirname, './src'),
      test: path.resolve(__dirname, './test'),
    },
  },
  // the swc part is required for nest e2e tests
  plugins: [swc.vite()],
});
