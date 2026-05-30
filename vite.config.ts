import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg', 'favicon.ico'],
      manifest: {
        name: 'COMUNICA-JC - Joven Club San Luis',
        short_name: 'COMUNICA-JC',
        description: 'Aplicación de gestión de horarios, anuncios, reservas y reportes',
        theme_color: '#1E3A8A',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    hmr: { protocol: 'ws', host: 'localhost', port: 5173 },
  }
})
