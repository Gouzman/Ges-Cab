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
  base: './', // Assure que les chemins sont résolus relativement à la racine
  server: {
    port: 3002,
    strictPort: false, // Permet à Vite d'essayer le port suivant si 3002 est occupé
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'], // Préchargement des dépendances principales
  },
  build: {
    sourcemap: true, // Aide au débogage
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-label']
        }
      }
    }
  }
});