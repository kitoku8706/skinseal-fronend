import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyInfoEdit.css'; 

// 전화번호 포맷팅 유틸리티 함수
const formatPhoneNumber = (number) => {
    if (!number) return '';
    // 숫자가 아닌 모든 문자 제거
    const cleanNumber = number.replace(/\D/g, '');
    // 3-4-4 형식으로 포맷팅
    return cleanNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3').replace(/--/g, '-');
};

function MyInfoEdit() { 
    const navigate = useNavigate();
    
    // phoneNumber는 포맷팅된 문자열로 관리
    const [userInfo, setUserInfo] = useState({
        loginId: '로딩 중...',
        username: '로딩 중...',
        birth: '로딩 중...',
        phoneNumber: '', // 포맷팅된 번호
        email: '',
    });
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    
    // 사용자 정보 로드
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error("로그인 정보가 없습니다.");
            navigate('/login');
            return;
        }

        axios.get('http://localhost:8090/member/info', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            const data = response.data;
            // 로드 시 포맷팅된 번호를 상태에 저장
            const formattedPhoneNumber = formatPhoneNumber(data.phoneNumber);
            
            setUserInfo({
                loginId: data.loginId || '정보 없음',
                username: data.username || '정보 없음',
                birth: data.birth || '정보 없음',
                phoneNumber: formattedPhoneNumber,
                email: data.email || '',
            });
        })
        .catch(error => {
            console.error("사용자 정보 로드 실패:", error);
            alert("사용자 정보를 불러오는데 실패했습니다. 로그인 세션이 만료되었을 수 있습니다.");
            // 오류 발생 시에도 로그인 페이지로 이동
            navigate('/login'); 
        });
    }, [navigate]);
    
    // 전화번호 입력 핸들러: 입력된 값에서 숫자만 추출하여 포맷팅 후 상태에 저장
    const handlePhoneNumberChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, ''); // 숫자만 남김
        const formattedValue = formatPhoneNumber(rawValue);
        setUserInfo({...userInfo, phoneNumber: formattedValue});
    }

    const handleCancel = () => {
        // 취소 시 마이페이지 대시보드로 이동하도록 변경
        navigate('/mypage'); 
    }
    
    const handleSave = async () => {
        const isPasswordChangeAttempt = newPassword || currentPassword || confirmNewPassword;

        // 비밀번호 변경 시 유효성 검사
        if (isPasswordChangeAttempt) {
            if (newPassword !== confirmNewPassword) {
                alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
                return;
            }
            if (!currentPassword) {
                alert("비밀번호 변경 시 현재 비밀번호를 입력해야 합니다.");
                return;
            }
            // TODO: 새 비밀번호 강도 검사 로직 추가 (예: 최소 길이)
        }
        
        // 데이터 전송 전 하이픈 제거
        const rawPhoneNumber = userInfo.phoneNumber.replace(/-/g, '');
        
        // TODO: 전화번호/이메일 형식 유효성 검사 추가

        const token = localStorage.getItem('accessToken');
        if (!token) {
             alert('로그인 정보가 없습니다.');
             navigate('/login');
             return;
        }

        try {
            const updateData = {
                phoneNumber: rawPhoneNumber,
                email: userInfo.email,
                ...(isPasswordChangeAttempt && { currentPassword, newPassword })
            };

            await axios.put('http://localhost:8090/member/update', updateData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            alert('회원정보가 수정되었습니다.');
            
            // 저장 성공 후 비밀번호 입력 필드 초기화 (UX)
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            
            // 페이지 리로드 대신 상태만 업데이트하거나, 
            // 현재 페이지에 머무르며 변경된 정보(전화번호, 이메일)를 즉시 반영하는 것이 더 좋습니다.
            // 여기서는 간단하게 다시 정보를 불러오는 것이 아닌, 상태만 업데이트되었다고 가정하고 메시지 표시.
            // 정보 로드를 다시 하고 싶다면 navigate('/mypage/edit')를 사용하거나 useEffect를 다시 트리거
            
        } catch (error) {
            console.error("정보 수정 실패:", error.response ? error.response.data : error.message);
            
            // 에러 시 현재 비밀번호 초기화 (보안)
            setCurrentPassword('');

            let errorMessage = '서버 오류가 발생했습니다.';
            if (error.response?.data?.message) {
                 errorMessage = error.response.data.message;
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                 errorMessage = '현재 비밀번호가 일치하지 않거나 권한이 없습니다.';
            }

            alert('정보 수정 실패: ' + errorMessage);
        }
    }
    
    return (
        <div className="info-edit-form">
            {/* ... (이전과 동일한 JSX) ... */}
            <div className="info-group">
                <label>아이디</label><input type="text" value={userInfo.loginId + " (수정 불가)"} readOnly />
            </div>
            
            <div className="info-group">
                <label>이름</label><input type="text" value={userInfo.username + " (수정 불가)"} readOnly />
            </div>
            
            <div className="info-group">
                <label>생년월일</label><input type="text" value={userInfo.birth + " (수정 불가)"} readOnly />
            </div>
            
            <h3>비밀번호 변경</h3>
            <div className="info-group">
                <label>현재 비밀번호</label><input type="password" placeholder="현재 비밀번호를 입력" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div className="info-group">
                <label>새 비밀번호</label><input type="password" placeholder="새 비밀번호" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div className="info-group">
                <label>새 비밀번호 확인</label><input type="password" placeholder="새 비밀번호 확인" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
            </div>

            <div className="info-group">
                <label>전화번호</label>
                <input 
                    type="text" 
                    placeholder="예: 010-1234-5678"
                    value={userInfo.phoneNumber} 
                    onChange={handlePhoneNumberChange} // 수정된 핸들러 사용
                    maxLength={13} // 하이픈 포함 최대 길이
                />
            </div>
            <div className="info-group">
                <label>이메일</label>
                <input 
                    type="email" 
                    placeholder="이메일 주소"
                    value={userInfo.email} 
                    onChange={e => setUserInfo({...userInfo, email: e.target.value})}
                />
            </div>

            <div className="button-actions">
                <button className="btn-cancel" onClick={handleCancel}>취소</button>
                <button className="btn-save" onClick={handleSave}>저장</button>
            </div>
        </div>
    );
}

export default MyInfoEdit;