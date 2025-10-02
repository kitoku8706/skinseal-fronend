import React, { useState } from 'react';

function AppointmentForm({ userId }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [agree, setAgree] = useState(false);

  const times = [
    '09:00 ~ 10:00', '10:00 ~ 11:00', '11:00 ~ 12:00',
    '12:00 ~ 13:00', '13:00 ~ 14:00', '14:00 ~ 15:00',
    '15:00 ~ 16:00', '16:00 ~ 17:00', '17:00 ~ 18:00'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agree) {
      alert('개인정보 수집에 동의해 주세요.');
      return;
    }
    try {
      const res = await fetch('http://localhost:8090/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name,
          phone,
          appointment_date: date,
          appointment_time: time,
          purpose
        })
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert('예약 등록 실패');
    }
  };

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <div className="form-row">
        {/* 1. 예약자 정보 */}
        <div className="form-section">
          <h3>예약자 정보</h3>
          <div>
            <label>이름</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label>연락처</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" required />
          </div>
        </div>
        {/* 2. 상담 희망 날짜 */}
        <div className="form-section">
          <h3>상담 희망 날짜</h3>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        {/* 3. 상담 시간 선택 */}
        <div className="form-section">
          <h3>상담 시간</h3>
          <div className="time-list">
            {times.map(t => (
              <button
                type="button"
                key={t}
                className={time === t ? 'selected' : ''}
                onClick={() => setTime(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* 4. 개인정보 동의 */}
      <div className="form-agree">
        <textarea
          value={
            "개인정보 수집 (이름, 연락처)\n개인정보 동의에 대한 내용 이해·동의함"
          }
          readOnly
          rows={3}
        />
        <div>
          <label>
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
            개인정보 이용에 동의합니다.
          </label>
        </div>
      </div>
      {/* 5. 예약 버튼 */}
      <div className="form-submit">
        <button type="submit" disabled={!agree}>예약하기</button>
      </div>
      {/* 6. 안내문구 */}
      <div className="form-info">
        상담 신청에 관한 주의사항 안내<br />
        관리자 정보노출
      </div>
    </form>
  );
}

export default AppointmentForm;