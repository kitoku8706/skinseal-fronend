import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/DiagnosisPage.css';

const staticMenus = [
  { label: '자가 진단', link: '/self-diagnosis' },
  { label: '진단 결과', link: '/diagnosis/result' },
];

function DiagnosisPage() {
  const [diseaseList, setDiseaseList] = useState([]); // [{diseaseId, diseaseName, ...}]
  const [selected, setSelected] = useState(null); // diseaseId
  const [diseaseInfo, setDiseaseInfo] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // 병명 목록 불러오기 (최초 1회)
  useEffect(() => {
    axios.get('/api/disease/list')
      .then(res => {
        setDiseaseList(res.data);
        // URL 파라미터(id)가 있으면 해당 질병 선택, 없으면 첫번째
        if (res.data.length > 0) {
          if (id) {
            const found = res.data.find(d => String(d.diseaseId) === String(id));
            setSelected(found ? found.diseaseId : res.data[0].diseaseId);
          } else {
            setSelected(res.data[0].diseaseId);
          }
        }
      })
      .catch(() => {
        // 예시 데이터 (실패 시)
        const example = [
          { diseaseId: 1, diseaseName: '병명1' },
          { diseaseId: 2, diseaseName: '병명2' }
        ];
        setDiseaseList(example);
        setSelected(example[0].diseaseId);
      });
  }, [id]);

  // 선택된 병명 정보 불러오기
  useEffect(() => {
    if (!selected) return;
    axios.get(`/api/disease/${selected}`)
      .then(res => setDiseaseInfo(res.data))
      .catch(() => setDiseaseInfo({
  diseaseName: '정보 없음',
  description: '',
  symptoms: '',
  causes: ''
      }));
  }, [selected]);

  return (
    <div className="diagnosis-layout">
      {/* 4. 바로가기 사이드바 */}
      <aside className="diagnosis-sidebar">
        <div className="sidebar-title">바로가기</div>
        {/* DB에서 불러온 병명 목록으로 바로가기 버튼 생성 */}
        {diseaseList.map((disease) => (
          <button
            key={disease.diseaseId}
            className="sidebar-btn"
            onClick={() => navigate(`/diagnosis/${disease.diseaseId}`)}
            style={{ fontWeight: selected === disease.diseaseId ? 'bold' : 'normal' }}
          >
            {disease.diseaseName}
          </button>
        ))}
        {/* 고정 메뉴 */}
        {staticMenus.map(menu => (
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
        {/* <div className="content-image" /> */}
        <img 
          src={diseaseInfo?.imageUrl} 
          alt={diseaseInfo?.diseaseName + " 이미지"} 
          className="content-image" 
          />
        <div className="content-desc">
          <div style={{ fontWeight: 'bold', fontSize: 20 }}>
            {diseaseInfo?.diseaseName || '병명'}
          </div>
          <div style={{ marginTop: 10 }}>
            <b>설명:</b> {diseaseInfo?.description}
          </div>
          <div style={{ marginTop: 10 }}>
            <b>주요 증상:</b> {diseaseInfo?.symptoms}
          </div>
          <div style={{ marginTop: 10 }}>
            <b>원인:</b> {diseaseInfo?.causes}
          </div>
        </div>
      </main>
      {/* 오른쪽 드롭박스(질병 선택) 영역 제거 */}
    </div>
  );
}

export default DiagnosisPage;