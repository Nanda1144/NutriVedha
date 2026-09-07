import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// NutriVedha — single frontend merged (Main_interface + parts 1-6)
// Microservices: all /api/* proxied to gateway :8080 (per-service: auth:3001, user:3002, ai:3003, etc.)
// Services remain isolated in src/services/*.ts -> client.ts -> gateway
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // For HttpOnly refresh cookie (spec 13) — forward credentials
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Forward original cookie if present
            const cookie = (req as any).headers?.cookie;
            if (cookie) proxyReq.setHeader('cookie', cookie);
          });
        },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react'],
          store: ['zustand'],
        },
      },
    },
  },
})
