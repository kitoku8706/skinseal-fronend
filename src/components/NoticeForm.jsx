import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function NoticeForm({ authorId }) {
  const { id } = useParams(); // 수정 시 공지 ID
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('공지'); // 기본값 "공지"
  const isEdit = !!id;

  // 수정 폼일 때 기존 데이터 불러오기
  useEffect(() => {
    if (isEdit) {
      fetch(`http://localhost:8090/api/notice/${id}`)
        .then(res => res.json())
        .then(data => {
          setTitle(data.title || '');
          setContent(data.content || '');
          setType(data.type || '공지');
        })
        .catch(() => {
          alert('공지사항 정보를 불러오지 못했습니다.');
          navigate('/notice');
        });
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async () => {
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
          authorId
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
    <div>
      <h2>{isEdit ? '공지사항 수정' : '공지사항 등록'}</h2>
      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="공지">공지</option>
        <option value="이벤트">이벤트</option>
      </select>
      <input
        type="text"
        placeholder="제목"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        placeholder="내용"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <button onClick={handleSubmit}>{isEdit ? '수정' : '등록'}</button>
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