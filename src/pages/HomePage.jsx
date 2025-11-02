import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  pingBackend,
  getUsersFromBackend,
  getChatbotCategories,
} from "../api/testApi";
import NoticeListPage from "./NoticeListPage";
import "./HomePage.css";
import RightSidebar from "../components/RightSidebar";
import noticeBanner from "../assets/notice-banner.png";
import AcneImage from "../assets/disease/1_Acne_image.jpg";
import BenignTumorsImage from "../assets/disease/2_Benign_tumors.png";
import BullousImage from "../assets/disease/3_Bullous.png";
import EczemaImage from "../assets/disease/4_Eczema.png";
import LupusImage from "../assets/disease/5_Lupus.jpg";
import SkinCancerImage from "../assets/disease/6_SkinCancer.jpg";
import VitiligoImage from "../assets/disease/7_Vitiligo.png";

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
      {/* ✅ 공지사항 배너 + 오버레이 문구 추가 */}
      <div className="notice-banner-container">
        <img
          src={noticeBanner}
          alt="공지사항 바로가기"
          className="notice-banner"
        />

        {/* ✅ 박스 전체를 클릭 가능하게 */}
        <div
          className="notice-overlay-box"
          onClick={() => navigate("/notice")}
          style={{ cursor: "pointer" }} // ✅ 마우스 커서 변경
        >
          <strong>SKINSEAL 11월 공지사항</strong>
          <span className="notice-subtext">
            해당 베너를 클릭해 공지사항을 확인해주세요.
          </span>
        </div>
      </div>

      <div className="homepage-container">
        {/* ✅ 전문 센터 안내 (이미지 + 텍스트 카드) */}
        <section className="center-section">
          <h2>질환 진단 안내</h2>
          <div className="center-cards">
            <Link to="/diagnosis/1" className="center-card">
              <img src={AcneImage} alt="여드름" />
              <span>여드름</span>
            </Link>
            <Link to="/diagnosis/2" className="center-card">
              <img src={BenignTumorsImage} alt="양성 종양" />
              <span>양성 종양</span>
            </Link>
            <Link to="/diagnosis/3" className="center-card">
              <img src={BullousImage} alt="수포성 질환" />
              <span>수포성 질환</span>
            </Link>
            <Link to="/diagnosis/4" className="center-card">
              <img src={EczemaImage} alt="습진" />
              <span>습진</span>
            </Link>
            <Link to="/diagnosis/5" className="center-card">
              <img src={LupusImage} alt="루푸스" />
              <span>루푸스</span>
            </Link>
            <Link to="/diagnosis/6" className="center-card">
              <img src={SkinCancerImage} alt="피부암" />
              <span>피부암</span>
            </Link>
            <Link to="/diagnosis/7" className="center-card">
              <img src={VitiligoImage} alt="백반증" />
              <span>백반증</span>
            </Link>
          </div>
        </section>

        <section className="main-banner" style={{ marginTop: "30px" }}>
          <h1>정확도 90%이상의 판독, SkinSeal</h1>
          <p>진단부터 수술,진료연계까지 믿고 맡길 수 있는 스킨씰</p>
          <button
            className="banner-btn"
            onClick={() => navigate("/reservation/consult")}
          >
            상담 예약 바로가기
          </button>
        </section>

        <section className="social-section">
          <h2>소셜채널 & 언론보도</h2>
          <div className="social-cards">
            <a href="http://www.youtube.com" className="social-card">
              유튜브 콘텐츠
            </a>
            <a href="http://www.naver.com" className="social-card">
              블로그 소식
            </a>
            <a href="http://google.com" className="social-card">
              언론보도
            </a>
          </div>
        </section>

        {/* <section className="quick-links">
          <button onClick={() => navigate("reservation/consult")}>
            진료 예약
          </button>
          <button>의료 상담</button>
          <button onClick={() => navigate("/directions")}>오시는 길</button>
        </section> */}
      </div>

      <RightSidebar />
    </>
  );
}

export default HomePage;
