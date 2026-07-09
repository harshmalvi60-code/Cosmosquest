import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2019',
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    host: true,
    port: 5173,
  },
});
