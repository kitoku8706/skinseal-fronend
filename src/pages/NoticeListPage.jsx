import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NoticeListPage.css";

function NoticeListPage() {
  const [notices, setNotices] = useState([]);
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetch('/api/notice')
      .then(res => res.json())
      .then(data => {
        // 작성일 기준 최신순 정렬
        const sorted = [...data].sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        });
        setNotices(sorted);
      })
      .catch(() => setNotices([]));

    const userRole = localStorage.getItem("role");
    setRole(userRole);
  }, []);

  const getLabelClass = (type) => {
    if (type === '이벤트') return 'label-patch';
    return 'label-notice';
  };

  const isPinned = (notice) => notice.pinned;
  const isNew = (notice) => notice.is_new;

  const handleWrite = () => {
    navigate('/notice/write');
  };

  const handleEdit = (notice) => {
    const id = notice.noticeId || notice.notice_id;
    if (id) {
      navigate(`/notice/edit/${id}`);
    } else {
      alert('공지사항 ID를 찾을 수 없습니다.');
    }
  };

  const handleTitleClick = (noticeId) => {
    navigate(`/notice/${noticeId}`);
  };

  // 페이지네이션 관련
  const totalPages = Math.ceil(notices.length / ITEMS_PER_PAGE);
  const paginatedNotices = notices.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div>
      <div className="notice-list-container">
        <table className="notice-table">
          <thead>
            <tr>
              <th style={{textAlign: 'center', width: '60px'}}>번호</th>
              <th style={{textAlign: 'left'}}>제목</th>
              <th>작성자</th>
              <th>조회수</th>
              <th>작성일</th>
              {role === "ADMIN" && <th>수정</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedNotices.map((notice, idx) => (
              <React.Fragment key={notice.notice_id || notice.title + notice.created_at}>
                <tr>
                  <td style={{textAlign: 'center'}}>
                    {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                  </td>
                  <td
                    className="notice-title"
                    style={{textAlign: 'left', cursor: 'pointer'}}
                    onClick={() => handleTitleClick(notice.noticeId)}
                  >
                    {isPinned(notice) && <span className="pin-icon" title="고정">📌</span>}
                    <span>{notice.title}</span>
                    {isNew(notice) && <span className="new-icon">N</span>}
                  </td>
                  <td className="notice-writer">{notice.username || '관리자'}</td>
                  <td className="notice-views">
                    <span className="views-icon" role="img" aria-label="조회수">👁️</span>
                    {(notice.views || 0).toLocaleString()}
                  </td>
                  <td className="notice-date">
                    {notice.createdAt ? notice.createdAt.slice(0, 10) : '-'}
                  </td>
                  {role === "ADMIN" && (
                    <td>
                      <button className="notice-edit-btn" onClick={() => handleEdit(notice)}>
                        수정
                      </button>
                    </td>
                  )}
                </tr>               
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {/* 페이지네이션 중앙 + 글쓰기 버튼 오른쪽 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0" }}>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <button onClick={handlePrev} disabled={page === 1} style={{ marginRight: 8 }}>
              이전
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button onClick={handleNext} disabled={page === totalPages} style={{ marginLeft: 8 }}>
              다음
            </button>
          </div>
          {role === "ADMIN" && (
            <button className="notice-write-btn" onClick={handleWrite} style={{ marginLeft: "auto" }}>
              글쓰기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoticeListPage;