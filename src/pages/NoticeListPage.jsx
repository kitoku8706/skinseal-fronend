import React, { useEffect, useState } from "react";

function NoticeListPage() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8090/api/notice")
      .then((res) => res.json())
      .then((data) => setNotices(data))
      .catch(() => setNotices([]));
  }, []);

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
    </div>
  );
}

export default NoticeListPage;
