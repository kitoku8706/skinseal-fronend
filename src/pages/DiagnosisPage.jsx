import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DiagnosisPage.css';

const diagnosisMenus = [
  { label: '병명 1', link: '/diagnosis/1' },
  { label: '병명 2', link: '/diagnosis/2' },
  { label: '병명 3', link: '/diagnosis/3' },
  { label: '병명 4', link: '/diagnosis/4' },
  { label: '병명 5', link: '/diagnosis/5' },
  { label: '병명 6', link: '/diagnosis/6' },
  { label: '병명 7', link: '/diagnosis/7' },
  { label: '병명 8', link: '/diagnosis/8' },
  { label: '자가 진단', link: '/self-diagnosis' },
  { label: '진단 결과', link: '/diagnosis/result' },
];

function DiagnosisPage() {
  const navigate = useNavigate();

  return (
    <div className="diagnosis-layout">
      {/* 4. 바로가기 사이드바 */}
      <aside className="diagnosis-sidebar">
        <div className="sidebar-title">바로가기</div>
        {diagnosisMenus.map(menu => (
          <button
            key={menu.label}
            className="sidebar-btn"
            onClick={() => navigate(menu.link)}
          >
            {menu.label}
          </button>
        ))}
      </aside>
      {/* 2. 컨텐츠 영역 */}
      <main className="diagnosis-content">
        <div className="content-image" />
        <div className="content-desc">
          <div>병명: OOO</div>
          <div>병 원인, 치료 방법 제시</div>
        </div>
      </main>
    </div>
  );
}

export default DiagnosisPage;