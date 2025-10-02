import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  return (
    <header style={{background:'#eee', padding:'1rem', textAlign:'center'}}>
      <h1
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        Skin Seal
      </h1>
    </header>
  );
}
export default Header;