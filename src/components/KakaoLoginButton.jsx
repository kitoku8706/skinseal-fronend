import React, { useState, useEffect } from 'react';

function KakaoLoginButton({ onLogin }) {
  useEffect(() => {
    if (!window.Kakao.isInitialized()) {
      console.log('Initializing Kakao SDK...');
      window.Kakao.init(process.env.REACT_APP_KAKAO_JS_KEY); // Kakao JavaScript 키 설정
      console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
    } else {
      console.log('Kakao SDK already initialized.');
    }
  }, []);

  const handleKakaoLogin = () => {
    window.Kakao.Auth.login({
      success: function (authObj) {
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: function (res) {
            const kakaoUser = {
              email: res.kakao_account.email,
              nickname: res.properties.nickname,
              kakao_id: res.id
            };
            onLogin(kakaoUser); // 로그인 성공 시 콜백 호출
          },
          fail: function (error) {
            console.error('카카오 사용자 정보 요청 실패:', error);
          }
        });
      },
      fail: function (error) {
        console.error('카카오 로그인 실패:', error);
      }
    });
  };

  return (
    <button onClick={handleKakaoLogin} style={{ backgroundColor: '#FEE500', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
      카카오 로그인
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