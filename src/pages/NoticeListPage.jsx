import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function NoticeListPage() {
  const [notices, setNotices] = useState([]);
  const [openNoticeId, setOpenNoticeId] = useState(null); // 열려있는 공지 ID
  const [viewCounts, setViewCounts] = useState({}); // 클라이언트 사이드 조회수 관리
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/notice')
      .then(res => res.json())
      .then(data => {
        setNotices(data);
        // 초기 조회수 설정 (localStorage에서 불러오기)
        const savedViewCounts = JSON.parse(localStorage.getItem('noticeViewCounts') || '{}');
        setViewCounts(savedViewCounts);
      })
      .catch(() => setNotices([]));
  }, []);

  // 타입별 라벨 색상
  const getLabelClass = (type) => {
    if (type === '이벤트') return 'label-patch';
    return 'label-notice';
  };

  // 고정(핀) 여부, 새글 여부 등은 notice 데이터에 따라 조건 추가
  const isPinned = (notice) => notice.pinned;
  const isNew = (notice) => notice.is_new;

  // 글쓰기 버튼 클릭 시 이동
  const handleWrite = () => {
    navigate('/notice/write');
  };

  // 수정 버튼 클릭 시 이동 (각 공지별)
  const handleEdit = (notice) => {
    const id = notice.noticeId || notice.notice_id;
    if (id) {
      navigate(`/notice/edit/${id}`);
    } else {
      alert('공지사항 ID를 찾을 수 없습니다.');
    }
  };

  // 제목 클릭 시 내용 토글 + 조회수 증가
  const handleTitleClick = async (noticeId) => {
    // 토글 처리
    const isOpening = openNoticeId !== noticeId;
    setOpenNoticeId(isOpening ? noticeId : null);
    
    // 열릴 때만 조회수 증가
    if (isOpening) {
      try {
        // 백엔드 API 시도
        const response = await fetch(`/api/notice/${noticeId}/view`, {
          method: 'POST'
        });
        
        if (response.ok) {
          console.log('✅ 백엔드 조회수 증가 성공');
          // 백엔드에서 성공하면 데이터 새로고침
          const listResponse = await fetch('/api/notice');
          const data = await listResponse.json();
          setNotices(data);
        } else {
          throw new Error('백엔드 API 실패');
        }
      } catch (error) {
        console.log('⚠️ 백엔드 API 실패, 클라이언트 사이드로 처리:', error.message);
        
        // 백엔드 실패 시 클라이언트 사이드에서 조회수 관리
        const newViewCounts = {
          ...viewCounts,
          [noticeId]: (viewCounts[noticeId] || 0) + 1
        };
        setViewCounts(newViewCounts);
        
        // localStorage에 저장
        localStorage.setItem('noticeViewCounts', JSON.stringify(newViewCounts));
        
        console.log(`📊 공지사항 ${noticeId} 조회수: ${newViewCounts[noticeId]}`);
      }
    }
  };

  return (
    <div>
      {/* 상단에 글쓰기 버튼 추가 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="notice-write-btn" onClick={handleWrite}>글쓰기</button>
        {/* 테스트용: 현재 조회수 상태 표시 */}
        <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>조회수 테스트 중 - 제목 클릭해보세요!</span>
          {Object.keys(viewCounts).length > 0 && (
            <span>현재 조회수: {JSON.stringify(viewCounts)}</span>
          )}
          <button 
            onClick={() => {
              setViewCounts({});
              localStorage.removeItem('noticeViewCounts');
              console.log('🔄 조회수 초기화됨');
            }}
            style={{ padding: '4px 8px', fontSize: '10px' }}
          >
            조회수 초기화
          </button>
        </div>
      </div>
      <div className="notice-list-container">
        <table className="notice-table">
          <thead>
            <tr>
              <th style={{textAlign: 'left'}}>제목</th>
              <th>작성자</th>
              <th>조회수</th>
              <th>작성일</th>
              <th>수정</th>
            </tr>
          </thead>
          <tbody>
            {notices.map(notice => (
              <React.Fragment key={notice.notice_id || notice.title + notice.created_at}>
                <tr>
                  <td
                    className="notice-title"
                    style={{textAlign: 'left', cursor: 'pointer'}}
                    onClick={() => handleTitleClick(notice.notice_id)}
                  >
                    {/* 고정(핀) 표시 */}
                    {isPinned(notice) && <span className="pin-icon" title="고정">📌</span>}
                    {/* 제목 */}
                    <span>{notice.title}</span>
                    {/* 새글 표시 */}
                    {isNew(notice) && <span className="new-icon">N</span>}
                  </td>
                  <td className="notice-writer">{notice.writer || '공지'}</td>
                  <td className="notice-views">
                    <span className="views-icon" role="img" aria-label="조회수">👁️</span>
                    {/* 백엔드 조회수 또는 클라이언트 사이드 조회수 표시 */}
                    {(notice.views || viewCounts[notice.noticeId || notice.notice_id] || 0).toLocaleString()}
                  </td>
                  <td className="notice-date">{notice.created_at}</td>
                  <td>
                    <button className="notice-edit-btn" onClick={() => handleEdit(notice)}>
                      수정
                    </button>
                  </td>
                </tr>
                {openNoticeId === notice.notice_id && (
                  <tr>
                    <td colSpan={5} style={{background: "#f9f9f9", padding: "16px"}}>
                      <div style={{whiteSpace: "pre-line"}}>{notice.content}</div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NoticeListPage;