import React, { useState, useMemo, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "./ReservationConsultPage.css";

// ✅ 날짜 숫자만 표시 (ex: "10")
const formatDayNumber = (locale, date) => date.getDate();

// ✅ 상담사 리스트
const consultants = [
  { id: 1, name: "김충만", img: "/images/profile1.png" },
  { id: 2, name: "신대현", img: "/images/profile2.png" },
  { id: 3, name: "정승환", img: "/images/profile3.png" },
];

// ✅ 상담 가능 시간대
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

  // ✅ 예약된 시간 목록 (서버에서 불러옴)
  const [reservedTimes, setReservedTimes] = useState([]);

  // 오늘 날짜 기준 세팅
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const currentMonthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today]
  );
  const nextMonthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() + 1, 1),
    [today]
  );

  const maxDate = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 42);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [today]);

  // ✅ 전화번호 숫자만 허용
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setPhone(value);
  };

  // ✅ 상담사 + 날짜 기준 예약 정보 불러오기
  useEffect(() => {
    if (!selectedDate || !consultant) return;

    const dateStr = selectedDate.toISOString().split("T")[0];
    axios
      .get(`http://localhost:8090/api/appointments/date/${dateStr}`, {
        params: { counselorId: consultant }, // ✅ 이 한 줄 추가!
      })
      .then((res) => {
        // 🔥 선택된 상담사만 필터링
        const filtered = res.data
          .filter((a) => a.counselorId === Number(consultant))
          .map((a) => a.appointmentTime);
        setReservedTimes(filtered);
      })
      .catch((err) => {
        console.error("예약 데이터 불러오기 오류:", err);
        setReservedTimes([]);
      });
  }, [selectedDate, consultant]);

  // ✅ 예약하기
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
        phone,
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
      setTime("");
    } catch (err) {
      console.error("예약 오류:", err);
      if (err.response?.status === 409) {
        alert("이미 해당 시간대에 예약이 존재합니다.");
      } else {
        alert("❌ 예약 중 오류가 발생했습니다.");
      }
    }
  };

  // ✅ 날짜 비활성화 로직
  const tileDisabled = ({ date, view }) =>
    view === "month" &&
    (date < today ||
      date > maxDate ||
      date.getDay() === 0 ||
      date.getDay() === 6);

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      if (date < today || date > maxDate) return "disabled-date";
      if (date.getDay() === 0 || date.getDay() === 6) return "weekend-disabled";
      // 🔵 선택한 날짜 배경 강조 (얕은 하늘색)
      if (selectedDate.toDateString() === date.toDateString())
        return "selected-date";
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

          {/* 생년월일 */}
          <div className="input-group birth-group">
            <label>생년월일</label>
            <div className="birth-select">
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

          {/* 연락처 */}
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

        {/* 2️⃣ 달력 */}
        <div className="section-box">
          <h4>상담 날짜 선택</h4>
          <div className="calendar-double">
            <Calendar
              onClickDay={setSelectedDate}
              value={selectedDate}
              locale="ko-KR"
              showNeighboringMonth={false}
              minDetail="month"
              maxDetail="month"
              activeStartDate={currentMonthStart}
              tileDisabled={tileDisabled}
              tileClassName={tileClassName}
              formatDay={formatDayNumber}
            />
            <Calendar
              onClickDay={setSelectedDate}
              value={selectedDate}
              locale="ko-KR"
              showNeighboringMonth={false}
              minDetail="month"
              maxDetail="month"
              activeStartDate={nextMonthStart}
              tileDisabled={tileDisabled}
              tileClassName={tileClassName}
              formatDay={formatDayNumber}
            />
          </div>
        </div>

        {/* 3️⃣ 상담사 + 시간 선택 */}
        <div className="section-box">
          <h4>상담 시간 / 담당자</h4>
          <div className="consultant-list">
            {consultants.map((c) => (
              <div
                key={c.id}
                className={`consultant-card ${
                  consultant === c.id ? "selected" : ""
                }`}
                onClick={() => setConsultant(c.id)}
              >
                <img src={c.img} alt={c.name} />
                <p>{c.name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConsultant(c.id);
                  }}
                >
                  선택
                </button>
              </div>
            ))}
          </div>

          {/* ✅ 시간대 버튼 (상담사별 예약 표시) */}
          <div className="time-buttons">
            {timeSlots.map((t) => {
              const isReserved = reservedTimes.includes(t);
              return (
                <button
                  key={t}
                  className={`time-btn ${isReserved ? "reserved" : ""} ${
                    time === t ? "selected" : ""
                  }`}
                  onClick={() => !isReserved && setTime(t)}
                  disabled={isReserved || !consultant}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4️⃣ 개인정보 동의 + 제출 */}
      <div className="footer-section">
        <p className="privacy-text">
          피부씰은 원활한 진료 예약을 위해 고객님의 개인정보 수집 및 활용에 대한
          동의를 받고 있습니다.
        </p>

        <div className="privacy-box">
          <h5>수집하는 개인정보 항목</h5>
          <p>본인 예약 : 예약자, 생년월일, 휴대폰 번호</p>
          <p>
            대리 예약 : 환자명, 환자 생년월일, 환자 휴대폰 번호, 예약자, 예약자
            휴대폰 번호
          </p>
          <h5>수집 · 이용목적</h5>
          <p>진료 예약 및 안내</p>
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
