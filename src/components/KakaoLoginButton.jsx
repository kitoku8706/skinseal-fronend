import React, { useState, useEffect } from 'react';

function KakaoLoginButton({ onLogin }) {
  const [isKakaoReady, setIsKakaoReady] = useState(false);
  useEffect(() => {
    // Kakao SDK가 로드될 때까지 기다림
    const checkKakaoReady = () => {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          console.log('Initializing Kakao SDK...');
          const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || 'aab3ac3dc3b251ccb87e8a0f1f1532c7';
          console.log('Kakao Key:', kakaoKey);
          window.Kakao.init(kakaoKey);
          console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
        } else {
          console.log('Kakao SDK already initialized.');
        }
        setIsKakaoReady(true);
      } else {
        console.warn('Kakao SDK not loaded yet. Retrying...');
        setTimeout(checkKakaoReady, 100);
      }
    };
    
    checkKakaoReady();
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
              kakao_id: res.id,
            };
            onLogin(kakaoUser); // 로그인 성공 시 콜백 호출
          },
          fail: function (error) {
            console.error('카카오 사용자 정보 요청 실패:', error);
          },
        });
      },
      fail: function (error) {
        console.error('카카오 로그인 실패:', error);
      },
    });
  };
  console.log('KakaoLoginButton rendered. Kakao Ready:', isKakaoReady);
  
  if (!isKakaoReady) {
    return (
      <button disabled style={{ backgroundColor: '#CCCCCC', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'not-allowed', fontWeight: 'bold' }}>
        카카오 SDK 로딩중...
      </button>
    );
  }
  
  return (
    <button onClick={handleKakaoLogin} style={{ backgroundColor: '#FEE500', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
      카카오 로그인
    </button>
  );
}

export default KakaoLoginButton;