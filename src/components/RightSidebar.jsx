import React from 'react';
import { useNavigate } from 'react-router-dom';

function RightSidebar({ onOpenAIPopup }) {
  const navigate = useNavigate();

  return (
    <div className="right-sidebar">
      <button className="sidebar-btn" onClick={() => navigate('/reservation/consult')}>
        상담예약
      </button>
      <button className="sidebar-btn" onClick={() => window.open('https://pf.kakao.com/_카카오상담URL', '_blank')}>
        카톡상담
      </button>
      <button className="sidebar-btn" onClick={() => navigate('/directions')}>
        오시는길
      </button>
      <button className="sidebar-btn" onClick={onOpenAIPopup}>
        AI상담
      </button>
    </div>
  );
}

export default RightSidebar;