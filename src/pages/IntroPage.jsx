import React, { useState, useEffect } from "react";
import "./IntroPage.css"; // 해당 페이지 전용 CSS

const IntroPage = () => {
  const [introData, setIntroData] = useState(null); // 회사소개 데이터를 저장할 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  // 백엔드 API의 기본 URL
  // --- 이 부분 추가/수정: API_URL을 절대 경로로 지정했습니다. ---
  const API_URL = "http://localhost:8090/api/intro";

  useEffect(() => {
    const fetchIntroData = async () => {
      try {
        // 모든 회사소개 항목을 가져오는 API (getAllIntros) 호출
        const response = await fetch(API_URL); // GET 요청 (기본값)

        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        }

        const data = await response.json();

        // --- 이 부분 추가/수정: 백엔드에서 받은 데이터 처리 로직입니다. ---
        // 백엔드에서 `List<IntroDTO>` 형태로 데이터를 받으므로,
        // 이 리스트 중에서 "회사소개"에 해당하는 데이터를 찾아야 합니다.
        if (data && data.length > 0) {
          const companyIntro = data.find(
            (item) => item.menuType === "회사소개"
          ); // "회사소개" 타입의 데이터 찾기
          if (companyIntro) {
            // 백엔드 DTO 필드명에 맞춰서 데이터 설정
            setIntroData(companyIntro);
          } else {
            // "회사소개" 타입 데이터가 없을 경우 기본 메시지
            setIntroData({
              greeting: "정보 없음", // DTO 필드명에 맞춤
              location: "아직 등록된 회사소개 내용이 없습니다.", // DTO 필드명에 맞춤
              menuType: "회사소개",
            });
          }
        } else {
          // 데이터 자체가 없을 경우 기본 메시지
          setIntroData({
            greeting: "정보 없음", // DTO 필드명에 맞춤
            location: "아직 등록된 회사소개 내용이 없습니다.", // DTO 필드명에 맞춤
            menuType: "회사소개",
          });
        }
        // --- 추가/수정된 부분 끝 ---
      } catch (e) {
        console.error("회사소개 데이터를 가져오는 중 오류 발생:", e);
        setError(
          "회사소개 정보를 불러오지 못했습니다. 서버 상태를 확인해주세요."
        );
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    fetchIntroData();
  }, []); // 컴포넌트가 처음 마운트될 때만 실행

  // 로딩 중일 때 표시할 내용
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

  // 오류 발생 시 표시할 내용
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

  // 모든 준비가 되면 실제 내용 표시
  return (
    <div className="company-intro-container">
      {/* 페이지 제목 */}
      {/* --- 이 부분 수정: introData의 menuType을 사용하거나 기본값 "회사소개" 표시 --- */}
      <h1 className="company-title">{introData?.menuType || "회사소개"}</h1>

      {/* 소개 박스 */}
      <div className="company-box">
        {/* --- 이 부분 수정: 백엔드 DTO 필드명(greeting, location)에 맞춰 사용 --- */}
        <h2 className="company-subtitle">
          {introData?.greeting || "제목 없음"}
        </h2>
        <p className="company-content">{introData?.location || "내용 없음"}</p>
        {/*
          만약 백엔드 엔티티에 `createdAt`, `authorId` 같은 필드가 추가되었다면
          여기서 `introData.createdAt` 등으로 접근하여 표시할 수 있습니다.
        */}
      </div>

      {/* 대현님께서 스토리보드에서 언급하신 관리자 수정 버튼은 아래와 같이 추가될 수 있습니다. */}
      {/* <button className="edit-button">수정</button> */}
    </div>
  );
};

export default IntroPage;
