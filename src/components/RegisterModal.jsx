import React, { useState } from 'react';

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

  return (
    <div className="modal">
      <h2>회원가입</h2>
      <input placeholder="아이디" value={userId} onChange={e => setUserId(e.target.value)} />
      <input placeholder="비밀번호" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <input placeholder="비밀번호 확인" type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
      <input placeholder="이름" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="생년월일 (예시: 90.09.09)" value={birth} onChange={e => setBirth(e.target.value)} />
      <input placeholder="이메일" value={email} onChange={e => { setEmail(e.target.value); setEmailChecked(false); }} />
      <button type="button" onClick={handleEmailCheck}>중복확인</button>
      <input placeholder="역할 (user/admin)" value={role} onChange={e => setRole(e.target.value)} />
      <input placeholder="전화번호" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
      <button onClick={handleRegister}>회원가입</button>
      <button onClick={onClose}>취소</button>
    </div>
  );
}

export default RegisterModal;