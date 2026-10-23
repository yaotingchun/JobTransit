import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // Exclude pdfjs-dist from pre-bundling so the worker URL resolves correctly
    exclude: ['pdfjs-dist'],
  },
  worker: {
    format: 'es',
  },
})

