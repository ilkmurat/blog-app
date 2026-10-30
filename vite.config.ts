import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:8000'
const agentTarget = process.env.AGENT_PROXY_TARGET ?? 'http://localhost:8001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Absolute base for client-side routing; GitHub Pages builds set VITE_BASE=/<repo>/
  base: process.env.VITE_BASE ?? '/',
  // `npm run dev` forwards API calls to the backend, mirroring nginx in Docker.
  server: {
    proxy: {
      '/api': apiTarget,
      '/health': apiTarget,
      '/agent': agentTarget,
    },
  },
})
