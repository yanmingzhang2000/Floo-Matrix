import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 项目页面部署在 /Floo-Matrix/ 子路径下，构建时通过 GITHUB_PAGES 环境变量切换 base
  base: process.env.GITHUB_PAGES ? '/Floo-Matrix/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
