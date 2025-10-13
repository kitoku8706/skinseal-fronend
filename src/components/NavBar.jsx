// NavBar.jsx (통합 및 수정된 최종 코드)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// 필요한 다른 import (setUsername, setIsLoggedIn, setDiseaseList 등 상태 관리 함수는 컴포넌트 내부나 상위에서 정의되었다고 가정)

function NavBar({ setUsername, setIsLoggedIn, setDiseaseList, username, isLoggedIn, diseaseList, setOpenMenu, openMenu }) {
    const navigate = useNavigate();
    // const [username, setUsername] = useState(''); // 상태 관리는 상위에서 이루어지는 경우가 많으므로 주석 처리

    useEffect(() => {
        // 1. 로그인 상태 확인 및 localUsername 폴백 세팅
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);

        const localUsername = localStorage.getItem('username');
        if (localUsername) setUsername(localUsername);

        // 2. 질환 리스트 불러오기 (비동기)
        axios.get('/api/disease/list')
            .then(res => setDiseaseList(res.data))
            .catch(() => setDiseaseList([
                { diseaseName: '병명1', diseaseId: 1 }, 
                { diseaseName: '병명2', diseaseId: 2 }, 
                { diseaseName: '병명3', diseaseId: 3 }
            ])); // Fallback: 병명과 ID를 객체 형태로 맞춤

        // 3. 토큰이 있을 경우 DB에서 최신 유저 정보 요청 (localUsername을 덮어씀)
        if (token) {
            axios.get('/api/user/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    if (res.data.username) {
                        setUsername(res.data.username);
                        localStorage.setItem('username', res.data.username); // DB 값으로 localstorage 동기화
                    }
                })
                .catch(() => {
                    // API 실패 시 토큰이 만료되었을 수 있으므로 로그아웃 처리 고려 가능 (선택 사항)
                    // console.error("사용자 정보 로드 실패");
                });
        } else {
            // 토큰이 없으면 username 상태 초기화
            setUsername('');
        }
    }, []); // 초기 로드 시 1회만 실행

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username'); // username도 삭제
        setIsLoggedIn(false);
        setUsername('');
        alert('로그아웃 되었습니다.');
        navigate('/'); // 새로고침 대신 React Router의 navigate 사용
    };

    const menuItems = [
        { label: '공지사항', link: '/notice' },
        {
            label: '질환 진단',
            submenu: [
                // 질환 리스트 매핑
                ...diseaseList.map((disease) => ({
                    label: disease.diseaseName,
                    link: `/diagnosis/${disease.diseaseId}`
                })),
                { label: '자가 진단', link: '/ai/diagnose' },
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
                // kcm 블록의 경로 기준으로 통일
                { label: '회사소개', link: '/about/company' },
                { label: '운영진', link: '/about/team' },
                { label: '오시는 길', link: '/about/location' },
            ],
        },
    ];

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
                {isLoggedIn ? (
                    <>
                        <span style={{ marginRight: 10 }}>{username}님</span>
                        {/* 마이페이지 버튼은 두 번째 블록에 있어 추가합니다. */}
                        <button onClick={() => navigate('/mypage')}>마이페이지</button> 
                        <button onClick={handleLogout}>로그아웃</button>
                    </>
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

// export default NavBar;