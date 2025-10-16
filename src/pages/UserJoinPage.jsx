import React, { useState } from 'react';
import axios from 'axios';
import '../styles/UserJoinPage.css'; 
import { useNavigate } from 'react-router-dom';

function UserJoinPage() {
    const navigate = useNavigate();

    const [loginId, setLoginId] = useState(''); 
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [name, setName] = useState('');
    
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    
    const [email, setEmail] = useState('');
    
    const [loginIdChecked, setLoginIdChecked] = useState(false); 
    const [loginIdCheckMsg, setLoginIdCheckMsg] = useState(''); 
    
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    
    const [isAgreed, setIsAgreed] = useState(false); 
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

    const handleIdCheck = async () => {
        if (!loginId) {
            setLoginIdCheckMsg('아이디를 입력하세요.');
            setLoginIdChecked(false);
            return;
        }

        const idRegex = /^[a-zA-Z0-9]{6,20}$/;
        if (!idRegex.test(loginId)) {
            setLoginIdCheckMsg('아이디는 영문 또는 숫자 6~20자로 입력해야 합니다.');
            setLoginIdChecked(false);
            return;
        }
        
        try {
            const res = await axios.post('http://localhost:8090/member/id-check', { loginId }); 
            
            if (res.data.exists) { 
                setLoginIdCheckMsg('이미 사용 중인 아이디입니다.');
                setLoginIdChecked(false);
            } else {
                setLoginIdCheckMsg('사용 가능한 아이디입니다. (중복 확인 완료)');
                setLoginIdChecked(true);
            }
        } catch (err) {
            setLoginIdCheckMsg('아이디 확인 중 오류 발생: ' + (err.response?.data?.message || err.message || '서버 오류'));
            setLoginIdChecked(false);
        }
    };
    
    const handlePhoneNumberChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        let formattedValue = '';

        if (value.length < 4) {
            formattedValue = value;
        } else if (value.length < 8) {
            formattedValue = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else if (value.length < 11) {
            formattedValue = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
        } else {
            formattedValue = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
        }
        
        setPhoneNumber(formattedValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const finalBirth = `${selectedYear}.${selectedMonth}.${selectedDay}`;

        if (!loginId || !password || !passwordConfirm || !name || !selectedYear || !selectedMonth || !selectedDay || !email || !phoneNumber) {
            setError('모든 항목을 입력하세요.');
            return;
        }
        
        if (!loginIdChecked) {
            setError('아이디 중복확인을 해주세요.');
            return;
        }
        
        if (password !== passwordConfirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!isAgreed) {
            setError('회원가입 시 정보 제공에 동의해주세요.');
            return;
        }
        
        setError('');

        try {
            const reqData = {
                loginId,
                password,
                username: name, 
                birth: finalBirth, 
                email,
                role: 'USER', 
                phoneNumber: phoneNumber.replace(/-/g, '') 
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
                <div className="join-form-group id-group">
                    <input
                        type="text"
                        placeholder="아이디 (6~20자, 영문)"
                        value={loginId}
                        onChange={e => { setLoginId(e.target.value); setLoginIdChecked(false); setLoginIdCheckMsg(''); }} 
                        required
                    />
                    <button
                        type="button"
                        className="id-check-btn"
                        onClick={handleIdCheck}
                        disabled={loginIdChecked} 
                    >
                        아이디 중복확인
                    </button>
                </div>
                {loginIdCheckMsg && 
                    <div className="check-msg" style={{ color: loginIdChecked ? '#4CAF50' : '#D32F2F' }}>
                        {loginIdCheckMsg}
                    </div>
                }
                
                <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required />
                <input type="password" placeholder="비밀번호 확인" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required />
                <input type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)} required /> 
                
                <div className="birth-select-group">
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} required>
                        <option value="">년</option>
                        {years.map(year => <option key={year} value={year}>{year}년</option>)}
                    </select>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} required>
                        <option value="">월</option>
                        {months.map(month => <option key={month} value={month}>{month}월</option>)}
                    </select>
                    <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} required>
                        <option value="">일</option>
                        {days.map(day => <option key={day} value={day}>{day}일</option>)}
                    </select>
                </div>

                <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                
                <input
                    type="text"
                    placeholder="전화번호 (예: 010-1234-5678)"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange} 
                    required
                    maxLength={13} 
                />
                
                <div className="agreement-group">
                    <input 
                        type="checkbox" 
                        id="agreement" 
                        checked={isAgreed} 
                        onChange={e => setIsAgreed(e.target.checked)}
                    />
                    <label htmlFor="agreement">회원가입 시 정보 제공에 동의합니다.</label>
                </div>

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