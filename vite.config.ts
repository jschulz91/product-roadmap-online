import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// On GitHub Pages the app is served from /<repo>/, so use that as the base for
// production builds. Local dev keeps serving from the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/product-roadmap-online/' : '/',
  plugins: [react(), tailwindcss()],
}))
