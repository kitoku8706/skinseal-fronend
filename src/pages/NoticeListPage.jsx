import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function NoticeListPage() {
  const [notices, setNotices] = useState([]);
  const [openNoticeId, setOpenNoticeId] = useState(null); // 열려있는 공지 ID
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/notice')
      .then(res => res.json())
      .then(data => setNotices(data))
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
  const handleEdit = (noticeId) => {
    navigate(`/notice/edit/${noticeId}`);
  };

  // 제목 클릭 시 내용 토글
  const handleTitleClick = (noticeId) => {
    setOpenNoticeId(openNoticeId === noticeId ? null : noticeId);
  };

  return (
    <div>
      {/* 상단에 글쓰기 버튼 추가 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="notice-write-btn" onClick={handleWrite}>글쓰기</button>
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
                    {notice.views ? notice.views.toLocaleString() : '0'}
                  </td>
                  <td className="notice-date">{notice.created_at}</td>
                  <td>
                    <button className="notice-edit-btn" onClick={() => handleEdit(notice.notice_id)}>
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