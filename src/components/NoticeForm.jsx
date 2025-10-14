import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TITLE_MAX = 255;
const CONTENT_MAX = 2000;

function NoticeForm() {
  const { id } = useParams(); // 수정 시 공지 ID
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('공지'); // 기본값 "공지"
  const [author, setAuthor] = useState('');
  const isEdit = !!id;

  // 로그인된 사용자 정보 가져오기 (예: localStorage, context, API 등)
  useEffect(() => {
    // 예시: localStorage에 username이 저장되어 있다고 가정
    const username = localStorage.getItem('username');
    if (username) {
      setAuthor(username);
    }
  }, []);

  // 수정 폼일 때 기존 데이터 불러오기
  useEffect(() => {
    if (isEdit) {
      fetch(`http://localhost:8090/api/notice/${id}`)
        .then(res => res.json())
        .then(data => {
          setTitle(data.title || '');
          setContent(data.content || '');
          setType(data.type || '공지');
          // 작성자 정보도 불러오되, 로그인 정보가 있으면 우선 사용
          if (!localStorage.getItem('username')) {
            setAuthor(data.writer || '');
          }
        })
        .catch(() => {
          alert('공지사항 정보를 불러오지 못했습니다.');
          navigate('/notice');
        });
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEdit
        ? `http://localhost:8090/api/notice/${id}`
        : 'http://localhost:8090/api/notice';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          type,
          writer: author
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || (isEdit ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.'));
        navigate('/notice');
      } else {
        alert(data.message || (isEdit ? '공지사항 수정 실패' : '공지사항 등록 실패'));
      }
    } catch (err) {
      alert(isEdit ? '공지사항 수정 실패' : '공지사항 등록 실패');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h2>{isEdit ? '공지사항 수정' : '공지사항 등록'}</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            제목
          </label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={e => {
              if (e.target.value.length > TITLE_MAX) {
                alert(`제목은 최대 ${TITLE_MAX}자까지 입력 가능합니다.`);
                return;
              }
              setTitle(e.target.value);
            }}
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
            {title.length} / {TITLE_MAX}자
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            작성자
          </label>
          <input
            type="text"
            name="writer"
            value={author}
            readOnly
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
            value={content}
            onChange={e => {
              if (e.target.value.length > CONTENT_MAX) {
                alert(`내용은 최대 ${CONTENT_MAX}자까지 입력 가능합니다.`);
                return;
              }
              setContent(e.target.value);
            }}
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
            {content.length} / {CONTENT_MAX}자
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
            {isEdit ? '수정' : '등록'}
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

function NoticeList() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8090/api/notice')
      .then(res => res.json())
      .then(data => setNotices(data))
      .catch(() => setNotices([]));
  }, []);

  return (
    <div>
      <h2>공지사항</h2>
      <ul>
        {notices.map(notice => (
          <li key={notice.notice_id}>
            <span className={`notice-label ${getLabelClass(notice.type)}`}>
              {notice.type}
            </span>{' '}
            <strong>{notice.title}</strong>
            <div>{notice.content}</div>
            <small>{notice.created_at}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { NoticeForm, NoticeList };