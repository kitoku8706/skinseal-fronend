import React, { useEffect, useState } from "react";

function NoticeListPage() {
  const [notices, setNotices] = useState([]);

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
  const isPinned = (notice) => notice.pinned; // 예시: pinned 필드가 true면 고정
  const isNew = (notice) => notice.is_new;    // 예시: is_new 필드가 true면 새글

  return (
    <div>
      <h2></h2>
      {/*
      <ul>
        {notices.map((notice) => (                // 리스트부분
          <li key={notice.notice_id}>
            <strong>{notice.title}</strong>
            <div>{notice.content}</div>
            <small>{notice.created_at}</small>
          </li>
        ))}
      </ul>
      */}
      <div className="notice-list-container">
        <table className="notice-table">
          <thead>
            <tr>
              <th style={{textAlign: 'left'}}>제목</th>
              <th>작성자</th>
              <th>조회수</th>
              <th>작성일</th>
            </tr>
          </thead>
          <tbody>
            {notices.map(notice => (
              <tr key={notice.notice_id || notice.title + notice.created_at}>
                <td className="notice-title" style={{textAlign: 'left'}}>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

export default NoticeListPage;