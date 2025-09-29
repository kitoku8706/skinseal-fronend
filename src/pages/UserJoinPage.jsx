import React, { useState } from 'react';
import axios from 'axios';
import './UserJoinPage.css';

function UserJoinPage() {
  // username 필드 제거
  const [email, setEmail] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailCheckMsg, setEmailCheckMsg] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  // 이메일 중복확인 (GET /api/user/check-email?email=xxx)
  const handleEmailCheck = async () => {
    if (!email) {
      setEmailCheckMsg('이메일을 입력하세요.');
      return;
    }
    try {
      const res = await axios.get(`/api/user/check-email?email=${encodeURIComponent(email)}`);
      if (res.data === true) {
        setEmailCheckMsg('이미 사용 중인 이메일입니다.');
        setEmailChecked(false);
      } else {
        setEmailCheckMsg('사용 가능한 이메일입니다.');
        setEmailChecked(true);
      }
    } catch (err) {
      setEmailCheckMsg('이메일 확인 중 오류 발생: ' + (err.response?.data?.message || err.message || '서버 오류'));
      setEmailChecked(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !passwordConfirm || !name || !phoneNumber) {
      setError('모든 항목을 입력하세요.');
      return;
    }
    if (!emailChecked) {
      setError('이메일 중복확인을 해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setError('');
    try {
      const reqData = {
        password,
        role: 'USER',
        email,
        name,
        phoneNumber
      };
      const res = await axios.post('/api/user', reqData);
      alert('회원가입 성공!');
      // TODO: 필요 시 회원가입 후 로그인/이동 처리
    } catch (err) {
      setError('회원가입 실패: ' + (err.response?.data?.message || '서버 오류'));
    }
  };

  return (
    <div className="join-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} className="join-form">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={e => { setEmail(e.target.value); setEmailChecked(false); setEmailCheckMsg(''); }}
        />
        <button type="button" className="email-check-btn" onClick={handleEmailCheck}>이메일 중복확인</button>
        {emailCheckMsg && <div className="email-check-msg">{emailCheckMsg}</div>}
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={passwordConfirm}
          onChange={e => setPasswordConfirm(e.target.value)}
        />
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="전화번호"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
        />
        <button type="submit">회원가입</button>
        {error && <div className="error-msg">{error}</div>}
      </form>
      <div className="join-links">
        <a href="/login">이미 계정이 있으신가요? 로그인</a>
      </div>
    </div>
  );
}

export default UserJoinPage;