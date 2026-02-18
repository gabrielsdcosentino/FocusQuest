import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'www',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    host: true // Permite acesso via IP local
  }
});
