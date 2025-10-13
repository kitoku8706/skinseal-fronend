import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './NavBar.css';

function NavBar() {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [diseaseList, setDiseaseList] = useState([]);

    // [⭐ 1. useEffect 통합 및 로그인 상태 확인 로직 유지]
    useEffect(() => {
        // 1-1. 로그인 상태 확인 로직
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token); 

        // 1-2. 질환 목록 로드 로직 (기존 로직 유지)
        axios.get('/api/disease/list')
            .then(res => setDiseaseList(res.data))
            .catch(() => setDiseaseList(['병명1', '병명2', '병명3']));
    }, [navigate]); 

  const menuItems = [
    { label: "공지사항", link: "/notice" },
    {
      label: "질환 진단",
      submenu: [
        ...diseaseList.map((disease, idx) => ({
          label: disease.diseaseName,
          link: `/diagnosis/${disease.diseaseId}`,
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

    // [⭐ 2. 로그아웃 함수 유지]
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        alert('로그아웃 되었습니다.'); 
        navigate('/');
    };


    // [⭐ 3. menuItems 정의 유지]
    const menuItems = [
        { label: '공지사항', link: '/notice' },
        {
            label: '질환 진단',
            submenu: [
                // '자가 진단'과 '회사소개' 링크는 두 번째 코드에 있던 내용으로 수정하여 통합합니다.
                ...diseaseList.map((disease, idx) => ({ label: disease.diseaseName, link: `/diagnosis/${disease.diseaseId}` })),
                { label: '자가 진단', link: '/ai/diagnose' }, // 두 번째 코드의 '/ai/diagnose' 적용
                { label: '진단 결과', link: '/diagnosis/result' },
            ],
        },

        {
            label: '예약 안내',
            submenu: [
                { label: '상담 예약', link: '/reservation/consult' },
                { label: '상담 시간표', link: '/reservation/timetable' },
                { label: '예약 조회', link: '/reservation/check' },
                { label: 'AI 챗봇 간편상담', link: '/reservation/chatbot' },
            ],
        },
        {
            label: '소개',
            submenu: [
                { label: '회사소개', link: '/intro' }, // 두 번째 코드의 '/intro' 적용
                { label: '운영진', link: '/about/team' },
                { label: '오시는 길', link: '/about/location' },
            ],
        },
    ];

    // [⭐ 4. 최종 return 구문 유지]
    return (
        <nav className="main-nav">
            <div className="logo" onClick={() => navigate('/')}>로고</div>
            <ul className="nav-menu">
                {menuItems.map((item, idx) => (
                    <li
                        key={item.label}
                        className="nav-item"
                        onMouseEnter={() => setOpenMenu(idx)}
                        onMouseLeave={() => setOpenMenu(null)}
                    >
                        <span
                            onClick={() => {
                                if (item.link) navigate(item.link);
                            }}
                            style={{ cursor: item.link ? 'pointer' : 'default' }}
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
            
            <div className="nav-actions">
                {/* [⭐ 로그인/로그아웃 조건부 렌더링 유지] */}
                {isLoggedIn ? (
                    <button onClick={handleLogout}>로그아웃</button>
                ) : (
                    <>
                        <button onClick={() => navigate('/login')}>로그인</button>
                        <button onClick={() => navigate('/join')}>회원가입</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default NavBar;