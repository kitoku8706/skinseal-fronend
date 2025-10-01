import React, { useEffect, useState } from 'react';

function NoticeListPage() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8090/api/notice')
      .then(res => res.json())
      .then(data => setNotices(data))
      .catch(() => setNotices([]));
  }, []);
  // useEffect(() => {
  //   // 실제 서버 대신 더미 데이터로 테스트
  //   setNotices([
  //     { notice_id: 1, title: '공지사항 1', content: '공지 내용 1', created_at: '2025-10-01' },
  //     { notice_id: 2, title: '공지사항 2', content: '공지 내용 2', created_at: '2025-09-28' },
  //   ]);
  // }, []);

  return (
    <div>
      <h2></h2>
      <ul>
        {notices.map(notice => (
          <li key={notice.notice_id}>
            <strong>{notice.title}</strong>
            <div>{notice.content}</div>
            <small>{notice.created_at}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NoticeListPage;