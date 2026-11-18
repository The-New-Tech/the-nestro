import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// VITE_BASE: '/' (mặc định) hoặc '/ten-repo/' khi deploy GitHub Pages dạng project site
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // app tự hiện toast "Có phiên bản mới" (xem components/PwaPrompt)
      includeAssets: ['favicon.png', 'icons/apple-touch-icon.png', 'images/*'],
      manifest: {
        name: 'The Nestro – Đặt phòng',
        short_name: 'The Nestro',
        description: 'Đặt phòng khách sạn The Nestro: chọn phòng trên sơ đồ tầng, thanh toán QR và quản lý đặt phòng.',
        lang: 'vi',
        dir: 'ltr',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#FAF6EF',
        theme_color: '#3B2416',
        categories: ['travel', 'lifestyle'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          { name: 'Đặt phòng', short_name: 'Đặt phòng', url: base + 'dat-phong', icons: [{ src: 'icons/icon-96.png', sizes: '96x96' }] },
          { name: 'Tra cứu đặt phòng', short_name: 'Tra cứu', url: base + 'tra-cuu', icons: [{ src: 'icons/icon-96.png', sizes: '96x96' }] }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,webp,svg,ico}'],
        navigateFallback: base + 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          // Khi có backend: API đọc dữ liệu (phòng, giá, ưu đãi) ưu tiên mạng, rơi về cache khi offline
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/') && !/(payments|bookings)/.test(url.pathname),
            handler: 'NetworkFirst',
            options: { cacheName: 'nestro-api', networkTimeoutSeconds: 4, expiration: { maxEntries: 60, maxAgeSeconds: 3600 } }
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ]
})
