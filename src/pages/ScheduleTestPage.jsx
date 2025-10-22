import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../styles/ScheduleTestPage.css'; // ⭐ 외부 CSS 파일 import는 유지합니다. ⭐

// --- [3단계 핵심] 상수 정의 ---
const CONSULTATION_DURATION_MINUTES = 60; // 예약 1회당 소요 시간 (60분 가정)
const TIME_SLOTS_INTERVAL_MINUTES = 60; // 시간표 셀의 간격 (현재는 60분 가정)
const TIME_SLOTS = [
    '09:30', '10:30', '11:30', '14:00', '15:00', '16:00', '17:00'
];

// 백엔드에서 받은 'HH:MM:SS' 형식을 'HH:MM'으로 변환 (사용하지 않지만 유지)
const formatTimeForSlot = (time) => time ? time.substring(0, 5) : '';

const DAYS_OF_WEEK = [
    { name: '월', index: 1 }, 
    { name: '화', index: 2 }, 
    { name: '수', index: 3 }, 
    { name: '목', index: 4 }, 
    { name: '금', index: 5 }
];

// --- [3단계 핵심] 시간 유틸리티 추가 ---
const TimeUtils = {
    // 'YYYY-MM-DD'와 'HH:MM:SS'를 받아 Date 객체 생성
    createDateTime: (dateStr, timeStr) => {
        // T를 사용하여 ISO 8601 형식으로 만듦 (예: '2025-10-20T10:00:00')
        return new Date(`${dateStr}T${timeStr}`); 
    }
    // 추가적인 TimeUtils는 현재 필요하지 않아 생략
};

const DateUtils = {
    // 날짜를 'YYYY-MM-DD' 형식의 문자열로 포맷
    formatDate: (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 특정 날짜(date)를 기준으로 해당 주의 월요일과 일요일을 계산
    getWeekRangeFromDate: (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0); 
        
        const dayOfWeek = d.getDay(); 
        const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
        
        const monday = new Date(d.setDate(diff));
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        return {
            monday: monday,
            startDate: DateUtils.formatDate(new Date(monday)), 
            endDate: DateUtils.formatDate(new Date(sunday)),
            displayStart: `${monday.getMonth() + 1}월 ${monday.getDate()}일`,
            displayEnd: `${sunday.getMonth() + 1}월 ${sunday.getDate()}일`,
        };
    },
};


const ScheduleTestPage = () => { 
    // 1. 상태 관리
    const [schedule, setSchedule] = useState([]);
    const [mappedSchedule, setMappedSchedule] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // 현재 조회 중인 주의 월요일을 상태로 관리
    const [currentMonday, setCurrentMonday] = useState(DateUtils.getWeekRangeFromDate(new Date()).monday);
    
    // 테스트에 사용할 고정 값 
    const TEST_COUNSELOR_ID = 1;
    const API_BASE_URL = "http://localhost:8090"; 
    
    // 2. 조회 기간 설정 (currentMonday가 변경될 때마다 재계산)
    const weekRange = useMemo(() => 
        DateUtils.getWeekRangeFromDate(currentMonday)
    , [currentMonday]);

    const { startDate, endDate, displayStart, displayEnd } = weekRange;


    // 3. 백엔드 API 호출 함수 (fetch 사용)
    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        setError(null);

        const API_URL = `${API_BASE_URL}/api/tests/schedule/${TEST_COUNSELOR_ID}?startDate=${startDate}&endDate=${endDate}`;
        
        try {
            // ... (fetch 호출 및 기본 에러 처리 로직)
            const res = await fetch(API_URL, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                let errorDetails = `HTTP 오류: ${res.status} ${res.statusText}`;
                throw new Error(errorDetails);
            }
            
            const data = await res.json();
            setSchedule(data);
            
            // --- [3단계 핵심] 예약 범위 체크를 통한 매핑 로직 ---
            const map = {};
            data.forEach(item => {
                const dateStr = item.appointmentDate; 
                
                // 1. 취소된 예약은 제외
                if (item.status === 'CONFIRMED' || item.status === 'PENDING') {
                    
                    // 2. 예약 시작 시간과 종료 시간 (Date 객체) 계산
                    const appointmentStart = TimeUtils.createDateTime(dateStr, item.appointmentTime); 
                    // 예약 시작 시간 + 상담 소요 시간
                    const appointmentEnd = new Date(appointmentStart.getTime() + CONSULTATION_DURATION_MINUTES * 60000); 

                    if (!map[dateStr]) {
                        map[dateStr] = {};
                    }

                    // 3. 정의된 모든 시간 슬롯을 순회하며 겹치는지 확인
                    TIME_SLOTS.forEach(slotTime => {
                        // 시간표 셀의 시작/종료 시간을 Date 객체로 변환
                        const slotStart = TimeUtils.createDateTime(dateStr, `${slotTime}:00`);
                        // 슬롯 시작 시간 + 슬롯 간격
                        const slotEnd = new Date(slotStart.getTime() + TIME_SLOTS_INTERVAL_MINUTES * 60000); 
                        
                        // **[핵심 비교 로직]** 두 기간이 겹치는지 확인:
                        // (예약 시작 시간 < 슬롯 종료 시간) AND (예약 종료 시간 > 슬롯 시작 시간)
                        if (appointmentStart < slotEnd && appointmentEnd > slotStart) {
                            // 예약된 시간이 이 슬롯 범위에 포함되거나 겹친다면 예약 객체를 등록
                            map[dateStr][slotTime] = item; 
                        }
                    });
                }
            });
            setMappedSchedule(map); 
            // console.log('--- 상담 예약 데이터 매핑 완료 (3단계) ---', map);
            
        } catch (err) {
            console.error('API 호출 오류:', err);
            setError(`상담 시간표를 불러오는데 실패했습니다: ${err.message}`);
            setSchedule([]);
            setMappedSchedule({});
            
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    // 4. 데이터 호출
    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);


    // 5. 주간 이동 핸들러 함수
    const handleWeekChange = useCallback((direction) => {
        const newDate = new Date(currentMonday);
        newDate.setDate(newDate.getDate() + (direction * 7)); 
        setCurrentMonday(newDate); 
    }, [currentMonday]);

    const handlePrevWeek = () => handleWeekChange(-1);
    const handleNextWeek = () => handleWeekChange(1);

    // 6. 렌더링
    const renderCalendarSchedule = () => {
        if (loading) return <div className="text-center p-4 text-blue-500 font-medium">시간표 데이터를 불러오는 중...</div>;
        if (error) return <div className="text-center p-4 text-red-600 font-medium">에러 발생: {error}</div>;

        const weekDates = DAYS_OF_WEEK.map(day => {
            const date = new Date(currentMonday); 
            date.setDate(date.getDate() + (day.index - 1));
            return {
                dateStr: DateUtils.formatDate(date),
                display: day.name
            };
        });

        return (
            // 모든 Tailwind 클래스를 일반 클래스 이름으로 대체
            <div className="schedule-calendar-container my-6">
                <div className="flex justify-between items-center mb-4">
                    <button 
                        onClick={handlePrevWeek} 
                        className="p-2 border rounded-full bg-white hover:bg-gray-100 disabled:opacity-50"
                        disabled={loading}
                    >
                        &lt; 이전 주
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">
                        {displayStart} ~ {displayEnd}
                    </h2>
                    <button 
                        onClick={handleNextWeek} 
                        className="p-2 border rounded-full bg-white hover:bg-gray-100 disabled:opacity-50"
                        disabled={loading}
                    >
                        다음 주 &gt;
                    </button>
                </div>
                
                <table className="min-w-full border-collapse border border-gray-300 bg-white shadow-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 border border-gray-300 text-sm font-semibold text-gray-700 w-24">상담 시간</th>
                            {weekDates.map((day) => (
                                <th key={day.dateStr} className="p-3 border border-gray-300 text-sm font-semibold text-gray-700">
                                    {day.display}
                                    <div className="text-xs font-normal text-gray-500">{day.dateStr.substring(5)}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TIME_SLOTS.map((timeSlot) => (
                            <tr key={timeSlot} className="hover:bg-gray-50">
                                <td className="p-3 border border-gray-300 font-medium text-gray-800 bg-gray-50 text-center">{timeSlot}</td>
                                {weekDates.map((day) => {
                                    // 3단계 로직 적용: mappedSchedule에서 예약 정보를 확인
                                    const reservation = mappedSchedule[day.dateStr]?.[timeSlot];
                                    const isReserved = !!reservation;
                                    
                                    // CSS 클래스 정리: 상태에 따라 추가되는 클래스만 남기고 나머지는 제거
                                    let cellClass = "cell-base"; // 모든 셀에 적용되는 기본 클래스
                                    let content = "";
                                    
                                    if (isReserved) {
                                        cellClass += " reserved-cell"; // 예약된 셀 클래스
                                        content = (
                                            <div className="reservation-indicator">
                                                <div 
                                                    className="reserved-dot tooltip"
                                                    title={`예약됨: ${reservation.purpose || '정보 없음'}`}
                                                ></div>
                                            </div>
                                        );
                                    } else {
                                        cellClass += " available-cell"; // 예약 가능 셀 클래스
                                        content = <span className="available-text">예약 가능</span>;
                                    }

                                    return (
                                        <td 
                                            key={`${day.dateStr}-${timeSlot}`} 
                                            // 기존 Tailwind 클래스 대신 일반 클래스를 사용
                                            className={cellClass}
                                            onClick={() => {
                                                console.log(`클릭된 시간: ${day.dateStr} ${timeSlot}`, isReserved ? `(예약됨 - ${reservation.purpose})` : '(예약 가능)');
                                            }}
                                        >
                                            {content}
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


    return (
        // 모든 Tailwind 클래스를 일반 클래스 이름으로 대체
        <div className="main-container">
            <div className="content-area">
                <h1 className="main-title">상담 시간표 조회 테스트 페이지</h1>
                
                {renderCalendarSchedule()}
            </div>
        </div>
    );
};

export default ScheduleTestPage;