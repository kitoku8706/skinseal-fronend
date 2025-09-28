import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header 컴포넌트', () => {
  test('헤더가 정상적으로 렌더링된다', () => {
    render(<Header />);
    // 예시: 헤더에 특정 텍스트가 있는지 확인
    expect(screen.getByText(/Skin Front/i)).toBeInTheDocument();
  });
});
