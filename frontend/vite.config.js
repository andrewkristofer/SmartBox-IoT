import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssnano from 'cssnano'

export default defineConfig({
  plugins: [react()],
  css: {
    transformerOptions: {
      lightningcss: {
        minify: false,   // 🚫 Matikan minifier LightningCSS (penyebab error)
      },
    },
    postcss: {
      plugins: [
        cssnano({ preset: 'default' })  // ✔ pakai cssnano sebagai pengganti
      ]
    }
  },
  build: {
    cssMinify: false  // ✔ pastikan Vite tidak coba minify ulang
  }
})
