import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function NoticeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState({
    title: '',
    content: '',
    writer: ''
  });
  const [loading, setLoading] = useState(true);

  const TITLE_MAX = 255;
  const CONTENT_MAX = 2000;

  // 공지사항 데이터 로드
  useEffect(() => {
    if (id) {
      // 전체 공지사항 목록에서 해당 ID 찾기 (백엔드에 개별 조회 API가 없을 경우)
      fetch('/api/notice')
        .then(res => {
          if (!res.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다');
          }
          return res.json();
        })
        .then(data => {
          // 배열에서 해당 ID의 공지사항 찾기
          const foundNotice = data.find(notice => 
            notice.noticeId == id || notice.notice_id == id
          );
          
          if (foundNotice) {
            setNotice({
              title: foundNotice.title || '',
              content: foundNotice.content || '',
              writer: foundNotice.writer || '관리자'
            });
          } else {
            throw new Error('해당 공지사항을 찾을 수 없습니다');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('공지사항 로드 실패:', err);
          alert('공지사항을 불러오는데 실패했습니다: ' + err.message);
          navigate('/notice');
        });
    } else {
      // ID가 없으면 바로 공지사항 목록으로 이동
      alert('잘못된 접근입니다.');
      navigate('/notice');
    }
  }, [id, navigate]);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title" && value.length > TITLE_MAX) {
      alert(`제목은 최대 ${TITLE_MAX}자까지 입력 가능합니다.`);
      return;
    }
    if (name === "content" && value.length > CONTENT_MAX) {
      alert(`내용은 최대 ${CONTENT_MAX}자까지 입력 가능합니다.`);
      return;
    }

    setNotice(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!notice.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    if (!notice.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      // 백엔드에서 기대하는 형태로 데이터 구성
      const updateData = {
        noticeId: parseInt(id),
        title: notice.title.trim(),
        content: notice.content.trim(),
        writer: notice.writer.trim() || '관리자'
      };

      const response = await fetch(`/api/notice/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        alert('공지사항이 수정되었습니다.');
        navigate('/notice');
      } else {
        const errorText = await response.text();
        throw new Error(`수정 실패: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('수정 실패:', error);
      alert('공지사항 수정에 실패했습니다: ' + error.message);
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>로딩 중...</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h2>공지사항 수정</h2>
      
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            제목
          </label>
          <input
            type="text"
            name="title"
            value={notice.title}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 16
            }}
            placeholder="제목을 입력하세요"
          />
          <div style={{ fontSize: 13, color: '#888', marginTop: 4, textAlign: 'right' }}>
            {notice.title.length} / {TITLE_MAX}자
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            작성자
          </label>
          <input
            type="text"
            name="writer"
            value={notice.writer}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 16
            }}
            placeholder="작성자를 입력하세요"
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            내용
          </label>
          <textarea
            name="content"
            value={notice.content}
            onChange={handleChange}
            rows={10}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 16,
              resize: 'vertical'
            }}
            placeholder="내용을 입력하세요"
          />
          <div style={{ fontSize: 13, color: '#888', marginTop: 4, textAlign: 'right' }}>
            {notice.content.length} / {CONTENT_MAX}자
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            수정 완료
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/notice')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoticeEditPage;