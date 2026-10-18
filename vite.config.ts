import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        dashboard: path.resolve(__dirname, 'src/pages/dashboard/index.html'),
        popup: path.resolve(__dirname, 'src/pages/popup/index.html'),
        options: path.resolve(__dirname, 'src/pages/options/index.html'),
      },
    },
  },
});
