import express from 'express';
import pool from './db';
import React, { useEffect, useState } from 'react';

const router = express.Router();

// GET /notice
router.get('/notice', async (req, res) => {
  const result = await pool.query('SELECT * FROM ss_notice ORDER BY created_at DESC');
  res.json(result.rows);
});

function NoticeListPage() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8090/notice')
      .then(res => res.json())
      .then(data => setNotices(data))
      .catch(() => setNotices([]));
  }, []);

  return (
    <div>
      <h2>공지사항 목록</h2>
      <ul>
        {notices.map(notice => (
          <li key={notice.notice_id}>
            <strong>{notice.title}</strong>
            <div>{notice.content}</div>
            <small>{notice.created_at}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NoticeListPage;