import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './NavBar.css';

function NavBar() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [diseaseList, setDiseaseList] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // 질환 리스트 불러오기
    axios.get('/api/disease/list')
      .then(res => setDiseaseList(res.data))
      .catch(() => setDiseaseList(['병명1', '병명2', '병명3'])); // 예시 fallback

    // 로그인 상태 및 유저 정보 불러오기
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);

    // localStorage에서 username 먼저 세팅
    const localUsername = localStorage.getItem('username');
    if (localUsername) setUsername(localUsername);

    if (token) {
      // 토큰이 있으면 DB에서 유저 정보 요청
      axios.get('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (res.data.username) {
            setUsername(res.data.username);
            localStorage.setItem('username', res.data.username); // 동기화
          }
        })
        .catch(() => {});
    } else {
      setUsername('');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setUsername('');
    alert('로그아웃 되었습니다.');
    window.location.href = '/'; // 새로고침
  };

  const menuItems = [
    { label: '공지사항', link: '/notice' },
    {
      label: '질환 진단',
      submenu: [
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
export default NavBar;