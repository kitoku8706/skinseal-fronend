import React, { useState } from 'react';
import axios from 'axios';
import './UserLoginPage.css';

function UserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력하세요.');
      return;
    }
    setError('');
    try {
      const res = await axios.post('/api/user/login', {
        email,
        password
      });
      if (res.data === true) {
        alert('로그인 성공!');
        // TODO: 필요 시 토큰 저장 및 리다이렉트
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('로그인 실패: ' + (err.response?.data?.message || '서버 오류'));
    }
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">로그인</button>
        {error && <div className="error-msg">{error}</div>}
      </form>
      <div className="login-links">
        <a href="/join">회원가입</a> | <a href="#">비밀번호 찾기</a>
      </div>
    </div>
  );
}

export default UserLoginPage;