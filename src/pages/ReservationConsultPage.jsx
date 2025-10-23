import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import "./ReservationConsultPage.css";

// ✅ Axios 기본 설정: 백엔드와 동일 포트 맞춤
axios.defaults.baseURL = "http://localhost:8090";

// ✅ 모든 요청에 JWT 자동 첨부
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터: 401(미로그인) 처리
axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      alert("로그인 후 이용해주세요.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 상담사 데이터 (임시)
const consultants = [
  { id: 1, name: "김충만", profileUrl: "/images/profile1.png" },
  { id: 2, name: "신대현", profileUrl: "/images/profile2.png" },
  { id: 3, name: "정승환", profileUrl: "/images/profile3.png" },
];

// 예약 가능한 시간대
const timeSlots = [
  "09:30~10:30",
  "10:30~11:30",
  "11:30~12:30",
  "14:00~15:00",
  "15:00~16:00",
  "16:00~17:00",
];

export default function ReservationConsultPage() {
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [agree, setAgree] = useState(false);

  // ✅ 예약 처리 함수
  const handleSubmit = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("로그인 후 이용해주세요.");
      window.location.href = "/login";
      return;
    }

    if (!selectedConsultant || !selectedDate || !selectedTime || !agree) {
      alert("모든 항목을 선택해주세요.");
      return;
    }

    const [startTime, endTime] = selectedTime.split("~");

    try {
      const res = await axios.post("/api/appointments", {
        counselorId: selectedConsultant.id,
        appointmentDate: selectedDate.toISOString().split("T")[0],
        appointmentTime: startTime,
        appointmentEndTime: endTime,
        purpose: purpose || "상담 예약",
      });

      alert(res.data); // ✅ 백엔드의 "✅ 상담 예약이 완료되었습니다."
    } catch (err) {
      console.error("예약 오류:", err);

      if (err.response?.status === 409) {
        alert("⚠️ 이미 예약된 시간대입니다.");
      } else {
        alert("예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="reservation-container">
      <h2>상담 예약</h2>

      {/* ✅ 상담사 선택 */}
      <section className="consultant-section">
        <h4>상담사 선택</h4>
        <div className="consultant-list">
          {consultants.map((c) => (
            <div
              key={c.id}
              className={`consultant-card ${
                selectedConsultant?.id === c.id ? "selected" : ""
              }`}
              onClick={() => setSelectedConsultant(c)}
            >
              <img src={c.profileUrl} alt={c.name} />
              <p>{c.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ 날짜 선택 */}
      <section className="date-section">
        <h4>날짜 선택</h4>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          minDate={new Date()} // 과거 선택 불가
          dateFormat="yyyy-MM-dd"
          placeholderText="날짜를 선택하세요"
          filterDate={(date) => {
            const day = date.getDay();
            return day !== 0 && day !== 6; // 일(0), 토(6) 비활성화
          }}
        />
      </section>

      {/* ✅ 시간 선택 */}
      <section className="time-section">
        <h4>시간 선택</h4>
        <div className="time-list">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              className={`time-slot ${selectedTime === slot ? "selected" : ""}`}
              onClick={() => setSelectedTime(slot)}
            >
              {slot}
            </button>
          ))}
        </div>
      </section>

      {/* ✅ 상담 목적 입력 */}
      <section className="purpose-section">
        <h4>상담 목적</h4>
        <input
          type="text"
          placeholder="상담 목적을 입력해주세요"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        />
      </section>

      {/* ✅ 개인정보 동의 */}
      <section className="agree-section">
        <label>
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          개인정보 수집 및 이용에 동의합니다.
        </label>
      </section>

      {/* ✅ 예약 버튼 */}
      <button className="submit-btn" onClick={handleSubmit}>
        예약하기
      </button>
    </div>
  );
}
