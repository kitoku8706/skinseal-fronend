import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserWithdrawal.css'; 

function UserWithdrawal() {
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleWithdrawal = async (e) => {
        e.preventDefault(); 
        setError(''); 

        if (!password) {
            setError('비밀번호를 입력해야 탈퇴할 수 있습니다.');
            return;
        }
        
        if (!isConfirmed) { 
             setError('회원 탈퇴 동의에 체크해야 합니다.');
             return;
        }

        const confirmMessage = "정말로 탈퇴하시겠습니까? 탈퇴 후 모든 정보는 복구할 수 없습니다.";
        if (!window.confirm(confirmMessage)) {
            return;
        }
        
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.");
            navigate('/login');
            return;
        }

        try {
            await axios.delete('http://18.210.20.169:8090/member/delete', {
                headers: {
                    Authorization: `Bearer ${token}`, 
                    'Content-Type': 'application/json'
                },
                data: {
                    password: password 
                }
            });

            alert('회원 탈퇴가 성공적으로 완료되었습니다. 이용해주셔서 감사합니다.');
            
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');
            localStorage.removeItem('loginId');
            localStorage.removeItem('role');
            localStorage.removeItem('userId');

            navigate('/login'); 
            window.location.reload(); 

        } catch (err) {
            console.error("회원 탈퇴 실패:", err.response ? err.response.data : err.message);
            
            const serverErrorMessage = err.response?.data 
                                     || '탈퇴 처리 중 오류가 발생했습니다. 서버 상태를 확인해주세요.';

            setError('탈퇴 실패: ' + serverErrorMessage);
        }
    };

    return (
        <div className="withdrawal-container"> 
            
            <div className="withdrawal-notice">
                <h3>회원 탈퇴 시 유의 사항</h3>
                <p>
                    탈퇴 후에는 회원님의 모든 정보 및 서비스 이용 기록이 즉시 삭제되며, 복구할 수 없습니다.<br/>
                    탈퇴를 원하시면 아래에 비밀번호를 입력하고 동의 후 탈퇴 버튼을 눌러주십시오.
                </p>
            </div>

            <form onSubmit={handleWithdrawal} style={{maxWidth: '100%'}}>
                
                <div className="info-group">
                    <label htmlFor="password-input">비밀번호 확인</label>
                    <input 
                        id="password-input"
                        type="password" 
                        placeholder="현재 비밀번호를 입력해주세요." 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                
                <div className="agreement-group"> 
                    <input 
                        type="checkbox" 
                        id="confirmWithdrawal" 
                        checked={isConfirmed} 
                        onChange={e => setIsConfirmed(e.target.checked)} 
                    />
                    <label htmlFor="confirmWithdrawal">
                        위 내용을 모두 확인했으며, 회원 탈퇴에 동의합니다.
                    </label>
                </div>
            
                {error && <div className="error-msg">{error}</div>}

                <div className="button-actions" style={{ textAlign: 'center' }}>
                    <button 
                        type="submit" 
                        className="btn-withdraw" 
                    >
                        회원 탈퇴
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UserWithdrawal;
