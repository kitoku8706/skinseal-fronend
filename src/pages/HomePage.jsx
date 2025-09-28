import { useEffect, useState } from 'react';
import { pingBackend } from '../api/testApi';

function HomePage() {
  const [result, setResult] = useState('');
  useEffect(() => {
    pingBackend()
      .then(setResult)
      .catch((error) => {
        const errorMsg = error?.message || error?.toString() || '알 수 없는 오류';
        setResult(`연동 실패: ${errorMsg}`);
      });
  }, []);
  return <div>홈페이지<br />백엔드 응답: {result}</div>;
}
export default HomePage;