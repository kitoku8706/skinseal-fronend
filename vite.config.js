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
    proxy: {      // history 및 latest 엔드포인트는 Spring Boot로 전달 (정확 매칭)
      "/api/diagnosis/history": {
        target: "http://18.210.20.169:8090",
        changeOrigin: true,
      },
      "/api/diagnosis/latest": {
        target: "http://18.210.20.169:8090",
        changeOrigin: true,
      },

      // /api/diagnosis (prefix)로 들어오는 모든 요청은 Python AI 서버로 전달
      // 위의 history, latest 정규식이 먼저 매칭되므로 해당 요청들은 Spring으로 전달됩니다.
      "/api/diagnosis": {
        target: "http://3.224.61.135:5000",
        changeOrigin: true,
      },

      // 업로드된 이미지/정적 자원은 Spring에서 제공하므로 명시적으로 라우트
      "/uploads": {
        target: "http://18.210.20.169:8090",
        changeOrigin: true,
      },

      "/api/health": {
        target: "http://3.224.61.135:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/api": {
        target: "http://18.210.20.169:8090",
        changeOrigin: true,
      },
      "/management/api": {
        target: "http://18.210.20.169:8090",
        changeOrigin: true,
      }
    }
  },
});
