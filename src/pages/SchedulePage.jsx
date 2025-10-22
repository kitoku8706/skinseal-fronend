// SchedulePage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SchedulePage.css";

const consultants = [
  { id: 1, name: "김충만", profileUrl: "/images/profile1.png" },
  { id: 2, name: "신대현", profileUrl: "/images/profile2.png" },
  { id: 3, name: "정승환", profileUrl: "/images/profile3.png.png" },
];

const timeSlots = [
  { label: "09:30~10:30", start: "09:30", end: "10:30", unavailable: false },
  { label: "10:30~11:30", start: "10:30", end: "11:30", unavailable: false },
  { label: "11:30~12:30", start: "11:30", end: "12:30", unavailable: false },
  { label: "12:30~14:00", start: "12:30", end: "14:00", unavailable: true },
  { label: "14:00~15:00", start: "14:00", end: "15:00", unavailable: false },
  { label: "15:00~16:00", start: "15:00", end: "16:00", unavailable: false },
  { label: "16:00~17:00", start: "16:00", end: "17:00", unavailable: false },
  { label: "17:00~18:00", start: "17:00", end: "18:00", unavailable: false },
];

// 주중 날짜 (월요일~금요일)
const getWeekDates = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
};

const ConsultantScheduleTable = ({ consultant, scheduleData, weekDates }) => {
  // 예약 여부 확인 함수
  const isReserved = (
    date,
    timeSlotLabel // timeSlotLabel로 변경
  ) =>
    scheduleData.some(
      (item) =>
        item.consultantId === consultant.id &&
        item.date === date &&
        (item.appointment_time === timeSlotLabel || item.time === timeSlotLabel)
    );

  return (
    <div className="scheduleTableContainerForConsultant">
      {" "}
      {/* 각 상담사별 테이블 컨테이너 */}
      <h3 className="consultantTitle">{consultant.name} 상담 시간표</h3>{" "}
      {/* 제목 유지 */}
      <table className="scheduleTable">
        <thead>
          <tr>
            <th className="timeCol">시간</th>
            {weekDates.map((date) => (
              <th key={date} className="dateHeader">
                {date.slice(5)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot, i) => (
            <tr key={i}>
              <td
                className={
                  slot.unavailable
                    ? "unavailable timeSlotLabel"
                    : "timeSlotLabel"
                }
              >
                {slot.label}
              </td>
              {weekDates.map((date) => {
                const reserved = isReserved(date, slot.label);
                return (
                  <td
                    key={`${date}-${i}`}
                    className={
                      reserved
                        ? "reserved"
                        : slot.unavailable
                        ? "unavailable"
                        : ""
                    }
                  >
                    {reserved && <div className="reservedDot"></div>}{" "}
                    {/* 회색 점 */}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SchedulePage = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const weekDates = getWeekDates();

  useEffect(() => {
    async function fetchData() {
      try {
        const allData = [];
        for (const date of weekDates) {
          const res = await axios.get(
            `http://localhost:8090/api/schedule/date/${date}`
          );
          const dataWithDate = res.data.map((item) => ({ ...item, date }));
          allData.push(...dataWithDate);
        }
        setScheduleData(allData);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }
    fetchData();
  }, [weekDates]);

  if (loading) return <div className="loadingMessage">로딩 중...</div>;
  if (error)
    return <div className="errorMessage">오류 발생: {error.message}</div>;

  return (
    <div className="wrapper">
      <div className="schedulePageContent">
        {" "}
        {/* 새로운 컨테이너 */}
        {consultants.map((c) => (
          <div key={c.id} className="consultantBlock">
            {" "}
            {/* 각 상담사 블록 */}
            <div className="consultantProfileColumn">
              {" "}
              {/* 프로필 이미지 열 */}
              <img src={c.profileUrl} alt={c.name} className="profileImage" />
              <div className="profileName">{c.name}</div>
            </div>
            <ConsultantScheduleTable
              consultant={c}
              scheduleData={scheduleData}
              weekDates={weekDates}
            />
          </div>
        ))}
      </div>
      {/* 풋터 영역이 있다면 여기에 배치 */}
      {/* <footer className="footer">...</footer> */}
    </div>
  );
};

export default SchedulePage;
