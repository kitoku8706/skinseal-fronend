import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

function NoticeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const didFetch = useRef(false);

  useEffect(() => {
    //조회수 증가
    if (didFetch.current) return;
    didFetch.current = true;

   // fetch(`/api/notice/${id}/view`, { method: 'POST' })
      //.then(() => fetch(`/api/notice/${id}`))
    fetch(`/api/notice/${id}`, { method: 'get' })
      .then(res => res.json())
      .then(data => setNotice(data))
      .catch(() => {
        alert("공지사항을 불러오지 못했습니다.");
        navigate("/notice");
      });
  }, [id, navigate]);

  if (!notice) return <div>로딩 중...</div>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2>{notice.title || '제목 없음'}</h2>
      <div style={{ color: "#888", marginBottom: 8 }}>
        작성자: {notice.writer || "공지"} | 작성일: {notice.createdAt.slice(0, 10) || '-'} | 조회수: {notice.views ?? 0}
      </div>
      <div style={{ whiteSpace: "pre-line", marginBottom: 24 }}>
        {notice.content || '내용이 없습니다.'}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => navigate("/notice")}>목록으로</button>
        <button
          className="notice-edit-btn"
          onClick={() => navigate(`/notice/edit/${notice.noticeId}`)}
        >
          수정
        </button>
      </div>
    </div>
  );
}

export default NoticeDetailPage;