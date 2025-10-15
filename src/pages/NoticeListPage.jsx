import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NoticeListPage.css";

function NoticeListPage() {
  const [notices, setNotices] = useState([]);
  const [role, setRole] = useState(""); // 역할 상태 추가
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/notice')
      .then(res => res.json())
      .then(data => {
        setNotices(data);
      })
      .catch(() => setNotices([]));

    // 예시: localStorage에서 role 가져오기 (실제 구현에 맞게 수정)
    const userRole = localStorage.getItem("role");
    setRole(userRole);
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

  // 제목 클릭 시 상세 페이지로 이동
  const handleTitleClick = (noticeId) => {
    navigate(`/notice/${noticeId}`);
  };

  return (
    <div>
      {/* 상단에 글쓰기 버튼: ADMIN만 보임 */}
      {role === "ADMIN" && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button className="notice-write-btn" onClick={handleWrite}>글쓰기</button>
        </div>
      )}
      <div className="notice-list-container">
        <table className="notice-table">
          <thead>
            <tr>
              <th style={{textAlign: 'left'}}>제목</th>
              <th>작성자</th>
              <th>조회수</th>
              <th>작성일</th>
              {role === "ADMIN" && <th>수정</th>}
            </tr>
          </thead>
          <tbody>
            {notices.map(notice => (
              <React.Fragment key={notice.notice_id || notice.title + notice.created_at}>
                <tr>
                  <td
                    className="notice-title"
                    style={{textAlign: 'left', cursor: 'pointer'}}
                    onClick={() => handleTitleClick(notice.noticeId)}
                  >
                    {/* 고정(핀) 표시 */}
                    {isPinned(notice) && <span className="pin-icon" title="고정">📌</span>}
                    {/* 제목 */}
                    <span>{notice.title}</span>
                    {/* 새글 표시 */}
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
      </div>
    </div>
  );
}

export default NoticeListPage;