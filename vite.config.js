import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'src/popup/popup.html'
      }
    }
  },
  server: {
    port: 3000,
    open: '/src/popup/popup.html'
  },
  preview: {
    port: 3000,
    open: '/src/popup/popup.html'
  }
});