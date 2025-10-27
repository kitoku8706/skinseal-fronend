// src/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./NavBar.css"; // ✅ 이 CSS만 import

function NavBar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [diseaseList, setDiseaseList] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);

    const localUsername = localStorage.getItem("username");
    if (localUsername) setUsername(localUsername);

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

    // if (token) {
    //   axios
    //     .get("/api/user/me", {
    //       headers: { Authorization: `Bearer ${token}` },
    //     })
    //     .then((res) => {
    //       if (res.data.username) {
    //         setUsername(res.data.username);
    //         localStorage.setItem("username", res.data.username);
    //       }
    //     })
    //     .catch(() => {});
    // } else {
    //   setUsername("");
    // }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUsername("");
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

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
        { label: "AI 챗봇 간편상담", link: "/reservation/chatbot" },
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
          로고
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
