import React, { useState } from 'react';
import axios from 'axios';
import './UserLoginPage.css';
import { useNavigate } from 'react-router-dom';

function UserLoginPage() {
    const navigate = useNavigate(); 
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError('아이디와 비밀번호를 모두 입력하세요.');
            return;
        }
        setError('');
        
        try {
            
            const res = await axios.post('http://localhost:8090/member/login', {
                username: username, 
                password
            });
            
            if (res.data && res.data.token) { 
                localStorage.setItem('accessToken', res.data.token);
                
                navigate('/'); 
            } else {
                setError('로그인 응답 형식이 올바르지 않습니다.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.';
            setError('로그인 실패: ' + errorMessage);
        }
    };

    return (
        <div className="login-container">
            <h2>로그인</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <input
                    type="text" 
                    placeholder="아이디" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
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