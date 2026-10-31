import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5239',
      '/bff': 'http://localhost:5239',
      '/health': 'http://localhost:5239',
    },
  },
})
