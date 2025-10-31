import React, { useState } from 'react';

function LoginModal({ onClose }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(''); 

    const handleLogin = async () => {
        setLoginError(''); 
        
        if (!username || !password) {
             setLoginError('아이디와 비밀번호를 모두 입력하세요.');
             return;
        }

        try {
            const res = await fetch('http://18.210.20.169:8090/member/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }) 
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                console.error('로그인 실패 응답:', data);
                setLoginError(data.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
                return; 
            }
            
            if (data.token) {
                localStorage.setItem('accessToken', data.token);
            }
            
            alert('로그인 성공!');
            
            if (onClose) onClose();
            
            window.location.reload(); 
            
        } catch (err) {
            setLoginError('네트워크 오류 또는 서버 접속 실패');
            console.error('로그인 처리 중 오류 발생:', err);
        }
    };

    return (
        <div className="modal">
            <h2>로그인</h2>
            {/* 로그인 오류 메시지 표시 */}
            {loginError && <div style={{ color: 'red', marginBottom: '10px' }}>{loginError}</div>}
            
            <input
                placeholder="아이디"
                value={username}
                onChange={e => setUsername(e.target.value)}
            />
            <input
                placeholder="비밀번호"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>로그인</button>
            <button onClick={onClose}>취소</button>
        </div>
    );
}

export default LoginModal;
