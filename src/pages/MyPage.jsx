import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import './MyPage.css';

function MyPage() {
    const location = useLocation(); 

    const mypageMenuItems = [
        { name: "대시보드", path: "" }, 
        { name: "회원정보 수정", path: "edit" }, 
        { name: "예약 조회", path: "reservation" },
        { name: "진단 목록", path: "diagnosis" },
        { name: "회원 탈퇴", path: "withdraw" },
    ];
    
    const getCurrentTitle = () => {
        const currentRouteSegment = location.pathname.split('/').pop();
        
        const activeItem = mypageMenuItems.find(item => item.path === currentRouteSegment);
        
        if (activeItem) {
            return activeItem.name;
        } 
        
        if (location.pathname === '/mypage' || location.pathname.endsWith('/')) {
             return "대시보드"; 
        }

        return "마이페이지"; 
    }

    return (
        <div className="mypage-container">
            <h1>마이페이지</h1>
            <div className="mypage-layout">
                <div className="mypage-sidebar">
                    {mypageMenuItems.map(item => (
                        <NavLink
                            key={item.name} 
                            to={item.path} 
                            className={({ isActive }) => 
                                `sidebar-item ${isActive ? 'active' : ''}`
                            }
                            end={item.path === ""} 
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </div>
                
                <div className="mypage-content">
                    <h2>{getCurrentTitle()}</h2>
                    
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default MyPage;