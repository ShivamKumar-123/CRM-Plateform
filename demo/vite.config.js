import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5174 },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Manual chunks — keep heavy libs separate so they cache across deploys.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
          charts: ['recharts'],
        },
      },
    },
  },
})
