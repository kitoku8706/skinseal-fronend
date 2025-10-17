import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/DiagnosisPage.css';

import AcneImage from '../assets/disease/1_Acne_image.jpg';
import BenignTumorsImage from '../assets/disease/2_Benign_tumors.png'
import BullousImage from '../assets/disease/3_Bullous.png'
import EczemaImage from '../assets/disease/4_Eczema.png'
import LupusImage from '../assets/disease/5_Lupus.jpg'
import SkinCancerImage from '../assets/disease/6_SkinCancer.jpg'
import VitiligoImage from '../assets/disease/7_Vitiligo.png'


const staticMenus = [
  { label: '자가 진단', link: '/ai/diagnose' },
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

  const getDiseaseImage = (diseaseId) => {
    switch (diseaseId) {
    case 1: 
      return AcneImage;
    case 2:
      return BenignTumorsImage;
    case 3:
      return BullousImage;
    case 4: 
      return EczemaImage;
    case 5:
      return LupusImage;
    case 6:
      return SkinCancerImage;
    case 7:
      return VitiligoImage;
    default:
    return null; 
    }
    };
  return (
    <div className="diagnosis-layout">
      <aside className="diagnosis-sidebar">
        <div className="sidebar-title">바로가기</div>
        {diseaseList.map((disease) => (
          <button
            key={disease.diseaseId}
            className={`sidebar-btn ${selected === disease.diseaseId ? 'active' : ''}`}
            onClick={() => navigate(`/diagnosis/${disease.diseaseId}`)}
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
        {selected && ( 
          <img 
          src={getDiseaseImage(selected)} 
          alt={diseaseInfo?.diseaseName + " 이미지"} 
          className="content-image" 
          />
        )}
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