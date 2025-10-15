import React, { useEffect, useState } from "react";
import axios from "axios";

const ManagementTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/management")
      .then((response) => {
        setTeamMembers(response.data);
      })
      .catch((error) => {
        console.error("운영진 데이터 로딩 실패:", error);
      });
  }, []);

  const handleReservationClick = (reservationLink) => {
    if (reservationLink) {
      window.location.href = reservationLink;
    } else {
      alert("예약 페이지 링크가 없습니다.");
    }
  };

  return (
    <section
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontWeight: "bold",
          fontSize: "1.7rem",
          marginBottom: "0.5rem",
        }}
      >
        전문 상담사 소개
      </h2>
      <p style={{ color: "#555", marginBottom: "2rem" }}>
        여러분의 고민을 함께 나눌 준비가 되어있는 전문 상담사를 소개합니다.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {teamMembers.map((member) => (
          <div
            key={member.id}
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: "10px",
              padding: "1.5rem",
              width: "30%",
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#eee",
                backgroundImage: member.profileImage
                  ? `url(${member.profileImage})`
                  : "none",
                backgroundPosition: "center",
                backgroundSize: "cover",
                marginBottom: "1rem",
              }}
            />
            <h3 style={{ margin: "0.5rem 0" }}>{member.name}</h3>
            <p style={{ color: "#7a79e1", margin: "0.2rem 0" }}>
              {member.position}
            </p>
            <p style={{ fontSize: "0.9rem", color: "#666", minHeight: "60px" }}>
              {member.description}
            </p>
            <button
              onClick={() => handleReservationClick(member.consultReservation)}
              style={{
                marginTop: "auto",
                backgroundColor: "#7a79e1",
                color: "#fff",
                border: "none",
                padding: "0.6rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                width: "100%",
                fontWeight: "bold",
              }}
            >
              상담 예약하기
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ManagementTeam;
