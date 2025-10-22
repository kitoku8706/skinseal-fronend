import React, { useState } from "react";
import "./AppointmentForm.css";

function AppointmentForm({ userId }) {
  // 상태 변수 선언
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [agree, setAgree] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState(null);

  // 상담 가능한 시간 목록을 Date 객체로 변환
  const times = [
    new Date(2025, 9, 22, 9, 30),
    new Date(2025, 9, 22, 10, 30),
    new Date(2025, 9, 22, 11, 30),
    new Date(2025, 9, 22, 12, 30),
    new Date(2025, 9, 22, 13, 30),
    new Date(2025, 9, 22, 14, 30),
    new Date(2025, 9, 22, 15, 30),
    new Date(2025, 9, 22, 16, 30),
    new Date(2025, 9, 22, 17, 30),
  ];

  // 시간별 상담 가능 여부 (예시, 실제 API 연동 권장)
  const availability = [true, true, true, false, true, true, true, true, false];

  // 관리자 리스트
  const consultants = [
    { id: 1, name: "김충만" },
    { id: 2, name: "신대현" },
    { id: 3, name: "정승환" },
  ];

  // 예약 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 입력값 검증
    if (!date) {
      alert("예약 날짜를 선택해주세요.");
      return;
    }

    if (!time) {
      alert("예약 시간을 선택해주세요.");
      return;
    }

    if (!selectedConsultant) {
      alert("상담 관리자를 선택해주세요.");
      return;
    }

    // 전송 전 JSON 데이터 확인용 로그
    const payload = {
      user_id: userId, // snake_case로 변경 (백엔드 JsonProperty와 일치)
      appointment_date: date, // snake_case로 변경
      appointment_time: time,
      purpose,
      consultant_id: selectedConsultant, // snake_case로 변경
    };

    console.log("전송할 예약 데이터:", payload);

    try {
      const response = await fetch("/api/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "예약 처리 중 오류가 발생했습니다."
        );
      }

      // 성공 메시지 표시
      alert("예약이 완료되었습니다!");

      // 폼 초기화
      setName("");
      setPhone("");
      setDate("");
      setTime("");
      setPurpose("");
      setAgree(false);
      setSelectedConsultant(null);
    } catch (error) {
      console.error("예약 등록 실패:", error);
      alert(
        `예약 등록에 실패했습니다. 오류: ${
          error.message || "다시 시도해주세요."
        }`
      );
    }
  };

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <div className="form-row">
        {/* 1. 예약자 정보 섹션 */}
        <div className="form-section">
          <h3>예약자 정보</h3>
          <div
            className="form-info-text"
            style={{
              marginBottom: 16,
              color: "#6f2232",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: "4px 0", fontWeight: 500 }}>예약자 정보</p>
            <p style={{ margin: "4px 0", fontWeight: 500 }}>
              상담 예약을 위한 최소한의 입력사항입니다.
            </p>
            <p style={{ margin: "4px 0", fontWeight: 500 }}>
              예약하시는 분의 정보를 입력해 주세요.
            </p>
          </div>
          <div>
            <label>이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>연락처</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              required
            />
          </div>
        </div>

        {/* 2. 상담 희망 날짜 섹션 */}
        <div className="form-section">
          <h3>상담 희망 날짜</h3>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* 3. 상담 시간 및 관리자 선택 통합 섹션 */}
        <div className="form-section">
          <h3>상담 시간</h3>
          <div className="time-list">
            {times.map((t, idx) => (
              <button
                key={t}
                type="button"
                className={`${time === t ? "selected" : ""} ${
                  availability[idx] ? "" : "disabled"
                }`}
                onClick={() => availability[idx] && setTime(t)}
                disabled={!availability[idx]}
              >
                {t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </button>
            ))}
          </div>

          <div className="consultant-selection" style={{ marginTop: 20 }}>
            <h4>관리자 선택</h4>
            <div className="consultant-list">
              {consultants.map((consultant) => (
                <button
                  key={consultant.id}
                  type="button"
                  className={
                    selectedConsultant === consultant.id
                      ? "consultant selected"
                      : "consultant"
                  }
                  onClick={() => setSelectedConsultant(consultant.id)}
                >
                  <span className="circle" />
                  <span>{consultant.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. 개인정보 동의 박스 */}
      <div className="privacy-text-box">
        <textarea
          readOnly
          rows={3}
          value={
            "개인정보 수집 (이름, 연락처, 이메일)\n개인정보 동의에 대한 내용 이해·동의함\n추가된 내용이나 조항을 여기에 입력하세요."
          }
        />
      </div>

      {/* 6. 개인정보 이용 동의 체크박스 */}
      <div className="agree-checkbox">
        <label>
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          개인정보 이용에 동의합니다.
        </label>
      </div>

      {/* 7. 예약 제출 버튼 */}
      <div className="form-submit">
        <button type="submit" disabled={!agree}>
          예약하기
        </button>
      </div>

      {/* 8. 안내 문구 */}
      <div className="form-info">
        상담 신청에 관한 주의사항 안내
        <br />
        관리자 정보노출
      </div>
    </form>
  );
}

export default AppointmentForm;
