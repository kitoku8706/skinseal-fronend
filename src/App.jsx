import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import UserLoginPage from './pages/UserLoginPage';
import UserJoinPage from './pages/UserJoinPage';
import NoticeListPage from './pages/NoticeListPage';
import AiDiagnosisPage from './pages/AiDiagnosisPage';
import LoginModal from './components/LoginModal.jsx';
import RegisterModal from './components/RegisterModal.jsx';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <Router>
      <Header />
      <main style={{ minHeight: '80vh' }}>
        <div>
          {/* 버튼 클릭 시에만 팝업이 뜨도록 */}
          {/* {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} />
          )}
          {showRegisterModal && (
            <RegisterModal onClose={() => setShowRegisterModal(false)} />
          )} */}
          <h1>Skin Front</h1>
          {/* ...기타 메인 페이지 내용... */}
          <button
            onClick={async () => {
              try {
                const res = await fetch('http://localhost:8090/health');
                if (res.ok) {
                  alert('백엔드 연결 성공!');
                } else {
                  alert('백엔드 연결 실패!');
                }
              } catch (e) {
                alert('백엔드 연결 실패!');
              }
            }}
          >
            백엔드 연결 테스트
          </button>
        </div>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/join" element={<UserJoinPage />} />
          <Route path="/notice" element={<NoticeListPage />} />
          <Route path="/ai/diagnose" element={<AiDiagnosisPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
