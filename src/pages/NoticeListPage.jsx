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

  const ITEMS_PER_PAGE = 5;
  useEffect(() => {
    fetch("/api/notice")
      .then((res) => {
        if (!res.ok) {
          throw new Error("API 호출 실패");
        }
        return res.json();
      })
      .then((data) => {
        const noticeArray = Array.isArray(data)
          ? data
          : data.content || data.data || [];

        const sorted = [...noticeArray].sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        });
        setNotices(sorted);
      })
      .catch((error) => {
        console.error("공지사항 로드 실패:", error);
        setNotices([
          {
            noticeId: 1,
            title: "[테스트] 백엔드 서버를 실행해주세요",
            content: "Spring Boot 서버가 실행되지 않았습니다.",
            username: "시스템",
            views: 0,
            createdAt: new Date().toISOString(),
            pinned: true,
            is_new: true,
          },
        ]);
      });

    const userRole = localStorage.getItem("role");
    setRole(userRole);
  }, []);

  const getLabelClass = (type) => {
    if (type === "이벤트") return "label-patch";
    return "label-notice";
  };

  const isPinned = (notice) => notice.pinned;
  const isNew = (notice) => notice.is_new;

  const handleWrite = () => {
    navigate("/notice/write");
  };

  const handleEdit = (notice) => {
    const id = notice.noticeId || notice.notice_id;
    if (id) {
      navigate(`/notice/edit/${id}`);
    } else {
      alert("공지사항 ID를 찾을 수 없습니다.");
    }
  };
  const handleTitleClick = (noticeId) => {
    navigate(`/notice/${noticeId}`);
  };

  const handleSearch = () => {
    setPage(1);
  };

  const handleSearchReset = () => {
    setSearchQuery("");
    setSearchCategory("all");
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery, searchCategory]);

  const filteredNotices = notices.filter((notice) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const title = (notice.title || "").toLowerCase();
    const content = (notice.content || "").toLowerCase();
    const author = (notice.username || "관리자").toLowerCase();

    switch (searchCategory) {
      case "title":
        return title.includes(query);
      case "content":
        return content.includes(query);
      case "author":
        return author.includes(query);
      case "all":
      default:
        return (
          title.includes(query) ||
          content.includes(query) ||
          author.includes(query)
        );
    }
  });

  const totalPages = Math.ceil(filteredNotices.length / ITEMS_PER_PAGE);
  const paginatedNotices = filteredNotices.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div>
      <div className="notice-list-container">
        {/* 검색 영역 */}
        <div
          className="search-container"
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
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
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              검색
            </button>
            <button
              onClick={handleSearchReset}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f8fafc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              초기화
            </button>
          </div>
          {searchQuery && (
            <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
              검색결과: {filteredNotices.length}개 (전체 {notices.length}개 중)
            </div>
          )}
        </div>

        <table className="notice-table">
          <thead>
            <tr>
              <th style={{ textAlign: "center", width: "60px" }}>번호</th>
              <th style={{ textAlign: "left" }}>제목</th>
              <th>작성자</th>
              <th>조회수</th>
              <th>작성일</th>
              {role === "ADMIN" && <th>수정</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedNotices.length > 0 ? (
              paginatedNotices.map((notice, idx) => (
                <React.Fragment
                  key={notice.noticeId || `${notice.title}_${notice.createdAt}`}
                >
                  <tr>
                    <td style={{ textAlign: "center" }}>
                      {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                    </td>
                    <td
                      className="notice-title"
                      style={{ textAlign: "left", cursor: "pointer" }}
                      onClick={() => handleTitleClick(notice.noticeId)}
                    >
                      {isPinned(notice) && (
                        <span className="pin-icon" title="고정">
                          📌
                        </span>
                      )}
                      <span>{notice.title}</span>
                      {isNew(notice) && <span className="new-icon">N</span>}
                    </td>
                    <td className="notice-writer">
                      {notice.username || "관리자"}
                    </td>
                    <td className="notice-views">
                      <span
                        className="views-icon"
                        role="img"
                        aria-label="조회수"
                      >
                        👁️
                      </span>
                      {(notice.views || 0).toLocaleString()}
                    </td>
                    <td className="notice-date">
                      {notice.createdAt ? notice.createdAt.slice(0, 10) : "-"}
                    </td>
                    {role === "ADMIN" && (
                      <td>
                        <button
                          className="notice-edit-btn"
                          onClick={() => handleEdit(notice)}
                        >
                          수정
                        </button>
                      </td>
                    )}
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={role === "ADMIN" ? 6 : 5}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#666",
                  }}
                >
                  {searchQuery
                    ? "검색 결과가 없습니다."
                    : "등록된 공지사항이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ 페이지네이션 중앙 + 글쓰기 버튼 오른쪽 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "20px 0",
          }}
        >
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            {/* ✅ 푸른색 스타일 버튼으로 변경 */}
            <button
              onClick={handlePrev}
              disabled={page === 1}
              style={{
                marginRight: 8,
                backgroundColor: "#357ae8",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background 0.2s ease",
                opacity: page === 1 ? 0.6 : 1,
              }}
            >
              이전
            </button>

            <span
              style={{
                position: "relative",
                top: "3px",
                fontSize: "1rem",
                color: "#333",
              }}
            >
              {page} / {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={page === totalPages}
              style={{
                marginLeft: 8,
                backgroundColor: "#357ae8",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background 0.2s ease",
                opacity: page === totalPages ? 0.6 : 1,
              }}
            >
              다음
            </button>
          </div>

          {role === "ADMIN" && (
            <button
              className="notice-write-btn"
              onClick={handleWrite}
              style={{ marginLeft: "auto" }}
            >
              글쓰기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoticeListPage;
