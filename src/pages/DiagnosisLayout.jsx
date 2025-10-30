import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./DiagnosisLayout.css";
const staticMenus = [
  { label: "자가 진단", link: "/ai/diagnose" },
  { label: "진단 결과", link: "/diagnosis/result" },
];

function DiagnosisLayout({ children }) {
  const [diseaseList, setDiseaseList] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios
      .get("/api/disease/list")
      .then((res) => {
        setDiseaseList(res.data);
      })
      .catch(() => {
        const example = [
          { diseaseId: 1, diseaseName: "병명1" },
          { diseaseId: 2, diseaseName: "병명2" },
        ];
        setDiseaseList(example);
      });
  }, []);

  const getIsActive = (link, diseaseId) => {
    const currentPath = location.pathname;
    if (link) {
      return currentPath === link;
    }
    if (diseaseId) {
      const match = currentPath.match(/\/diagnosis\/(\d+)/);
      return match && String(match[1]) === String(diseaseId);
    }
    return false;
  };

  return (
    <div className="diagnosis-layout">
      <aside className="diagnosis-sidebar">
        <div className="sidebar-title">바로가기</div>

        {diseaseList.map((disease) => (
          <button
            key={disease.diseaseId}
            className={`sidebar-btn ${
              getIsActive(null, disease.diseaseId) ? "active" : ""
            }`}
            onClick={() => navigate(`/diagnosis/${disease.diseaseId}`)}
          >
            {disease.diseaseName}
          </button>
        ))}

        {staticMenus.map((menu) => (
          <button
            key={menu.label}
            className={`sidebar-btn ${getIsActive(menu.link) ? "active" : ""}`}
            onClick={() => navigate(menu.link)}
          >
            {menu.label}
          </button>
        ))}
      </aside>

      <main className="diagnosis-content">{children}</main>
    </div>
  );
}

export default DiagnosisLayout;
