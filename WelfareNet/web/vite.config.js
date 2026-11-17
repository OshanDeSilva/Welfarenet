import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Data management
          'data-vendor': ['@tanstack/react-query', 'axios'],
          // Charts
          'charts': ['recharts'],
          // PDF generation
          'pdf-vendor': ['html2canvas', 'jspdf', 'jspdf-autotable'],
          // WebSocket
          'websocket': ['@stomp/stompjs', 'sockjs-client'],
          // UI utilities
          'ui-vendor': ['lucide-react', 'jwt-decode'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000 kB
  },
})
