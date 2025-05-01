import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy API requests to the backend server running on port 3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // No need to rewrite path, as both frontend and backend use /api prefix
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});

