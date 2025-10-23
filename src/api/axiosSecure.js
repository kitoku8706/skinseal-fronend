// src/api/axiosSecure.js
import axios from "axios";

// ✅ 예약/마이페이지 등 인증이 필요한 요청에만 사용하는 axios 인스턴스
const axiosSecure = axios.create({
  baseURL: "http://localhost:8090/api",
  withCredentials: true, // 쿠키 기반 세션을 사용하지 않아도 안전성 확보
});

// ✅ 요청(Request) 인터셉터
axiosSecure.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ 토큰이 없습니다. 로그인 후 이용해주세요.");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답(Response) 인터셉터
axiosSecure.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized → 로그인 만료 처리
    if (error.response && error.response.status === 401) {
      alert("⏰ 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosSecure;
