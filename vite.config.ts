import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/your-repo-name/', // ← Replace with your actual repo name
  plugins: [vue()]
})