import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
  const userRole = localStorage.getItem("role");
  const isLoggedIn = !!localStorage.getItem("accessToken");

  // 로그인 필요만 체크할 경우
  if (!isLoggedIn) {
    // alert("로그인이 필요합니다."); // ← alert 제거
    return <Navigate to="/login" replace />;
  }

  // 권한까지 체크할 경우
  if (requiredRole && userRole !== requiredRole) {
    // alert("접근 권한이 없습니다."); // ← alert 제거
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;