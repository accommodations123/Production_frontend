import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/host': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'Host': 'api.nextkinlife.live',
          'Origin': 'https://nextkinlife.live'
        },
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'Host': 'api.nextkinlife.live',
          'Origin': 'https://nextkinlife.live'
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              proxyRes.headers['set-cookie'] = setCookie.map(cookie => {
                // Remove Domain, Secure, SameSite and explicitly add SameSite=Lax
                return cookie
                  .replace(/;?\s*Domain=[^;]+/i, '')
                  .replace(/;?\s*Secure/i, '')
                  .replace(/;?\s*SameSite=[^;]+/i, '') + '; SameSite=Lax';
              });
            }
          });
        }
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        headers: {
          'Host': 'api.nextkinlife.live',
          'Origin': 'https://nextkinlife.live'
        },
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              proxyRes.headers['set-cookie'] = setCookie.map(cookie => {
                // Remove Domain, Secure, SameSite and explicitly add SameSite=Lax
                return cookie
                  .replace(/;?\s*Domain=[^;]+/i, '')
                  .replace(/;?\s*Secure/i, '')
                  .replace(/;?\s*SameSite=[^;]+/i, '') + '; SameSite=Lax';
              });
            }
          });
        }
      },

    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('country-state-city')) {
              return 'vendor-location';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor';
          }
        }
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})