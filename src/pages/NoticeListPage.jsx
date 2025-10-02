import React, { useEffect, useState } from "react";

function NoticeListPage() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8090/api/notice")
      .then((res) => res.json())
      .then((data) => setNotices(data))
    fetch('http://localhost:8090/api/notice')
      .then(res => res.json())
      .then(data => setNotices(data))
      .catch(() => setNotices([]));
  }, []);

  // 타입별 라벨 색상
  const getLabelClass = (type) => {
    if (type === '이벤트') return 'label-patch';
    return 'label-notice';
  };

  return (
    <div>
      <h2></h2>
      <ul>
        {notices.map((notice) => (
          <li key={notice.notice_id}>
            <strong>{notice.title}</strong>
            <div>{notice.content}</div>
            <small>{notice.created_at}</small>
          </li>
        ))}
      </ul>
    <div className="notice-list-container">
      <table className="notice-table">
        <tbody>
          {notices.map(notice => (
            <tr key={notice.notice_id || notice.title + notice.created_at}>
              <td style={{width: '110px'}}>
                <span className={`notice-label ${getLabelClass(notice.type)}`}>
                  {notice.type}
                </span>
              </td>
              <td className="notice-title">{notice.title}</td>
              <td className="notice-date">{notice.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NoticeListPage;
