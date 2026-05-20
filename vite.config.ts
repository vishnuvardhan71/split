import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages: https://<user>.github.io/<repo>/
  base: '/split/',
  plugins: [react(), tailwindcss()],
})
