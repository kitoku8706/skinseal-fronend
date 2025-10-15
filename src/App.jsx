import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import UserLoginPage from "./pages/UserLoginPage";
import UserJoinPage from "./pages/UserJoinPage";
import NoticeListPage from "./pages/NoticeListPage";
import AiDiagnosisPage from "./pages/AiDiagnosisPage";
import LoginModal from "./components/LoginModal.jsx";
import RegisterModal from "./components/RegisterModal.jsx";
import IntroPage from "./pages/IntroPage";
import { NoticeForm } from "./components/NoticeForm";
import NoticeEditPage from "./pages/NoticeEditPage";
import ManagementTeam from "./pages/ManagementTeam";
import Directions from "./pages/Directions";
import ReservationConsultPage from "./pages/ReservationConsultPage";
import NavBar from "./components/NavBar";
import DiagnosisPage from "./pages/DiagnosisPage";
import MyPage from "./pages/MyPage.jsx";
import ChatbotConsultPage from "./pages/ChatbotConsultPage";
import NoticeDetailPage from "./pages/NoticeDetailPage";
import MyInfoEdit from "./pages/MyInfoEdit.jsx";
import UserWithdrawal from "./pages/UserWithdrawal.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

const TestConnection = () => {
  const [response, setResponse] = useState("결과 대기 중...");

  // 사용자님의 서버 포트 8090에 맞춰 URL 설정
  const API_URL = "http://localhost:8090/member/user";

  const checkDatabaseConnection = async () => {
    setResponse("API 요청 중...");
    try {
      // CORS 문제 방지를 위해 mode: 'cors'를 명시적으로 설정
      const res = await fetch(API_URL, {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP 오류: ${res.status} ${res.statusText}`);
      }

      // 응답을 JSON으로 파싱 (DB에 저장된 사용자 목록이 여기에 포함됨)
      const data = await res.json();

      setResponse(
        <>
          <p className="text-green-600 font-bold">
            ✅ 연결 성공! DB 데이터 수신 완료.
          </p>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto max-h-40">
            {JSON.stringify(data, null, 2)}
          </pre>
          <p className="mt-1 text-xs text-gray-500">
            데이터가 출력되면, **React ↔ Spring Boot ↔ DB** 연결이 모두 성공한
            것입니다.
          </p>
        </>
      );
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
      setResponse(
        <>
          <p className="text-red-600 font-bold">❌ 연결 실패...</p>
          <p className="text-red-500 mt-1">오류 메시지: {error.message}</p>
          <p className="mt-2 text-xs text-gray-500">
            💡 **Failed to fetch** 오류는 주로 **CORS 설정** 문제이므로, Spring
            Boot의 `SecurityConfig.java`를 확인해 주세요.
          </p>
        </>
      );
    }
  };

  return (
    <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg m-4">
      <h2 className="text-lg font-semibold mb-3 text-blue-700">
        📌 React ↔ Spring Boot ↔ DB 통합 연결 테스트
      </h2>

      <button
        onClick={checkDatabaseConnection}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
      >
        단순 DB 조회 API 호출 (GET {API_URL})
      </button>

      <div className="mt-4 p-3 bg-white shadow-inner rounded">
        <h3 className="text-md font-medium">Response:</h3>
        <div className="text-gray-800">{response}</div>
      </div>
    </div>
  );
};

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAIPopup, setShowAIPopup] = useState(false);

  return (
    <Router>
      <Header />
      <NavBar />
      <main style={{ minHeight: "80vh" }}>
        <Routes>
          {/* 공개 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/join" element={<UserJoinPage />} />
          <Route path="/notice" element={<NoticeListPage />} />
          <Route path="/notice/:id" element={<NoticeDetailPage />} />
          <Route path="/ai/diagnose" element={<AiDiagnosisPage />} />
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/management" element={<ManagementTeam />} />
          <Route path="/directions" element={<Directions />} />
          <Route path="/diagnosis" element={<DiagnosisPage />} />
          <Route path="/diagnosis/:id" element={<DiagnosisPage />} />
          <Route path="/reservation/chatbot" element={<ChatbotConsultPage />} />

          {/* 로그인만 필요 */}
          <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
          <Route path="/reservation/consult" element={<ProtectedRoute><ReservationConsultPage /></ProtectedRoute>} />
          <Route path="/mypage/edit" element={<ProtectedRoute><MyInfoEdit /></ProtectedRoute>} />
          <Route path="/mypage/withdraw" element={<ProtectedRoute><UserWithdrawal /></ProtectedRoute>} />
          <Route path="/mypage/reservation" element={<ProtectedRoute><ReservationConsultPage /></ProtectedRoute>} />
          <Route path="/mypage/diagnosis" element={<ProtectedRoute><DiagnosisPage /></ProtectedRoute>} />

          {/* ADMIN만 필요 */}
          <Route path="/notice/edit/:id" element={<ProtectedRoute requiredRole="ADMIN"><NoticeEditPage /></ProtectedRoute>} />
          <Route path="/notice/write" element={<ProtectedRoute requiredRole="ADMIN"><NoticeForm /></ProtectedRoute>} />
        </Routes>        
      </main>
      <Footer />
    </Router>
  );
}

export default App;
