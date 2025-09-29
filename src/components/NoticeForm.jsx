import React, { useState } from 'react';

function NoticeForm({ authorId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://localhost:8090/notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          author_id: authorId
        })
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert('공지사항 등록 실패');
    }
  };

  return (
    <div>
      <h2>공지사항 등록</h2>
      <input type="text" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea placeholder="내용" value={content} onChange={e => setContent(e.target.value)} />
      <button onClick={handleSubmit}>등록</button>
    </div>
  );
}

export default NoticeForm;