import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    visualizer({
      filename: 'bundle-report.html', // output file
      open: true,                     // auto-open in browser
      gzipSize: true,                 // show gzip sizes
      brotliSize: true                // show brotli sizes
    })


  ],
  css: {
    postcss: './postcss.config.js',
  },



    server: {
      allowedHosts: ['.ngrok-free.dev']
    }
  
  
})
