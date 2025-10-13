import React from "react";
import { useNavigate } from "react-router-dom";
import "./ManagementTeam.css";

const ManagementTeam = ({ members }) => {
  // 페이지 이동을 위한 navigate훅 사용
  const navigate = useNavigate();

  // 기본 데이터(나중에 DB에서 가져올 수 있음)
  const defaultMembers = [
    {
      id: 1,
      name: "김충만",
      position: "피부씰 상담사",
      photo: "/images/team1.jpg",
      intro:
        "10년 경력의 전문 상담사입니다. 따뜻한 대화로 여러분의 고민을 함께 나누겠습니다.",
    },
    {
      id: 2,
      name: "신대현",
      position: "피부씰 상담사",
      photo: "/images/team2.jpg",
      intro:
        "다양한 상담 경험을 가지고 있습니다. 편안한 마음으로 찾아와 주세요.",
    },
    {
      id: 3,
      name: "정승환",
      position: "피부씰 상담사",
      photo: "/images/team3.jpg",
      intro: "피부에 전문성을 가지고 있습니다. 함께 해결해봐요.",
    },
  ];

  // props로 전달받은 데이터가 있으면 사용, 없으면 기본 데이터 사용
  const teamMembers = members || defaultMembers;

  // 상담 예약 페이지 이동 함수
  const handleReservationClick = () => {
    // App.js의 Route에 정의된 경로로 이동
    navigate("/reservation/consult");
  };

  return (
    <section className="management-team-container">
      <h2 className="management-team-title">전문 상담사 소개</h2>
      <p className="management-team-subtitle">
        여러분의 고민을 함께 나눌 준비가 되어있는 전문 상담사를 소개합니다.
      </p>

      <div className="member-list">
        {teamMembers.map((member) => (
          <div key={member.id} className="member-card">
            <div
              className="member-photo"
              style={{ backgroundImage: `url(${member.photo})` }}
              aria-label={`${member.name} 사진`}
            />
            <h3 className="member-name">{member.name}</h3>
            <h4 className="member-position">{member.position}</h4>
            <p className="member-intro">{member.intro}</p>
            <button
              className="reservation-button"
              onClick={handleReservationClick}
              aria-label={`${member.name} 상담 예약`}
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
