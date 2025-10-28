import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
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
    const [selected, setSelected] = useState(null); 
    const [diseaseInfo, setDiseaseInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            setSelected(parseInt(id));
        } else {
            setSelected(null); 
            setDiseaseInfo(null); 
        }
    }, [id]);

    useEffect(() => {
        if (!selected) {
            setDiseaseInfo(null); 
            return;
        }
        setLoading(true);
        setDiseaseInfo(null); 

        axios.get(`/api/disease/${selected}`)
            .then(res => {
                setDiseaseInfo(res.data);
            })
            .catch((error) => {
                console.error("질병 정보 로드 실패:", error);
                setDiseaseInfo(null); 
            })
            .finally(() => {
                setLoading(false);
            });
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
    
    if (loading) {
        return <div className="content-desc">로딩 중...</div>;
    }

    if (!diseaseInfo) {
        return <div className="content-desc">사이드바에서 질병을 선택해주세요.</div>;
    }

    return (
        <>
            <img 
                src={getDiseaseImage(selected)} 
                alt={diseaseInfo.diseaseName ? `${diseaseInfo.diseaseName} 이미지` : "질병 이미지"} 
                className="content-image" 
                onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="content-desc">
                <div style={{ fontWeight: 'bold', fontSize: 20 }}>
                    {diseaseInfo.diseaseName || '알 수 없는 병명'}
                </div>
                <div style={{ marginTop: 10 }}>
                    <b>설명:</b> {diseaseInfo.description || '정보가 없습니다.'}
                </div>
                <div style={{ marginTop: 10 }}>
                    <b>주요 증상:</b> {diseaseInfo.symptoms || '정보가 없습니다.'}
                </div>
                <div style={{ marginTop: 10 }}>
                    <b>원인:</b> {diseaseInfo.causes || '정보가 없습니다.'}
                </div>
            </div>
        </>
    );
}

export default DiagnosisPage;