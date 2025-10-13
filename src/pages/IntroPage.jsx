import React, { useState, useEffect } from "react";
import "./IntroPage.css"; // 해당 페이지 전용 CSS

const IntroPage = () => {
  const [introData, setIntroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:8090/api/intro";

  useEffect(() => {
    const fetchIntroData = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
          const companyIntro = data.find(
            (item) => item.menuType === "회사소개"
          );
          if (companyIntro) {
            setIntroData(companyIntro);
          } else {
            setIntroData({
              greeting: "버전 1. [전문적이고 신뢰감 있는 의료기업형]",
              location:
                "AI로 피부 진단의 새로운 기준을 만듭니다.\n\n저희 피부씰(PIBUSEAL)은 인공지능(AI) 기술을 통해 피부 질환의 진단 과정을 혁신하는 헬스케어 스타트업입니다.\nAI 모델을 기반으로 한 피부 이미지 분석 시스템을 개발하여, 누구나 간편하게 피부 상태를 확인하고 조기 진단에 도움을 받을 수 있도록 합니다.\n\n의료 전문성과 데이터 기술력을 결합하여, 정확하고 신뢰할 수 있는 AI 진단 서비스를 제공하고자 합니다.\n피부질환의 조기 발견과 예방을 통해, 더 많은 사람들이 건강한 피부로 자신감을 되찾을 수 있도록 돕겠습니다.\n\n<strong>피부씰 — 피부 건강의 미래를 AI로 새기다.</strong>",
              menuType: "회사소개",
            });
          }
        } else {
          setIntroData({
            greeting: "버전 1. [전문적이고 신뢰감 있는 의료기업형]",
            location:
              "AI로 피부 진단의 새로운 기준을 만듭니다.\n\n저희 피부씰(PIBUSEAL)은 인공지능(AI) 기술을 통해 피부 질환의 진단 과정을 혁신하는 헬스케어 스타트업입니다.\nAI 모델을 기반으로 한 피부 이미지 분석 시스템을 개발하여, 누구나 간편하게 피부 상태를 확인하고 조기 진단에 도움을 받을 수 있도록 합니다.\n\n의료 전문성과 데이터 기술력을 결합하여, 정확하고 신뢰할 수 있는 AI 진단 서비스를 제공하고자 합니다.\n피부질환의 조기 발견과 예방을 통해, 더 많은 사람들이 건강한 피부로 자신감을 되찾을 수 있도록 돕겠습니다.\n\n<strong>피부씰 — 피부 건강의 미래를 AI로 새기다.</strong>",
            menuType: "회사소개",
          });
        }
      } catch (e) {
        console.error("회사소개 데이터를 가져오는 중 오류 발생:", e);
        setError(
          "회사소개 정보를 불러오지 못했습니다. 서버 상태를 확인해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchIntroData();
  }, []);

  if (loading) {
    return (
      <div className="company-intro-container">
        <h1 className="company-title">회사소개</h1>
        <div className="company-box">
          <p className="company-content">데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-intro-container">
        <h1 className="company-title">회사소개</h1>
        <div className="company-box">
          <p className="company-content" style={{ color: "red" }}>
            오류: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="company-intro-container">
      <h1 className="company-title">{introData?.menuType || "회사소개"}</h1>

      {/* 소개 박스 */}
      <div className="company-box">
        <h2 className="company-subtitle">
          {introData?.greeting || "제목 없음"}
        </h2>
        <p
          className="company-content"
          dangerouslySetInnerHTML={{
            __html: introData?.location || "내용 없음",
          }}
        ></p>
      </div>

      {/* 대현님께서 스토리보드에서 언급하신 관리자 수정 버튼은 아래와 같이 추가될 수 있습니다. */}
      {/* <button className="edit-button">수정</button> */}
    </div>
  );
};

export default IntroPage;
