import React, { useState } from 'react';
import axios from 'axios';
import './UserJoinPage.css'; 
import { useNavigate } from 'react-router-dom';

function UserJoinPage() {
    const navigate = useNavigate();

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [name, setName] = useState('');
    const [birth, setBirth] = useState('');
    const [email, setEmail] = useState('');
    const [userIdChecked, setUserIdChecked] = useState(false);
    const [userIdCheckMsg, setUserIdCheckMsg] = useState('');
    
    
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');

    // [⭐ 추가] 아이디 중복확인 함수
    const handleIdCheck = async () => {
        if (!userId) {
            setUserIdCheckMsg('아이디를 입력하세요.');
            setUserIdChecked(false);
            return;
        }
        
        try {
            const res = await axios.post('http://localhost:8090/member/id-check', { userId });
            
            if (res.data.exists) { 
                setUserIdCheckMsg('이미 사용 중인 아이디입니다.');
                setUserIdChecked(false);
            } else {
                setUserIdCheckMsg('사용 가능한 아이디입니다.');
                setUserIdChecked(true);
            }
        } catch (err) {
            setUserIdCheckMsg('아이디 확인 중 오류 발생: ' + (err.response?.data?.message || err.message || '서버 오류'));
            setUserIdChecked(false);
        }
    };
    
    const handleEmailCheck = () => { /* 제거 */ }; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!userId || !password || !passwordConfirm || !name || !birth || !email || !phoneNumber) {
            setError('모든 항목을 입력하세요.');
            return;
        }
        
        if (!userIdChecked) {
            setError('아이디 중복확인을 해주세요.');
            return;
        }
        
        if (password !== passwordConfirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setError('');

        try {
            const reqData = {
                username: userId,
                password,
                name,
                birth,
                email,
                role: 'USER', 
                phoneNumber: phoneNumber
            };
            
            const res = await axios.post('http://localhost:8090/member/signup', reqData);
            
            alert('회원가입 성공!'); 
            navigate('/login');
            
        } catch (err) {
            setError('회원가입 실패: ' + (err.response?.data?.message || '서버 오류'));
        }
    };

    return (
        <div className="join-container">
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit} className="join-form">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={userId}
                        onChange={e => { setUserId(e.target.value); setUserIdChecked(false); setUserIdCheckMsg(''); }} 
                        style={{ flex: 1 }}
                        required
                    />
                    <button
                        type="button"
                        className="email-check-btn"
                        onClick={handleIdCheck}
                        style={{ whiteSpace: 'nowrap' }}
                        disabled={userIdChecked} 
                    >
                        아이디 중복확인
                    </button>
                </div>
                {userIdCheckMsg && 
                    <div className="email-check-msg" style={{ color: userIdChecked ? '#4CAF50' : '#D32F2F' }}>
                        {userIdCheckMsg}
                    </div>
                }
                
                <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required />
                <input type="password" placeholder="비밀번호 확인" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required />
                <input type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)} required />
                <input type="text" placeholder="생년월일 (예시: 90.09.09)" value={birth} onChange={e => setBirth(e.target.value)} required />
                
                <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                
                <input
                    type="text"
                    placeholder="전화번호"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    required
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