import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pingBackend } from '../api/testApi';
import NoticeListPage from './NoticeListPage';

function HomePage() {
  const [result, setResult] = useState('');
  const navigate = useNavigate();

  // 드롭다운 상태 관리
  const [openMenu, setOpenMenu] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    pingBackend()
      .then(setResult)
      .catch((error) => {
        const errorMsg = error?.message || error?.toString() || '알 수 없는 오류';
        setResult(`연동 실패: ${errorMsg}`);
      });

    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
        localStorage.removeItem('accessToken'); 
        setIsLoggedIn(false); 
        alert('로그아웃 되었습니다.'); 
        navigate('/'); 
    };

  // 메뉴 항목 정의
  const menuItems = [
    {
      label: '공지사항',
      link: '/notice',
    },
    {
      label: '질환 진단',
      submenu: [
        { label: '병명 1', link: '/diagnosis/1' },
        { label: '병명 2', link: '/diagnosis/2' },
        { label: '병명 3', link: '/diagnosis/3' },
        { label: '병명 4', link: '/diagnosis/4' },
        { label: '병명 5', link: '/diagnosis/5' },
        { label: '병명 6', link: '/diagnosis/6' },
        { label: '병명 7', link: '/diagnosis/7' },
        { label: '병명 8', link: '/diagnosis/8' },
        { label: '자가 진단', link: '/self-diagnosis' },
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
        { label: '회사소개', link: '/about/company' },
        { label: '운영진', link: '/about/team' },
        { label: '오시는 길', link: '/about/location' },
      ],
    },
  ];

  return (
    <div className="homepage-container">
      {/* 상단 네비게이션 */}
      <nav className="main-nav">
        <div className="logo">SkinSeal 병원</div>
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
                  {item.submenu.map((sub, subIdx) => (
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
                        <button onClick={handleLogout}>로그아웃</button>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')}>로그인</button>
                            <button onClick={() => navigate('/join')}>회원가입</button>
                        </>
                    )}
                </div>
      </nav>

      {/* 메인 배너 */}
      <section className="main-banner">
        <h1>빠르고 안전한 진료, SkinSeal 병원</h1>
        <p>진료부터 수술, 그리고 진료연계까지 믿고 맡길 수 있는 병원</p>
        <button className="banner-btn">진료 예약 바로가기</button>
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

      {/* 공지사항 */}
      <section className="review-section">
        <h2>공지사항</h2>
        <div>
          <NoticeListPage />
        </div>
      </section>

      {/* 빠른 예약/상담/오시는 길 등 바로가기 */}
      <section className="quick-links">
        <button>진료 예약</button>
        <button>의료 상담</button>
        <button>오시는 길</button>
      </section>

      {/* 하단 푸터 */}
      <footer className="main-footer">
        <div>이용약관 | 개인정보처리방침 | 채용정보</div>
        <div>서울특별시 성북구 동소문로 47길 8 | 대표번호 1599-0033</div>
        <div>Copyright © 2025 SkinSeal Hospital. All Rights reserved.</div>
      </footer>
    </div>
  );
}
export default HomePage;