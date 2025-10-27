import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TimeTable.css";

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

export default function TimeTable() {
  const [weekData, setWeekData] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const currentMonday = new Date(
    today.setDate(today.getDate() - today.getDay() + 1)
  );

  const selectedMonday = new Date(currentMonday);
  selectedMonday.setDate(currentMonday.getDate() + weekOffset * 7);

  const getWeekDates = (startDate) => {
    const week = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      week.push(d.toISOString().split("T")[0]);
    }
    return week;
  };
  const weekDates = getWeekDates(selectedMonday);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  useEffect(() => {
    const fetchWeekData = async () => {
      try {
        setLoading(true);
        const formattedDate = selectedMonday.toISOString().split("T")[0];
        const res = await axios.get(
          "http://localhost:8090/api/timetable/week",
          {
            params: { startDate: formattedDate },
            withCredentials: true,
          }
        );
        console.log("📅 주간 시간표 조회 성공:", res.data);
        setWeekData(res.data);
      } catch (error) {
        console.error("❌ 시간표 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekData();
  }, [weekOffset]);

  const handlePrevWeek = () => {
    if (weekOffset > 0) setWeekOffset(weekOffset - 1);
  };

  const handleNextWeek = () => {
    if (weekOffset < 5) setWeekOffset(weekOffset + 1);
  };

  return (
    <div className="timetable-container">
      {/* ✅ 제목 + 버튼 묶음 (위치 이동용 div 추가) */}
      <div className="header-wrapper">
        <h2>상담사 주간 시간표</h2>

        {/* ✅ 주간 이동 버튼 */}
        <div className="week-navigation">
          <button onClick={handlePrevWeek} disabled={weekOffset === 0}>
            &lt; 이전
          </button>
          <button onClick={handleNextWeek} disabled={weekOffset === 5}>
            다음 &gt;
          </button>
        </div>
      </div>

      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <div className="timetable-grid">
          {consultants.map((counselor) => (
            <div key={counselor.id} className="counselor-section">
              <div className="counselor-wrapper">
                <div className="counselor-info">
                  <img src={counselor.img} alt={counselor.name} />
                  <h3>{counselor.name}</h3>
                </div>

                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>시간</th>
                      {weekDates.map((date, idx) => (
                        <th key={idx}>
                          {["월", "화", "수", "목", "금"][idx]} (
                          {formatDate(date)})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time) => (
                      <tr key={time}>
                        <td>{time}</td>
                        {weekDates.map((date) => {
                          const matched = weekData.find(
                            (item) =>
                              item.counselorId === counselor.id &&
                              item.timetableDate === date &&
                              item.timetableTime === time
                          );

                          const reserved =
                            matched && matched.status === "예약완료";

                          return (
                            <td
                              key={`${counselor.id}-${date}-${time}`}
                              className={reserved ? "unavailable" : "available"}
                            >
                              {reserved ? "●" : ""}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="note">
        ※ 회색 칸은 예약 불가, 빈 칸은 예약 가능 상태를 의미합니다.
      </p>
    </div>
  );
}
