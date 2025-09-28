import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import UserLoginPage from './pages/UserLoginPage';
import UserJoinPage from './pages/UserJoinPage';
import NoticeListPage from './pages/NoticeListPage';
import AiDiagnosisPage from './pages/AiDiagnosisPage';

function App() {
  return (
    <Router>
      <Header />
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/join" element={<UserJoinPage />} />
          <Route path="/notice" element={<NoticeListPage />} />
          <Route path="/ai/diagnose" element={<AiDiagnosisPage />} />
          {/* 예약, 마이페이지 등 나머지 페이지도 여기에 추가 */}
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
