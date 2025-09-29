import React, { useState } from 'react';

function RegisterModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleRegister = async () => {
    try {
      const res = await fetch('http://localhost:8090/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
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
      <input
        placeholder="이메일"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        placeholder="비밀번호"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <input
        placeholder="역할 (user/admin)"
        value={role}
        onChange={e => setRole(e.target.value)}
      />
      <input
        placeholder="전화번호"
        value={phoneNumber}
        onChange={e => setPhoneNumber(e.target.value)}
      />
      <button onClick={handleRegister}>회원가입</button>
      <button onClick={onClose}>취소</button>
    </div>
  );
}

export default RegisterModal;