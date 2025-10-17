import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Link 컴포넌트 import 추가
import "./ManagementTeam.css";

const ManagementTeam = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 백엔드 서버 기본 URL 설정
  const SERVER_URL = "http://localhost:8090";

  useEffect(() => {
    const fetchManagementData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get("/management/api");
        const data = res.data;

        if (Array.isArray(data)) {
          setTeam(data);
        } else if (data && Array.isArray(data.data)) {
          setTeam(data.data);
        } else {
          setError("서버 응답 데이터 형식이 올바르지 않습니다.");
          setTeam([]);
          console.warn("API 응답 형식 문제:", data);
        }
      } catch (err) {
        if (err.response) {
          setError(
            `서버 오류: ${err.response.status} ${err.response.statusText}`
          );
        } else if (err.request) {
          setError("응답 없음: 서버와 연결할 수 없습니다.");
        } else {
          setError(`요청 오류: ${err.message}`);
        }
        setTeam([]);
        console.error("API 호출 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagementData();
  }, []);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!team.length)
    return <div className="no-data">불러올 데이터가 없습니다.</div>;

  return (
    <div className="management-team-container">
      <h1>관계자 소개</h1>
      <div className="team-cards">
        {team.map((member) => (
          <div key={member.id} className="card">
            <img
              src={
                member.profileImage
                  ? member.profileImage.startsWith("http")
                    ? member.profileImage
                    : `${SERVER_URL}${
                        member.profileImage.startsWith("/") ? "" : "/"
                      }${member.profileImage}`
                  : "/default-profile.png"
              }
              alt={`${member.name} 프로필`}
              className="profile-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-profile.png";
                console.log(`이미지 로드 실패: ${member.profileImage}`);
              }}
            />
            <div className="card-info">
              <h2>{member.name}</h2>
              <h4>{member.position}</h4>
              <p>{member.description}</p>
              {member.reservationLink && (
                <Link to="/reservation/consult" className="btn-reserve">
                  상담 예약
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagementTeam;
