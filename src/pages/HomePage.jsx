import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pingBackend, getUsersFromBackend, getChatbotCategories } from "../api/testApi";
import NoticeListPage from "./NoticeListPage";
import NavBar from "../components/NavBar";
import "./HomePage.css";
import RightSidebar from "../components/RightSidebar"; // ← 추가

function HomePage() {
  const [result, setResult] = useState("");
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userError, setUserError] = useState("");
  const [categoryError, setCategoryError] = useState("");
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

  const handleGetUsers = async () => {
    setUserError("");
    try {
      const data = await getUsersFromBackend();
      setUsers(data);
    } catch (err) {
      setUserError(err.message || "유저 조회 실패");
      setUsers([]);
    }
  };

  const handleGetCategories = async () => {
    setCategoryError("");
    try {
      const data = await getChatbotCategories();
      setCategories(data);
    } catch (err) {
      setCategoryError(err.message || "카테고리 조회 실패");
      setCategories([]);
    }
  };

  return (
    <>
      <div className="homepage-container">

        {/* 공지사항 바로가기 버튼 상단에 추가 */}
        <div style={{ width: "100%", display: "flex", justifyContent: "center", margin: "32px 0 0 0" }}>
          <button
            className="banner-btn"
            style={{ minWidth: 180 }}
            onClick={() => navigate("/notice")}
          >
            공지사항 바로가기
          </button>
        </div>  
      
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

        {/* DB 연동 테스트 섹션 */}
        <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #eee', background: '#fafafa' }}>
          <h3>DB 연동 테스트</h3>
          <button onClick={handleGetUsers}>유저 목록 조회</button>
          {userError && <div style={{ color: 'red' }}>{userError}</div>}
          <ul>
            {users.map((user, idx) => (
              <li key={user.id || idx}>{user.name || JSON.stringify(user)}</li>
            ))}
          </ul>
          <button onClick={handleGetCategories}>챗봇 카테고리 조회</button>
          {categoryError && <div style={{ color: 'red' }}>{categoryError}</div>}
          <ul>
            {categories.map((cat, idx) => (
              <li key={cat.id || idx}>{cat.name || JSON.stringify(cat)}</li>
            ))}
          </ul>
        </div>
      </div>
      <RightSidebar /> {/* ← 바깥에 추가하면 오른쪽 고정 */}
    </>
  );
}
export default HomePage;