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
const backendPort = 8090; // 백엔드 서버 포트를 8090으로 설정합니다.

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {

      '/api': {
        target: `http://${localIp}:${backendPort}`,
        changeOrigin: true,
        secure: false,
      },
      "/management/api": {
        // 관계자 소개 API 경로 추가
        target: "http://localhost:8090",
        // target: `http://${localIp}:${backendPort}`
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
