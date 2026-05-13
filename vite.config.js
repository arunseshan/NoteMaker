import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      // Allows Vite to serve media files from your Application Support folder
      allow: ['..'] 
    }
  },
  build: {
    outDir: 'dist',
  },
})