import React, { useState } from 'react';

function AppointmentForm({ userId }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [purpose, setPurpose] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://localhost:8090/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
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
    <div>
      <h2>진료 예약</h2>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <input type="text" placeholder="시간(예: 14:00)" value={time} onChange={e => setTime(e.target.value)} />
      <input type="text" placeholder="예약 목적" value={purpose} onChange={e => setPurpose(e.target.value)} />
      <button onClick={handleSubmit}>예약하기</button>
    </div>
  );
}

export default AppointmentForm;