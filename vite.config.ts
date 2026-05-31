import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        navigateFallbackDenylist: [/^\/api/, /^https?:\/\/npdsdfjzftyhlqhyspko\.supabase\.co/],
        runtimeCaching: [{
          urlPattern: /^https?:\/\/npdsdfjzftyhlqhyspko\.supabase\.co\/storage\/v1/,
          handler: 'CacheFirst',
          options: { cacheName: 'supabase-storage', expiration: { maxEntries: 50, maxAgeSeconds: 86400 * 30 } },
        }],
      },
      manifest: {
        name: 'COMUNICA-JC - Joven Club San Luis',
        short_name: 'COMUNICA-JC',
        description: 'Aplicación de gestión de horarios, anuncios, reservas y reportes',
        theme_color: '#1E3A8A',
        background_color: '#111827',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    hmr: { protocol: 'ws', host: 'localhost', port: 5173 },
  }
})
