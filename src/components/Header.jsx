import React from 'react';
import { useNavigate } from 'react-router-dom';
import skinSealLogo from '../assets/skinseal-logo.png';

function Header() {
  const navigate = useNavigate();

  return (
    <header style={{
      background: '#eee', 
      padding: '1rem',
      textAlign: 'center',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '80px', 
    }}>
      <img
        src={skinSealLogo}
        alt="Skin Seal 로고"
        style={{
          cursor: 'pointer',
          maxWidth: '300px', 
          height: 'auto',
        }}
        onClick={() => navigate('/')}
      />
    </header>
  );
}

export default Header;