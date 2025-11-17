import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// 1. Importá el plugin
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: 'google chrome'
  },
  plugins: [
    react(),
    // 2. Agregá el plugin
    VitePWA({
      // 3. Configuración del plugin
      registerType: 'autoUpdate', // Se actualiza sola sin preguntar
      devOptions: {
        enabled: true // Habilita la PWA en modo 'npm run dev' (opcional)
      },
      // 4. Configuración del "manifest" (la info de la app)
      manifest: {
        name: 'Admin-Portafolio Germán Oviedo',
        short_name: 'GO-Admin Portafolio',
        description: 'Admin del Portafolio personal de Germán Oviedo, desarrollador web.',
        theme_color: '#1f2937', // Es el color 'bg-dark-surface' de tu web
        background_color: '#111827', // Es el 'bg-dark-bg'
        icons: [
          {
            src: 'pwa-192x192.png', // El nombre del ícono en /public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // El nombre del ícono en /public
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Para íconos "maskable"
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})