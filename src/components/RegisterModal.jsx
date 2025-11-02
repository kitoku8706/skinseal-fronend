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
      const res = await fetch('http://18.210.20.169:8090/email-check', {
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
      const res = await fetch('http://18.210.20.169:8090/register', {
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
    <div style={{ 
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)', 
      maxHeight: '90vh', 
      overflowY: 'auto',
      backgroundColor: '#fff', 
      borderRadius: '10px', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
      width: '400px',
      padding: '20px',
      zIndex: 1000
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>회원가입</h2>
      
      {/* 카카오 로그인 버튼을 맨 위로 이동 */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>간편 회원가입</p>
        <KakaoLoginButton onLogin={handleKakaoRegister} />
      </div>

      <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '20px', marginBottom: '10px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#666' }}>또는 이메일로 가입</p>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input placeholder="아이디" value={userId} onChange={e => setUserId(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        <input placeholder="비밀번호" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        <input placeholder="비밀번호 확인" type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        <input placeholder="이름" value={name} onChange={e => setName(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        <input placeholder="생년월일" value={birth} onChange={e => setBirth(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        <input placeholder="이메일" value={email} onChange={e => { setEmail(e.target.value); setEmailChecked(false); }} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        <button type="button" onClick={handleEmailCheck} style={{ backgroundColor: '#007BFF', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>중복확인</button>
        <input placeholder="전화번호" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        <button type="button" onClick={handleRegister} style={{ backgroundColor: '#4CAF50', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>회원가입</button>
      </form>

      <button onClick={onClose} style={{ marginTop: '15px', backgroundColor: '#f44336', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>취소</button>
    </div>
  );
}

export default RegisterModal;
