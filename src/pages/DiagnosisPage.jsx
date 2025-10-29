// src/pages/DiagnosisPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/DiagnosisPage.css";

import AcneImage from "../assets/disease/1_Acne_image.jpg";
import BenignTumorsImage from "../assets/disease/2_Benign_tumors.png";
import BullousImage from "../assets/disease/3_Bullous.png";
import EczemaImage from "../assets/disease/4_Eczema.png";
import LupusImage from "../assets/disease/5_Lupus.jpg";
import SkinCancerImage from "../assets/disease/6_SkinCancer.jpg";
import VitiligoImage from "../assets/disease/7_Vitiligo.png";

function DiagnosisPage() {
  const [selected, setSelected] = useState(null);
  const [diseaseInfo, setDiseaseInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) setSelected(parseInt(id));
    else {
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
    axios
      .get(`/api/disease/${selected}`)
      .then((res) => setDiseaseInfo(res.data))
      .catch((error) => {
        console.error("질병 정보 로드 실패:", error);
        setDiseaseInfo(null);
      })
      .finally(() => setLoading(false));
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

  if (loading) return <div className="content-desc">로딩 중...</div>;
  if (!diseaseInfo)
    return (
      <div className="content-desc">사이드바에서 질병을 선택해주세요.</div>
    );

  return (
    <div className="diagnosis-page">
      {/* ✅ 이미지 */}
      <img
        src={getDiseaseImage(selected)}
        alt={diseaseInfo.diseaseName || "질병 이미지"}
        className="content-image"
        onError={(e) => (e.target.style.display = "none")}
      />

      {/* ✅ 얇은 회색 구분선 */}
      {/* <hr className="image-divider" /> */}
      <hr className="content-divider" />

      {/* ✅ 질병 설명 */}
      <div className="content-desc">
        <div className="disease-name">{diseaseInfo.diseaseName}</div>

        <div className="desc-item">
          <span className="desc-title">설명</span>
          <span className="desc-text">
            {diseaseInfo.description || "정보가 없습니다."}
          </span>
        </div>

        <div className="desc-item">
          <span className="desc-title">주요 증상</span>
          <span className="desc-text">
            {diseaseInfo.symptoms || "정보가 없습니다."}
          </span>
        </div>

        <div className="desc-item">
          <span className="desc-title">원인</span>
          <span className="desc-text">
            {diseaseInfo.causes || "정보가 없습니다."}
          </span>
        </div>
      </div>
      <hr className="content-divider-bottom" />

      {/* ✅ 자가진단 이동 버튼 */}
      <button
        className="diagnosis-btn"
        onClick={() => navigate("/ai/diagnose")}
      >
        자가 진단 이동
      </button>
    </div>
  );
}

export default DiagnosisPage;
