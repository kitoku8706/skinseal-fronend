import React, { useState, useEffect } from 'react';

function KakaoLoginButton({ onLogin }) {
  useEffect(() => {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init('카카오_자바스크립트_키'); // 카카오 개발자 콘솔에서 발급받은 JS 키
    }
  }, []);

  const handleKakaoLogin = () => {
    window.Kakao.Auth.login({
      success: function (authObj) {
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: function (res) {
            // res.kakao_account.email 등에서 정보 추출
            const kakaoUser = {
              email: res.kakao_account.email,
              nickname: res.properties.nickname,
              kakao_id: res.id
            };
            // 백엔드로 회원가입/로그인 요청
            fetch('http://localhost:8090/kakao-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(kakaoUser)
            })
              .then(r => r.json())
              .then(data => {
                alert(data.message);
                if (onLogin) onLogin(data);
              });
          },
          fail: function (error) {
            alert('카카오 사용자 정보 요청 실패');
          }
        });
      },
      fail: function (err) {
        alert('카카오 로그인 실패');
      }
    });
  };

  return (
    <button onClick={handleKakaoLogin} style={{ background: '#FEE500', border: 'none', padding: '10px 20px', borderRadius: '5px' }}>
      카카오로 로그인/회원가입
    </button>
  );
}

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <div>
      {/* 기존 로그인/회원가입 버튼 */}
      <button onClick={() => setShowLoginModal(true)}>로그인</button>
      <button onClick={() => setShowRegisterModal(true)}>회원가입</button>
      {/* 카카오 로그인 버튼 추가 */}
      <KakaoLoginButton />
    </div>
  );
}

export default App;