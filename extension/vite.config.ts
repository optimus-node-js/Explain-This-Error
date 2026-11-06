import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  esbuild: {
    target: 'es2020',
    include: /\.(ts|tsx)$/
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  build: {
    rollupOptions: {
      input: {
        background: 'src/background/index.ts',
        content: 'src/content/index.ts',
        devtools: 'src/devtools/index.html',
        popup: 'src/popup/index.html'
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5174
    }
  },
  css: {
    postcss: './postcss.config.js'
  }
})
