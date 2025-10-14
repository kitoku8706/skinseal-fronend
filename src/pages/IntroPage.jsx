import React, { useState, useEffect } from "react";
import "./IntroPage.css";

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

        // API에서 배열로 받은 데이터 중 '회사소개' 메뉴만 찾아서 저장
        const companyIntro = data.find((item) => item.menuType === "회사소개");

        if (companyIntro) {
          // 줄바꿈 문자(\n)를 <br /> 태그로 변환하여 HTML 줄바꿈으로 처리
          const processedGreeting = companyIntro.greeting.replace(
            /\n/g,
            "<br />"
          );
          setIntroData({ ...companyIntro, greeting: processedGreeting });
        } else {
          setIntroData({
            greeting: "<p>회사소개 내용을 불러오지 못했습니다.</p>",
            menuType: "회사소개",
          });
        }
      } catch (e) {
        setError("회사소개 정보를 불러오지 못했습니다. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchIntroData();
  }, []);

  if (loading) {
    return (
      <section className="intro-container">
        <h1>회사소개</h1>
        <p>데이터를 불러오는 중입니다...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="intro-container">
        <h1>회사소개</h1>
        <p style={{ color: "red" }}>{error}</p>
      </section>
    );
  }

  return (
    <section className="intro-container">
      <h1>{introData?.menuType || "회사소개"}</h1>
      <article
        className="intro-content"
        dangerouslySetInnerHTML={{
          __html: introData?.greeting || "내용이 없습니다.",
        }}
      />
    </section>
  );
};

export default IntroPage;
