import React from 'react';
import '../styles/ReservationQuery.css';

function ReservationQuery() {
    // 예약 데이터를 가져오는 로직은 나중에 백엔드 연결 시 추가됩니다.
    // 현재는 더미 데이터 또는 빈 배열을 사용합니다.
    const reservations = [
         { 
             reservationNumber: 'R20250923001', 
             reservationTime: '2025-10-20 14:00', 
             counselor: '김상담사' 
         }
    ];

    return (
        <div className="reservation-query-page">
            <h3>예약 조회</h3>
            
            <div className="reservation-table-container">
                {reservations.length === 0 ? (
                    <div className="no-reservation-message">
                        예약 내역이 없습니다.
                    </div>
                ) : (
                    <table className="reservation-table">
                        <thead>
                            <tr>
                                <th>예약 번호</th>
                                <th>예약 시간</th>
                                <th>상담사</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((res, index) => (
                                <tr key={index}>
                                    <td>{res.reservationNumber}</td>
                                    <td>{res.reservationTime}</td>
                                    <td>{res.counselor}</td>
                                    <td className="actions">
                                        <button className="cancel-btn" onClick={() => alert('예약 취소 기능은 준비 중입니다.')}>
                                            예약 취소
                                        </button>
                                        <button className="change-btn" onClick={() => alert('날짜/시간 변경 페이지로 이동합니다.')}>
                                            날짜/시간 변경
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default ReservationQuery;