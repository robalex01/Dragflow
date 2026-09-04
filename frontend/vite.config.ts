import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api vers le backend Express (voir src/web/server.js) pendant le développement.
// En production, servir le frontend buildé depuis un domaine distinct et configurer
// VITE_API_URL + DASHBOARD_URL/CORS côté backend en conséquence.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
