import React, { useState } from 'react';
import KakaoLoginButton from './KakaoLoginButton';

function RegisterModal({ onClose }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);

  // 이메일 중복확인
  const handleEmailCheck = async () => {
    try {
      const res = await fetch('http://localhost:8090/email-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.exists) {
        alert('이미 등록된 이메일입니다.');
        setEmailChecked(false);
      } else {
        alert('사용 가능한 이메일입니다.');
        setEmailChecked(true);
      }
    } catch (err) {
      alert('이메일 확인 실패');
      setEmailChecked(false);
    }
  };

  const handleRegister = async () => {
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!emailChecked) {
      alert('이메일 중복확인을 해주세요.');
      return;
    }
    try {
      const res = await fetch('http://localhost:8090/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          password,
          name,
          birth,
          email,
          role,
          phone_number: phoneNumber
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert(data.message);
      if (onClose) onClose();
    } catch (err) {
      alert(err.message || '회원가입 실패');
    }
  };

  const handleKakaoRegister = (kakaoUser) => {
    setEmail(kakaoUser.email);
    setName(kakaoUser.nickname);
    // 추가적으로 필요한 정보를 설정할 수 있습니다.
  };

  return (
    <div className="modal" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: '400px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>회원가입</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input placeholder="아이디" value={userId} onChange={e => setUserId(e.target.value)} />
        <input placeholder="비밀번호" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <input placeholder="비밀번호 확인" type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
        <input placeholder="이름" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="생년월일" value={birth} onChange={e => setBirth(e.target.value)} />
        <input placeholder="이메일" value={email} onChange={e => { setEmail(e.target.value); setEmailChecked(false); }} />
        <button type="button" onClick={handleEmailCheck} style={{ backgroundColor: '#007BFF', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>중복확인</button>
        <input placeholder="전화번호" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
        <button onClick={handleRegister} style={{ backgroundColor: '#4CAF50', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>회원가입</button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>다른 방법으로 회원가입</p>
        <div className="login-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <KakaoLoginButton onLogin={handleKakaoRegister} />
          <button style={{ backgroundColor: '#DB4437', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Google로 계속 진행</button>
          <button style={{ backgroundColor: '#4267B2', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Facebook으로 계속 진행</button>
        </div>
      </div>

      <button onClick={onClose} style={{ marginTop: '10px', backgroundColor: '#f44336', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>취소</button>
    </div>
  );
}

export default RegisterModal;