import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/vts_lookfeel_nav_concept_1-0/',
  plugins: [react(), tailwindcss()],
  server: {
    port: parseInt(process.env.PORT ?? '5174'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
