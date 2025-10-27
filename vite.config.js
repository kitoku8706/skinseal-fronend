import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import os from "os";

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

const localIp = getLocalIpAddress();
const backendPort = 8090; 

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: [
      'sinseal.duckdns.org',
      'localhost',
      localIp
    ],
    proxy: {
      "/api/diagnosis": {
        target: "http://localhost:5000", 
        changeOrigin: true,
      },
      "/api/health": {
        target: "http://localhost:5000", 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/api": {
        target: "http://localhost:8090",
        changeOrigin: true,
      },
      "/management/api": {
        target: "http://localhost:8090",
        changeOrigin: true,
      }
    }
  },
});
