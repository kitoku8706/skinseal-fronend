import AppointmentForm from '../components/AppointmentForm';

function ReservationConsultPage() {
  // 실제 로그인 시스템이 있다면 userId를 props로 전달
  const userId = 1; // 예시용, 실제로는 로그인 정보에서 가져와야 함

  return (
    <div>
      <AppointmentForm userId={userId} />
    </div>
  );
}

export default ReservationConsultPage;