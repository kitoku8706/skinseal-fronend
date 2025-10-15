import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pingBackend } from "../api/testApi";
import NoticeListPage from "./NoticeListPage";
import NavBar from "../components/NavBar";
import "./HomePage.css";
import RightSidebar from "../components/RightSidebar"; // ← 추가

function HomePage() {
  const [result, setResult] = useState("");
  const navigate = useNavigate();

  // 드롭다운 상태 관리
  const [openMenu, setOpenMenu] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    pingBackend()
      .then(setResult)
      .catch((error) => {
        const errorMsg =
          error?.message || error?.toString() || "알 수 없는 오류";
        setResult(`연동 실패: ${errorMsg}`);
      });

    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <>

      <div className="homepage-container">

        <section className="review-section">
          <h2>공지사항</h2>
          <div>
            <NoticeListPage />
          </div>
        </section>

        {/* 메인 배너 */}
        <section className="main-banner">
          <h1>빠르고 안전한 진료, SkinSeal 병원</h1>
          <p>진료부터 수술, 그리고 진료연계까지 믿고 맡길 수 있는 병원</p>
          <button
            className="banner-btn"
            onClick={() => navigate("/reservation/consult")}
          >
            진료 예약 바로가기
          </button>
        </section>

        {/* 센터/진료과 소개 */}
        <section className="center-section">
          <h2>전문 센터 안내</h2>
          <div className="center-cards">
            <div className="center-card">척추센터</div>
            <div className="center-card">관절센터</div>
            <div className="center-card">뇌신경센터</div>
            <div className="center-card">내과</div>
            <div className="center-card">건강검진센터</div>
          </div>
        </section>

        {/* 소셜채널/언론보도/블로그 콘텐츠 */}
        <section className="social-section">
          <h2>소셜채널 & 언론보도</h2>
          <div className="social-cards">
            <div className="social-card">유튜브 콘텐츠</div>
            <div className="social-card">블로그 소식</div>
            <div className="social-card">언론보도</div>
          </div>
        </section>

        {/* 빠른 예약/상담/오시는 길 등 바로가기 */}
        <section className="quick-links">
          <button>진료 예약</button>
          <button>의료 상담</button>
          <button>오시는 길</button>
        </section>
      </div>
      <RightSidebar /> {/* ← 바깥에 추가하면 오른쪽 고정 */}
    </>
  );
}
export default HomePage;
