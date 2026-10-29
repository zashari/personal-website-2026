import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import path from 'path';

export default defineConfig({
  // React Compiler (stable 1.0) memoizes components and hooks automatically.
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // The lazily loaded paper viewer carries three.js (~920 kB minified); warn only beyond that.
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      // /temp (code-built sheets), /home (new landing page), /about, /projects and /resume are separate pages; the main
      // page is unaffected.
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        temp: path.resolve(import.meta.dirname, 'temp/index.html'),
        home: path.resolve(import.meta.dirname, 'home/index.html'),
        about: path.resolve(import.meta.dirname, 'about/index.html'),
        projects: path.resolve(import.meta.dirname, 'projects/index.html'),
        resume: path.resolve(import.meta.dirname, 'resume/index.html'),
      },
    },
  },
  server: {
    host: true, // Expose to network
  },
});

