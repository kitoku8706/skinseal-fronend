import React, { useState } from 'react';
import RegisterModal from './RegisterModal.jsx';

function LoginModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('http://18.210.20.169:8090/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert(data.message);
      setOpen(false);
    } catch (err) {
      alert(err.message || '로그인 실패');
    }
  };

  return (
    <div>
      <button onClick={() => setOpen(false)}>로그인</button>
      {/* 회원가입 버튼은 별도 RegisterModal에서 구현 */}
      {open && (
        <div className="modal">
          <h2>로그인</h2>
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
          <button onClick={handleLogin}>로그인</button>
          <button onClick={() => setOpen(false)}>취소</button>
        </div>
      )}
    </div>
  );
}

export default LoginModal;
