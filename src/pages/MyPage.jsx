import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import './MyPage.css'; 

const MyInfoEdit = ({ navigate }) => { 
    
    const [userInfo, setUserInfo] = useState({
        loginId: '로딩 중...', 
        username: '로딩 중...', 
        birth: '로딩 중...', 
        phoneNumber: '',
        email: '',
    });
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    
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
            setUserInfo({
                loginId: data.loginId || '정보 없음',
                username: data.username || '정보 없음',
                birth: data.birth || '정보 없음',
                phoneNumber: data.phoneNumber || '',
                email: data.email || '',
            });
        })
        .catch(error => {
            console.error("사용자 정보 로드 실패:", error);
            alert("사용자 정보를 불러오는데 실패했습니다. 로그인 세션이 만료되었을 수 있습니다.");
            navigate('/login'); 
        });
    }, [navigate]); 

    const handleCancel = () => {
        navigate('/'); 
    }
    
    const handleSave = async () => {
        if (newPassword || currentPassword || confirmNewPassword) {
            if (newPassword !== confirmNewPassword) {
                alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
                return;
            }
            if (!currentPassword) {
                alert("비밀번호 변경 시 현재 비밀번호를 입력해야 합니다.");
                return;
            }
        }

        const token = localStorage.getItem('accessToken');
        try {
            const updateData = {
                phoneNumber: userInfo.phoneNumber,
                email: userInfo.email,
                ...(newPassword && { currentPassword, newPassword }) 
            };

            await axios.put('http://localhost:8090/member/update', updateData, { 
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            alert('회원정보가 수정되었습니다.'); 
            navigate('/mypage/edit'); 
            
        } catch (error) {
            console.error("정보 수정 실패:", error.response ? error.response.data : error.message);
            alert('정보 수정 실패: ' + (error.response?.data?.message || '서버 오류'));
        }
    }
    
    return (
        <div className="info-edit-form">
            <div className="info-group">
                <label>아이디</label><input type="text" value={userInfo.loginId + "(수정 불가)"} readOnly />
            </div>
            
            <div className="info-group">
                <label>이름</label><input type="text" value={userInfo.username + "(수정 불가)"} readOnly />
            </div>
            
            <div className="info-group">
                <label>생년월일</label><input type="text" value={userInfo.birth + "(수정 불가)"} readOnly />
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
                    value={userInfo.phoneNumber} 
                    onChange={e => setUserInfo({...userInfo, phoneNumber: e.target.value})}
                />
            </div>
            <div className="info-group">
                <label>이메일</label>
                <input 
                    type="email" 
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


function MyPage() {
    const navigate = useNavigate(); 

    const mypageMenuItems = [
        { name: "마이페이지", path: "/mypage" },
        { name: "회원정보 수정", path: "/mypage/edit" }, 
        { name: "예약 조회", path: "/mypage/reservation" },
        { name: "진단 목록", path: "/mypage/diagnosis" },
        { name: "회원 탈퇴", path: "/mypage/withdraw" },
    ];

    return (
        <div className="mypage-container">
            <h1>피부질환</h1>
            <div className="mypage-layout">
                <div className="mypage-sidebar">
                    {mypageMenuItems.map(item => (
                        <div 
                            key={item.name} 
                            className="sidebar-item"
                            onClick={() => navigate(item.path)} 
                        >
                            {item.name}
                        </div>
                    ))}
                </div>
                
                <div className="mypage-content">
                    <h2>회원정보 수정</h2>
                    <MyInfoEdit navigate={navigate} /> 
                </div>
            </div>
        </div>
    );
}

export default MyPage;