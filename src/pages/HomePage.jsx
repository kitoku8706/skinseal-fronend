import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pingBackend, getUsersFromBackend, getChatbotCategories } from "../api/testApi";
import NoticeListPage from "./NoticeListPage";
import NavBar from "../components/NavBar";
import "./HomePage.css";
import RightSidebar from "../components/RightSidebar";

function HomePage() {
  const [result, setResult] = useState("");
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userError, setUserError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const navigate = useNavigate();

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

        {/* 공지사항 바로가기 버튼의 상단 마진을 48px로 설정 */}
        <div style={{ width: "100%", display: "flex", justifyContent: "center", margin: "48px 0 0 0" }}>
          <button
            className="banner-btn"
            style={{ minWidth: 180 }}
            onClick={() => navigate("/notice")}
          >
            공지사항 바로가기
          </button>
        </div>

        <section className="center-section">
          <h2>전문 센터 안내</h2>
          <div className="center-cards">
            <Link to="/diagnosis/1" className="center-card">
              여드름
            </Link>
            <Link to="/diagnosis/2" className="center-card">
              양성 종양
            </Link>
            <Link to="/diagnosis/3" className="center-card">
              수포성 질환
            </Link>
            <Link to="/diagnosis/4" className="center-card">
              습진
            </Link>
            <Link to="/diagnosis/5" className="center-card">
              루푸스
            </Link>
            <Link to="/diagnosis/6" className="center-card">
              피부암
            </Link>
            <Link to="/diagnosis/7" className="center-card">
              백반증
            </Link>
          </div>
        </section>

      
        <section className="main-banner" style={{marginTop:"30px"}}>
          <h1>빠르고 안전한 진료, SkinSeal 병원</h1>
          <p>진료부터 수술, 그리고 진료연계까지 믿고 맡길 수 있는 병원</p>
          <button
            className="banner-btn"
            onClick={() => navigate("/reservation/consult")}
          >
            진료 예약 바로가기
          </button>
        </section>


        <section className="social-section">
          <h2>소셜채널 & 언론보도</h2>
          <div className="social-cards">
            <a href="http://www.youtube.com" className="social-card">유튜브 콘텐츠</a>
            <a href="http://www.naver.com" className="social-card">블로그 소식</a>
            <a href="http://google.com" className="social-card">언론보도</a>
          </div>
        </section>

        <section className="quick-links">
          <button onClick={() => navigate("reservation/consult")}>진료 예약</button>
          <button>의료 상담</button>
          <button onClick={() => navigate("/directions")}>오시는 길</button>
        </section>

        
      </div>
      <RightSidebar />
    </>
  );
}
export default HomePage;