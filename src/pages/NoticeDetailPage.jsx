import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./NoticeDetailPage.css"; // 스타일 파일 import

function NoticeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [role, setRole] = useState("");
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    fetch(`/api/notice/${id}`, { method: 'get' })
      .then(res => res.json())
      .then(data => setNotice(data))
      .catch(() => {
        alert("공지사항을 불러오지 못했습니다.");
        navigate("/notice");
      });

    const userRole = localStorage.getItem("role");
    setRole(userRole);
  }, [id, navigate]);

  if (!notice) return <div>로딩 중...</div>;

  return (
    <div className="notice-detail-container">
      <h2 className="notice-detail-title">{notice.title || '제목 없음'}</h2>
      <div className="notice-detail-meta">
        작성자: {notice.writer || "공지"} | 작성일: {notice.createdAt?.slice(0, 10) || '-'} | 조회수: {notice.views ?? 0}
      </div>
      <div className="notice-detail-content">
        {notice.content || '내용이 없습니다.'}
      </div>
      <div className="notice-detail-actions">
        <button className="notice-list-btn" onClick={() => navigate("/notice")}>목록으로</button>
        {role === "ADMIN" && (
          <button
            className="notice-edit-btn"
            onClick={() => navigate(`/notice/edit/${notice.noticeId}`)}
          >
            수정
          </button>
        )}
      </div>
    </div>
  );
}

export default NoticeDetailPage;