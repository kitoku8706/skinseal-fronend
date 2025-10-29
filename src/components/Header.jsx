import React from "react";
import { useNavigate } from "react-router-dom";
import skinSealLogo from "../assets/skinseal-logo.png";

function Header() {
  const navigate = useNavigate();

  return (
    <header
      style={{
        background: "#ffffffff",
        padding: "2rem",
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "110px",
      }}
    >
      <img
        src={skinSealLogo}
        alt="Skin Seal 로고"
        style={{
          cursor: "pointer",
          maxWidth: "140px",
          height: "auto",
        }}
        onClick={() => navigate("/")}
      />
    </header>
  );
}

export default Header;
