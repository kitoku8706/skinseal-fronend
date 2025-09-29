router.post('/kakao-login', async (req, res) => {
  const { email, nickname, kakao_id } = req.body;
  try {
    // 이메일로 기존 회원 조회
    let userResult = await pool.query('SELECT * FROM ss_user WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // 회원이 아니면 자동 회원가입
      await pool.query(
        'INSERT INTO ss_user (email, password, role, phone_number) VALUES ($1, $2, $3, $4)',
        [email, kakao_id, 'user', '']
      );
      userResult = await pool.query('SELECT * FROM ss_user WHERE email = $1', [email]);
    }
    const user = userResult.rows[0];
    res.json({ message: '카카오 로그인 성공', user_id: user.user_id, role: user.role });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});