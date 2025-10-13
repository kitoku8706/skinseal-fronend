import "./Footer.css";
function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-links">이용약관 | 개인정보처리방침 | 채용정보</div>
      <div className="address-info">
        {" "}
        서울특별시 구로구 디지털로 34길 1106-7호(대륭포스트타워 3차) | 대표번호
        1515-0033
      </div>
      <div className="copyright-info">
        Copyright © 2025 SkinSeal Hospital. All Rights reserved.
      </div>
    </footer>
  );
}
export default Footer;
