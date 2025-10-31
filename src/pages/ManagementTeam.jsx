import React from "react";
import "./ManagementTeam.css";

const teamMembers = [
  {
    id: 1,
    name: "김충만",
    role: "상담사",
    description: "상담 전문가로 고객 맞춤형 상담을 제공합니다.",
    img: "/images/profile1.png", // ✅ public/images
  },
  {
    id: 2,
    name: "신대현",
    role: "상담사",
    description: "피부 분석 및 진단을 전문으로 하는 전문가입니다.",
    img: "/images/profile2.png",
  },
  {
    id: 3,
    name: "정승환",
    role: "상담사",
    description: "피부 데이터 기반 맞춤형 솔루션을 제공합니다.",
    img: "/images/profile3.png",
  },
];

export default function ManagementTeam() {
  return (
    <section className="management-team-container">
      <h1>상담사 소개</h1>
      <div className="team-cards">
        {teamMembers.map((member) => (
          <div key={member.id} className="card">
            <img
              src={member.img}
              alt={`${member.name} 프로필`}
              className="profile-img"
            />
            <div className="card-info">
              <h2>{member.name}</h2>
              <h4>{member.role}</h4>
              <p>{member.description}</p>
              <a href="/reservation/consult" className="btn-reserve">
                상담 예약
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
