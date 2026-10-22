import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // The lazily loaded paper viewer carries three.js (~920 kB minified); warn only beyond that.
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: true, // Expose to network
  },
});

