import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'charts': ['recharts'],
          'form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'table': ['@tanstack/react-table'],
          'query': ['@tanstack/react-query'],
          'icons': ['lucide-react'],
        }
      }
    },
    // Increase chunk size warning limit to 1MB since our app is feature-rich
    chunkSizeWarningLimit: 1000,
  },
}));
