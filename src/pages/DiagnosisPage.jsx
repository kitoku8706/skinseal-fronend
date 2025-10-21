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
    // diseaseList와 관련된 상태/로직 제거
    const [selected, setSelected] = useState(null); // diseaseId
    const [diseaseInfo, setDiseaseInfo] = useState(null);
    const { id } = useParams();

    // URL 파라미터(id)가 변경될 때 selected 업데이트
    useEffect(() => {
        if (id) {
            setSelected(parseInt(id));
        } else {
            // 초기 진입 시 기본값 설정 (만약 URL이 /diagnosis/1처럼 ID를 포함하지 않을 경우를 대비하여 ID가 필요함.
            // Layout에서 목록을 불러오므로, 여기서는 id가 없을 경우 selected를 null로 둠)
            setSelected(null); 
        }
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
    
    // 사이드바 마크업 제거, 메인 콘텐츠 영역만 남김
    return (
        <>
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
        </>
    );
}

export default DiagnosisPage;