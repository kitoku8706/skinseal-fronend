import React, { useState } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "./ReservationConsultPage.css";

const consultants = [
  { id: 1, name: "김충만", img: "/images/profile1.png" },
  { id: 2, name: "신대현", img: "/images/profile2.png" },
  { id: 3, name: "정승환", img: "/images/profile3.png" },
];

const timeSlots = [
  "09:30",
  "10:30",
  "11:30",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export default function ReservationConsultPage() {
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [consultant, setConsultant] = useState("");
  const [time, setTime] = useState("");
  const [agree, setAgree] = useState(false);

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 42); // 6주 뒤까지 가능

  // 전화번호 숫자만 입력
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
    setPhone(value);
  };

  // 예약 제출
  const handleSubmit = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }
    if (
      !birthYear ||
      !birthMonth ||
      !birthDay ||
      !phone ||
      !selectedDate ||
      !consultant ||
      !time
    ) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    if (!agree) {
      alert("개인정보 수집에 동의해주세요.");
      return;
    }

    try {
      const dto = {
        counselorId: Number(consultant),
        appointmentDate: selectedDate.toISOString().split("T")[0],
        appointmentTime: time,
        birth: `${birthYear}-${birthMonth}-${birthDay}`,
        phone: phone,
        purpose: "상담 예약",
      };

      const res = await axios.post(
        "http://localhost:8090/api/appointments",
        dto,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data ?? "예약이 완료되었습니다!");
      setBirthYear("");
      setBirthMonth("");
      setBirthDay("");
      setPhone("");
      setConsultant("");
      setTime("");
      setAgree(false);
    } catch (err) {
      console.error("예약 오류:", err);
      if (err.response?.status === 409) {
        alert("이미 해당 시간대에 예약이 존재합니다.");
      } else {
        alert("❌ 예약 중 오류가 발생했습니다.");
      }
    }
  };

  // 주말 및 6주 이후 비활성화
  const tileDisabled = ({ date, view }) =>
    view === "month" &&
    (date < today ||
      date > maxDate ||
      date.getDay() === 0 ||
      date.getDay() === 6);

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      if (date > maxDate) return "disabled-date";
      if (date.getDay() === 0 || date.getDay() === 6) return "weekend-disabled";
    }
    return null;
  };

  return (
    <div className="reservation-container">
      <h2>상담 예약</h2>

      <div className="reservation-sections">
        {/* 1️⃣ 예약자 정보 */}
        <div className="section-box">
          <h4>예약자 정보</h4>
          <p className="info-text">
            상담 예약을 위한 최소한의 입력사항입니다. <br />
            예약하시는 분의 정보를 입력해주세요.
          </p>

          <div className="input-group birth-group">
            <label>생년월일</label>
            <div className="birth-selects">
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
              >
                <option value="">년</option>
                {Array.from({ length: 80 }, (_, i) => 2025 - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
              >
                <option value="">월</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={String(m).padStart(2, "0")}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
              >
                <option value="">일</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={String(d).padStart(2, "0")}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>연락처</label>
            <input
              type="text"
              placeholder="숫자만 입력해주세요."
              value={phone}
              onChange={handlePhoneChange}
              maxLength={11}
            />
          </div>
        </div>

        {/* 2️⃣ 달력 2개 (이번 달 / 다음 달) */}
        <div className="section-box">
          <h4>상담 날짜 선택</h4>
          <p className="date-desc">예약하실 날짜를 선택해주세요.</p>

          <div className="calendar-double">
            {/* 이번 달 */}
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              locale="ko-KR"
              activeStartDate={new Date()}
              tileDisabled={tileDisabled}
              tileClassName={tileClassName}
            />

            {/* 다음 달 */}
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              locale="ko-KR"
              activeStartDate={(function () {
                const next = new Date();
                next.setMonth(next.getMonth() + 1);
                return next;
              })()}
              tileDisabled={tileDisabled}
              tileClassName={tileClassName}
            />
          </div>
        </div>

        {/* 3️⃣ 상담사 선택 + 시간 */}
        <div className="section-box">
          <h4>상담 시간 / 담당자</h4>
          <div className="consultant-list">
            {consultants.map((c) => (
              <div
                key={c.id}
                className={`consultant-card ${
                  consultant === c.id ? "selected" : ""
                }`}
              >
                <img src={c.img} alt={c.name} />
                <p>{c.name}</p>
                <button onClick={() => setConsultant(c.id)}>선택</button>
              </div>
            ))}
          </div>

          <div className="time-buttons">
            {timeSlots.map((t) => (
              <button
                key={t}
                className={time === t ? "selected" : ""}
                onClick={() => setTime(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4️⃣ 개인정보 동의 + 버튼 */}
      <div className="footer-section">
        <p className="privacy-text">
          피부씰은 원활한 진료 예약을 위해 고객님의 개인정보 수집 및 활용에 대한
          동의를 받고 있습니다.
          <br />
          개인정보 수집 이용 동의는 거부하실 수 있으며, 거부할 경우 서비스
          사용이 일부 제한될 수 있습니다.
        </p>

        <div className="privacy-box">
          <h5>수집하는 개인정보 항목</h5>
          <p>본인 예약 : 예약자, 생년월일, 휴대폰 번호</p>
          <p>
            대리 예약 : 환자명, 환자 생년월일, 환자 휴대폰 번호, 예약자, 예약자
            휴대폰 번호
          </p>

          <h5>수집 · 이용목적</h5>
          <p>진료 예약 및 진료 안내</p>

          <h5>보유 및 이용기간</h5>
          <p>의료법에 준함</p>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            checked={agree}
            onChange={() => setAgree(!agree)}
          />
          <label>개인정보 수집에 동의합니다.</label>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          예약하기
        </button>
        <p className="notice-text">상담 신청 후 확인 문자가 발송됩니다.</p>
      </div>
    </div>
  );
}
