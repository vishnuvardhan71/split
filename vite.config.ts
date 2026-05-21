import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Uncomment the line below ONLY if deploying to GitHub Pages
  // base: '/split/',
  plugins: [react(), tailwindcss()],
})
