import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',

  css: {
    transformer: 'postcss',
    minify: false, // <— memastikan lightningcss TIDAK dipakai
    postcss: './postcss.config.js',
  },

  build: {
    cssMinify: false, // <— ini yang paling penting
  },

  plugins: [react()],
})
