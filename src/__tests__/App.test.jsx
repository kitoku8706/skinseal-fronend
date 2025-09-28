import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App 컴포넌트', () => {
  test('App이 정상적으로 렌더링된다', () => {
    render(<App />);
    // 예시: App에 특정 텍스트가 있는지 확인
    expect(screen.getByText(/skin/i)).toBeInTheDocument();
  });
});
