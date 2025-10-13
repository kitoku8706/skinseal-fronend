import React, { useEffect, useRef } from "react";
import "./Directions.css";

const Directions = () => {
  const API_KEY = "030468d1c53703f283ac815f1518a5e1";
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapContainerRef.current) {
          console.error("지도 컨테이너를 찾을 수 없습니다.");
          return;
        }

        const mapOptions = {
          center: new window.kakao.maps.LatLng(37.4855, 126.8982),
          level: 3,
        };

        const map = new window.kakao.maps.Map(
          mapContainerRef.current,
          mapOptions
        );

        const markerPosition = new window.kakao.maps.LatLng(37.4855, 126.8982);

        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
        });

        marker.setMap(map);

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div class="custom-infowindow">SkinSeal</div>`,
        });
        infowindow.open(map, marker);
      });
    };

    script.onerror = () => {
      console.error("카카오 지도 SDK 로드 실패");
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [API_KEY]);

  return (
    <section className="location-section">
      <h2 className="section-title">오시는 길</h2>

      <div id="map" ref={mapContainerRef} className="map-container"></div>

      <div className="info-container">
        <h3>주소 및 운영 시간</h3>
        <p>서울특별시 구로구 디지털로 34길 1106-7호(대륭포스트타워 3차)</p>
        <p>운영 시간: 월요일 - 금요일 / 09:30 ~ 18:30</p>
        <p>대표 전화: 02-1234-5678</p>
      </div>

      <div className="parking-info">
        <h3>주차 안내</h3>
        <p>건물 지하 주차장 이용 가능, 2시간 무료 주차</p>
        <p>근처 공영 주차장 추가 안내</p>
      </div>
    </section>
  );
};

export default Directions;
