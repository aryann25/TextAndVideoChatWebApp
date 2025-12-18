/* import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,       // ✅ Allow LAN access (other devices)
    port: 5173,       // ✅ Fixed port
    proxy: {
      "/api": {
        target: "http://localhost:8080", // ✅ API Gateway
        changeOrigin: true,
        ws: true                          // ✅ WebSocket support (chat + video)
      }
    }
  },

  optimizeDeps: {
    define: {
      global: "globalThis" // ✅ Fixes SockJS / STOMP / buffer issue
    }
  }
});
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // API GATEWAY
        changeOrigin: true,
        ws: true
      }
    }
  },
  optimizeDeps: {
    define: {
      global: 'globalThis'
    }
  }
})
