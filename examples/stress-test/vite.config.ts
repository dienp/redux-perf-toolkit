import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { reduxPerfPlugin } from '../../packages/vite-plugin/src/index';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    reduxPerfPlugin({
      corePath: path.resolve(__dirname, '../../packages/core/src/index.ts')
    })
  ],
  base: '/redux-perf-toolkit/',
  resolve: {
    alias: {
      // Direct alias to the core package source (Vite will handle TS transformation)
      '@dienp/redux-perf-core': path.resolve(__dirname, '../../packages/core/src/index.ts')
    }
  }
})
