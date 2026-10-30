import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the build works on GitHub Pages under /<repo>/
  base: './',
  // `npm run dev` forwards API calls to the backend, mirroring nginx in Docker.
  server: {
    proxy: {
      '/api': apiTarget,
      '/health': apiTarget,
    },
  },
})
