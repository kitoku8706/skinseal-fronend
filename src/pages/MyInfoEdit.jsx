import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/MyInfoEdit.css";

const formatPhoneNumber = (number) => {
  if (!number) return "";
  const cleanNumber = number.replace(/\D/g, "");
  return cleanNumber
    .replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")
    .replace(/--/g, "-");
};

function MyInfoEdit() {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    loginId: "로딩 중...",
    username: "로딩 중...",
    birth: "로딩 중...",
    phoneNumber: "",
    email: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("로그인 정보가 없습니다.");
      navigate("/login");
      return;
    }

    axios
      .get("http://18.210.20.169:8090/member/info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const data = response.data;
        const formattedPhoneNumber = formatPhoneNumber(data.phoneNumber);

        setUserInfo({
          loginId: data.loginId || "정보 없음",
          username: data.username || "정보 없음",
          birth: data.birth || "정보 없음",
          phoneNumber: formattedPhoneNumber,
          email: data.email || "",
        });
      })
      .catch((error) => {
        console.error("사용자 정보 로드 실패:", error);
        alert(
          "사용자 정보를 불러오는데 실패했습니다. 로그인 세션이 만료되었을 수 있습니다."
        );
        navigate("/login");
      });
  }, [navigate]);

  const handlePhoneNumberChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const formattedValue = formatPhoneNumber(rawValue);
    setUserInfo({ ...userInfo, phoneNumber: formattedValue });
  };

  const handleCancel = () => {
    navigate("/mypage");
  };

  const handleSave = async () => {
    const isPasswordChangeAttempt =
      newPassword || currentPassword || confirmNewPassword;

    if (isPasswordChangeAttempt) {
      if (newPassword !== confirmNewPassword) {
        alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        return;
      }
      if (!currentPassword) {
        alert("비밀번호 변경 시 현재 비밀번호를 입력해야 합니다.");
        return;
      }
    }

    const rawPhoneNumber = userInfo.phoneNumber.replace(/-/g, "");

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인 정보가 없습니다.");
      navigate("/login");
      return;
    }

    try {
      const updateData = {
        phoneNumber: rawPhoneNumber,
        email: userInfo.email,
        ...(isPasswordChangeAttempt && { currentPassword, newPassword }),
      };

      await axios.put("http://18.210.20.169:8090/member/update", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("회원정보가 수정되었습니다.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error(
        "정보 수정 실패:",
        error.response ? error.response.data : error.message
      );

      setCurrentPassword("");

      let errorMessage = "서버 오류가 발생했습니다.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        errorMessage = "현재 비밀번호가 일치하지 않거나 권한이 없습니다.";
      }

      alert("정보 수정 실패: " + errorMessage);
    }
  };

  return (
    <div className="info-edit-form">
      <div className="info-group">
        <label>아이디</label>
        <input type="text" value={userInfo.loginId + " (수정 불가)"} readOnly />
      </div>

      <div className="info-group">
        <label>이름</label>
        <input
          type="text"
          value={userInfo.username + " (수정 불가)"}
          readOnly
        />
      </div>

      <div className="info-group">
        <label>생년월일</label>
        <input type="text" value={userInfo.birth + " (수정 불가)"} readOnly />
      </div>

      <h3>비밀번호 변경</h3>
      <div className="info-group">
        <label>현재 비밀번호</label>
        <input
          type="password"
          placeholder="현재 비밀번호를 입력"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className="info-group">
        <label>새 비밀번호</label>
        <input
          type="password"
          placeholder="새 비밀번호"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="info-group">
        <label>비밀번호 확인</label>
        <input
          type="password"
          placeholder="새 비밀번호 확인"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
      </div>

      <div className="info-group">
        <label>전화번호</label>
        <input
          type="text"
          placeholder="예: 010-1234-5678"
          value={userInfo.phoneNumber}
          onChange={handlePhoneNumberChange}
          maxLength={13}
        />
      </div>
      <div className="info-group">
        <label>이메일</label>
        <input
          type="email"
          placeholder="이메일 주소"
          value={userInfo.email}
          onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
        />
      </div>

      <div className="button-actions">
        <button className="btn-cancel" onClick={handleCancel}>
          취소
        </button>
        <button className="btn-save" onClick={handleSave}>
          저장
        </button>
      </div>
    </div>
  );
}

export default MyInfoEdit;
