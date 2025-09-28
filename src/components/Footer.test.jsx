import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer 컴포넌트', () => {
  test('푸터가 정상적으로 렌더링된다', () => {
    render(<Footer />);
    // 예시: 푸터에 특정 텍스트가 있는지 확인
    expect(screen.getByText(/Skin Front/i)).toBeInTheDocument();
  });
});
