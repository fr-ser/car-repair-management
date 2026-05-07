import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router')
            ) {
              return 'vendor-react';
            }
            if (
              id.includes('node_modules/@mui/x-date-pickers') ||
              id.includes('node_modules/dayjs/')
            ) {
              return 'vendor-mui-date';
            }
            if (
              id.includes('node_modules/@mui/') ||
              id.includes('node_modules/@emotion/')
            ) {
              return 'vendor-mui';
            }
            if (id.includes('node_modules/@tanstack/')) {
              return 'vendor-query';
            }
          },
        },
      },
    },
    server: {
      // the server proxy allows us to avoid cross origin request (and cookie) issues
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
