// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],

//   server: {
//     proxy: {
//       '/api': 'http://localhost:8080'
//     }
//   }

// })

// vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import os from "os";

// 1. 현재 PC의 로컬 네트워크 IP 주소를 찾는 함수
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const net of interfaces[name]) {
      // IPv4 주소이고, 내부 주소(127.0.0.1)가 아닌 것을 찾습니다.
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  // 로컬 IP를 찾지 못하면 'localhost'를 반환합니다.
  return "localhost";
}

// 2. IP 주소 및 포트 설정
const localIp = getLocalIpAddress();
const backendPort = 8090; 

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접속 허용
    port: 5173,
    strictPort: false,
    // DuckDNS 도메인 허용
    allowedHosts: [
      'sinseal.duckdns.org',
      'localhost',
      localIp
    ],
    // 3. API 프록시 설정 추가
    proxy: {
      // AI 진단 및 상태 확인 요청을 위한 프록시
      "/api/diagnosis": {
        target: "http://localhost:5000", // 파이썬 백엔드 서버
        changeOrigin: true,
      },
      "/api/health": {
        target: "http://localhost:5000", // 파이썬 백엔드 서버
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // 나머지 API 요청을 위한 프록시
      "/api": {
        target: "http://localhost:8090", // 스프링 부트 백엔드 서버
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  // 빌드 설정
});
