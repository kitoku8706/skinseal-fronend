import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManagementTeam.css";

const ManagementTeam = () => {
  const [team, setTeam] = useState([]); // 관계자 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 메시지 상태

  useEffect(() => {
    // async/await로 API 데이터 비동기 호출 함수 정의
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
        // 네트워크 오류, CORS 문제, 서버 오류 등 모든 예외 처리
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
              src={member.profileImage || "/default-profile.png"}
              alt={`${member.name} 프로필`}
              className="profile-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-profile.png";
              }}
            />
            <div className="card-info">
              <h2>{member.name}</h2>
              <h4>{member.position}</h4>
              <p>{member.description}</p>
              {member.reservationLink && (
                <a
                  href={member.reservationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-reserve"
                >
                  상담 예약
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagementTeam;
