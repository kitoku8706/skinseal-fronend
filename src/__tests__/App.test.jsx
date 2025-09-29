import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import UserJoinPage from '../pages/UserJoinPage.jsx';
import UserLoginPage from '../pages/UserLoginPage.jsx';

describe('App 컴포넌트', () => {
  test('App이 정상적으로 렌더링된다', () => {
    render(<App />);
    // 예시: App에 특정 텍스트가 있는지 확인
    expect(screen.getByText(/skin/i)).toBeInTheDocument();
  });
});

describe('회원가입 페이지', () => {
  test('필수 입력값 미입력 시 에러 메시지 출력', async () => {
    render(<UserJoinPage />);
    fireEvent.click(screen.getByText('회원가입'));
    expect(await screen.findByText('모든 항목을 입력하세요.')).toBeInTheDocument();
  });
});

describe('로그인 페이지', () => {
  test('이메일/비밀번호 미입력 시 에러 메시지 출력', async () => {
    render(<UserLoginPage />);
    fireEvent.click(screen.getByText('로그인'));
    expect(await screen.findByText('이메일과 비밀번호를 모두 입력하세요.')).toBeInTheDocument();
  });
});