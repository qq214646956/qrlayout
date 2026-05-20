import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['qrcode'],
    exclude: ['qrlayout-core', 'qrlayout-ui'],
  },
  resolve: {
    alias: {
      'qrcode/lib/browser.js': 'qrcode',
    },
  },
})
