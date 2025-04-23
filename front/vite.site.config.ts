import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import prerender from './vite-plugin-prerender';

export default defineConfig({
  plugins: [react(), prerender()],
  root: 'src/site',
  build: {
    outDir: '../../dist/site',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/site/index.html'),
      },
    },
  },
  base: '/',
}); 