import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom"; // Outlet 추가
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
import ReservationQuery from "./pages/ReservationQuery.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import DiagnosisLayout from "./pages/DiagnosisLayout.jsx";

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
                    {/* 공통 레이아웃을 사용하는 진단 페이지 그룹 */}
                    <Route element={<DiagnosisLayout><Outlet /></DiagnosisLayout>}>
                        <Route path="/ai/diagnose" element={<AiDiagnosisPage />} />
                        {/* /diagnosis 경로가 질병 목록의 기본 페이지 역할을 하도록 설정 */}
                        <Route path="/diagnosis" element={<DiagnosisPage />} /> 
                        <Route path="/diagnosis/:id" element={<DiagnosisPage />} />
                        {/* 진단 결과 페이지가 있다면 여기에 추가 (예: /diagnosis/result) */}
                    </Route>
                    
                    {/* 기존 라우트들 */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<UserLoginPage />} />
                    <Route path="/join" element={<UserJoinPage />} />
                    <Route path="/notice" element={<NoticeListPage />} />
                    <Route path="/notice/:id" element={<NoticeDetailPage />} />
                    <Route path="/intro" element={<IntroPage />} />
                    <Route path="/management" element={<ManagementTeam />} />
                    <Route path="/directions" element={<Directions />} />
                    <Route path="/reservation/chatbot" element={<ChatbotConsultPage />} />

                    {/* 로그인만 필요 */}
                    <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
                    <Route path="/reservation/consult" element={<ProtectedRoute><ReservationConsultPage /></ProtectedRoute>} />
                    <Route path="/mypage/edit" element={<ProtectedRoute><MyInfoEdit /></ProtectedRoute>} />
                    <Route path="/mypage/withdraw" element={<ProtectedRoute><UserWithdrawal /></ProtectedRoute>} />
                    <Route path="/mypage/reservation" element={<ProtectedRoute><ReservationConsultPage /></ProtectedRoute>} />
                    {/* 마이페이지 내 진단 페이지도 Layout이 적용되도록 수정할 수 있음 */}
                    <Route path="/mypage/diagnosis" element={<ProtectedRoute><DiagnosisLayout><DiagnosisPage /></DiagnosisLayout></ProtectedRoute>} />

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