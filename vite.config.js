import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 모든 IP에서 접근 허용
    port: 5173,      // (원하는 포트)
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
  // server: {
  //   proxy: {
  //     '/api': 'http://localhost:8080'
  //   }
  // }
})
