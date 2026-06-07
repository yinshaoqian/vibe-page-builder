import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5000,
    hmr: {
      port: 6000,
      path: '/hot/vite-hmr'
    }
  }
})