import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://projectsens.pythonanywhere.com')
  }
})