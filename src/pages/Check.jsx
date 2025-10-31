import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Check.css";

export default function Check() {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const consultants = {
    1: "김충만",
    2: "신대현",
    3: "정승환",
  };

  useEffect(() => {
    const fetchLatestReservation = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("로그인 후 이용 가능합니다.");
          navigate("/login");
          return;
        }

        const res = await axios.get("http://18.210.20.169:8090/api/check/latest", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setReservation(res.data);
      } catch (err) {
        console.error("예약 조회 오류:", err);
        alert("예약 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestReservation();
  }, [navigate]);

  const handleCancel = async () => {
    if (!reservation) return;
    if (!window.confirm("예약을 취소하시겠습니까?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `http://18.210.20.169:8090/api/check/${reservation.appointmentId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      alert("예약이 취소되었습니다.");
      setReservation({ ...reservation, status: "CANCELLED" });
    } catch (err) {
      console.error("취소 실패:", err);
      alert("예약 취소 중 오류가 발생했습니다.");
    }
  };

  const handleModify = () => {
    navigate("/reservation/consult");
  };

  if (loading) return <p className="loading">로딩 중...</p>;

  return (
    <div className="check-container">
      <div className="check-card">
        <h2 className="check-title-inner">예약 조회</h2>

        {!reservation ? (
          <div className="no-data-box">
            <p>예약 내역이 없습니다.</p>
            <button
              className="reserve-btn"
              onClick={() => navigate("/reservation/consult")}
            >
              예약하기
            </button>
          </div>
        ) : (
          <>
            <div className="reservation-table">
              <div className="table-header">
                <div>예약번호</div>
                <div>예약날짜</div>
                <div>예약시간</div>
                <div>상담사명</div>
                <div>상태</div>
                <div>관리</div>
              </div>

              <div className="table-row">
                <div>{reservation.appointmentId}</div>
                <div>{reservation.appointmentDate}</div>
                <div>{reservation.appointmentTime}</div>
                <div>
                  {consultants[reservation.counselorId] || "알 수 없음"}
                </div>
                <div
                  className={`status ${
                    reservation.status === "CANCELLED" ? "cancelled" : "active"
                  }`}
                >
                  {reservation.status === "CANCELLED" ? "취소됨" : "예약완료"}
                </div>
                <div className="actions">
                  {reservation.status !== "CANCELLED" && (
                    <button className="cancel-btn" onClick={handleCancel}>
                      예약 취소
                    </button>
                  )}
                  <button className="modify-btn" onClick={handleModify}>
                    날짜/시간 변경
                  </button>
                </div>
              </div>
            </div>

            <p className="notice-text">
              💡 예약 변경은 <b>예약 취소 후</b> 가능합니다.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
