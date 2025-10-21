import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NoticeListPage.css";

function NoticeListPage() {
  const [notices, setNotices] = useState([]);
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadNotices();
    const userRole = localStorage.getItem("role");
    setRole(userRole);
  }, [page, searchQuery, searchCategory]);

  const loadNotices = () => {
    // 페이지네이션 API 호출 (0-based)
    const apiPage = page - 1;
    const params = new URLSearchParams({
      page: apiPage,
      size: ITEMS_PER_PAGE
    });
    
    if (searchQuery && searchQuery.trim()) {
      params.append('keyword', searchQuery.trim());
    }
    
    if (searchCategory && searchCategory !== 'all') {
      params.append('type', searchCategory);
    }

    fetch(`/api/notice?${params}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('API 호출 실패');
        }
        return res.json();
      })
      .then(data => {
        // Spring Data Page 응답 구조
        setNotices(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      })
      .catch((error) => {
        console.error('공지사항 로드 실패:', error);
        setNotices([]);
        setTotalPages(0);
        setTotalElements(0);
      });
  };

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
  };  // 검색 기능 - 디바운싱 추가 (타이핑 후 500ms 대기)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // 검색어 변경 시 첫 페이지로
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, searchCategory]);

  const handleSearch = () => {
    setPage(1);
    loadNotices();
  };

  const handleSearchReset = () => {
    setSearchQuery("");
    setSearchCategory("all");
    setPage(1);
  };
  // 서버 사이드 페이지네이션 사용 - 필터링 로직 제거
  const paginatedNotices = notices; // 이미 서버에서 필터링/페이지네이션됨

  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setPage((prev) => Math.min(prev + 1, totalPages));
  return (
    <div>
      <div className="notice-list-container">
        {/* 검색 영역 */}
        <div className="search-container" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select 
              value={searchCategory} 
              onChange={(e) => setSearchCategory(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="all">전체</option>
              <option value="title">제목</option>
              <option value="content">내용</option>
              <option value="author">작성자</option>
            </select>
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{ 
                flex: 1, 
                minWidth: '200px', 
                padding: '8px 12px', 
                borderRadius: '4px', 
                border: '1px solid #ddd' 
              }}
            />
            <button 
              onClick={handleSearch}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              검색
            </button>
            <button 
              onClick={handleSearchReset}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              초기화
            </button>
          </div>
          {searchQuery && (
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              검색결과: {filteredNotices.length}개 (전체 {notices.length}개 중)
            </div>
          )}
        </div>

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
          </thead>          <tbody>
            {paginatedNotices.length > 0 ? (
              paginatedNotices.map((notice, idx) => (
                <React.Fragment key={notice.notice_id || `${notice.title}_${notice.created_at}`}>
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
              ))
            ) : (
              <tr>
                <td colSpan={role === "ADMIN" ? 6 : 5} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  {searchQuery ? '검색 결과가 없습니다.' : '등록된 공지사항이 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>        {/* 페이지네이션 중앙 + 글쓰기 버튼 오른쪽 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button onClick={handlePrev} disabled={page === 1} style={{ marginRight: 8 }}>
                이전
              </button>
              <span>
                {page} / {totalPages || 1}
              </span>
              <button onClick={handleNext} disabled={page >= totalPages} style={{ marginLeft: 8 }}>
                다음
              </button>
            </div>
            <div style={{ fontSize: "0.9em", color: "#666" }}>
              총 {totalElements}개의 공지사항
            </div>
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