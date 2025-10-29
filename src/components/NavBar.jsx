// src/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";

// 🚨🚨 사용자 정보를 가져오거나 토큰 유효성을 체크하는 API 엔드포인트로 변경하세요.
const CHECK_AUTH_API = "/api/user/info";

function NavBar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [diseaseList, setDiseaseList] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUsername("");
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const localUsername = localStorage.getItem("username");

    // 로컬 스토리지 기반 초기 상태 설정
    const tokenExists = !!token;
    setIsLoggedIn(tokenExists);
    if (localUsername) setUsername(localUsername);

    // ⭐️ 토큰이 로컬에 존재하는 경우, 서버에 유효성 검사를 요청 ⭐️
    if (tokenExists) {
      axios
        .get(CHECK_AUTH_API, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          // 성공적으로 인증됨 (isLoggedIn = true 유지)
        })
        .catch((error) => {
          // 401 Unauthorized 또는 기타 인증 실패 응답을 받은 경우
          if (error.response && error.response.status === 401) {
            console.log("토큰 만료 감지, 강제 로그아웃 처리");
            // 토큰을 삭제하고 UI 상태를 변경합니다.
            // navigate를 호출하면 React Hook 규칙 위반이므로, 상태만 변경하거나 handleLogout 함수를 직접 호출합니다.
            handleLogout();
          }
          // 다른 오류는 무시하고 현재 상태 유지
        });
    }

    // 기존 질병 목록 API 호출 로직
    axios
      .get("/api/disease/list")
      .then((res) => setDiseaseList(res.data))
      .catch(() =>
        setDiseaseList([
          { diseaseName: "병명1", diseaseId: 1 },
          { diseaseName: "병명2", diseaseId: 2 },
          { diseaseName: "병명3", diseaseId: 3 },
        ])
      );
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const menuItems = [
    { label: "공지사항", link: "/notice" },
    {
      label: "질환 진단",
      submenu: [
        ...(Array.isArray(diseaseList) ? diseaseList : []).map((d) => ({
          label: d.diseaseName,
          link: `/diagnosis/${d.diseaseId}`,
        })),
        { label: "자가 진단", link: "/ai/diagnose" },
        { label: "진단 결과", link: "/diagnosis/result" },
      ],
    },
    {
      label: "예약 안내",
      submenu: [
        { label: "상담 예약", link: "/reservation/consult" },
        { label: "상담 시간표", link: "/reservation/timetable" },
        { label: "예약 조회", link: "/reservation/check" },
        { label: "챗봇 간편상담", link: "/reservation/chatbot" },
      ],
    },
    {
      label: "소개",
      submenu: [
        { label: "회사소개", link: "/intro" },
        { label: "운영진", link: "/management" },
        { label: "오시는 길", link: "/directions" },
      ],
    },
  ];

  return (
    <div className="main-nav">
      <div className="nav-center">
        <span className="logo" onClick={() => navigate("/")}>
          SKINSEAL
        </span>
        <ul className="nav-menu">
          {menuItems.map((item, idx) => (
            <li
              key={item.label}
              className="nav-item"
              onMouseEnter={() => setOpenMenu(idx)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <span
                onClick={() => item.link && navigate(item.link)}
                style={{ cursor: item.link ? "pointer" : "default" }}
              >
                {item.label}
              </span>
              {item.submenu && openMenu === idx && (
                <ul className="dropdown-menu">
                  {item.submenu.map((sub) => (
                    <li
                      key={sub.label}
                      className="dropdown-item"
                      onClick={() => navigate(sub.link)}
                    >
                      {sub.label}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="nav-actions">
        {isLoggedIn ? (
          <>
            <span style={{ marginRight: 10 }}>{username}님</span>
            <button onClick={() => navigate("/mypage")}>마이페이지</button>
            <button onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/login")}>로그인</button>
            <button onClick={() => navigate("/join")}>회원가입</button>
          </>
        )}
      </div>
    </div>
  );
}

export default NavBar;
