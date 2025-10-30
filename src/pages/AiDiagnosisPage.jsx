import React, { useRef, useState, useEffect } from "react";
import "./AiDiagnosisPage.css";

function AiDiagnosisPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("efficientnet");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [agree, setAgree] = useState(false);
  const fileInputRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const [showCamera, setShowCamera] = useState(false);

  // ✅ 추가: 페이지 들어올 때마다 진단결과 초기화 (나머지 코드는 변경 없음)
  // ✅ 페이지 처음 들어올 때 한 번만 실행: 이전 진단 결과 초기화
  useEffect(() => {
    try {
      // 한 번만 초기화되도록 플래그 체크
      const alreadyCleared = sessionStorage.getItem("diagnosisCleared");
      if (!alreadyCleared) {
        localStorage.removeItem("latestDiagnosisResult");
        sessionStorage.setItem("diagnosisCleared", "true");
        console.log("✅ 이전 진단 결과 초기화 완료 (1회 실행)");
      }
    } catch (e) {
      console.warn("localStorage 초기화 실패:", e);
    }
  }, []);

  // ✅ 영어 → 한국어 변환 테이블
  const LABEL_KO_MAP = {
    Acne: "여드름",
    Actinic_Keratosis: "광선각화증",
    Benign_tumors: "양성 종양",
    Bullous: "수포성 질환",
    Candidiasis: "칸디다증(진균 감염)",
    DrugEruption: "약물발진",
    Eczema: "습진",
    Infestations_Bites: "기생충/벌레 물림",
    Lichen: "편평태선(리켄)",
    Lupus: "루푸스",
    Moles: "점",
    Psoriasis: "건선",
    Rosacea: "주사(로사체아)",
    Seborrh_Keratoses: "지루각화증",
    SkinCancer: "피부암",
    Sun_Sunlight_Damage: "광손상(태양 손상)",
    Tinea: "백선/무좀",
    Unknown_Normal: "정상/확인불가",
    Vascular_Tumors: "혈관종",
    Vasculitis: "혈관염",
    Vitiligo: "백반증",
    Warts: "사마귀",
  };

  // ✅ JWT payload 추출
  const decodeJwt = (token) => {
    try {
      const payload = token.split(".")[1];
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return null;
    }
  };

  // ✅ userId, username 자동 주입
  useEffect(() => {
    const tryExtract = () => {
      let uid = "";
      let uname = "";
      try {
        const directId =
          localStorage.getItem("userId") || sessionStorage.getItem("userId");
        if (directId) uid = directId;

        const directName =
          localStorage.getItem("username") ||
          sessionStorage.getItem("username");
        if (directName) uname = directName;

        const userStr =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          uid = uid || u?.id || u?.userId || "";
          uname = uname || u?.username || u?.name || u?.nickname || "";
        }

        const authStr =
          localStorage.getItem("auth") || sessionStorage.getItem("auth");
        if (authStr) {
          const a = JSON.parse(authStr);
          uid = uid || a?.id || a?.user?.id || a?.userId || "";
          uname =
            uname ||
            a?.username ||
            a?.user?.username ||
            a?.name ||
            a?.user?.name ||
            "";
        }

        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
          const payload = decodeJwt(token) || {};
          uid = uid || payload?.userId || payload?.id || "";
          uname =
            uname ||
            payload?.username ||
            payload?.name ||
            payload?.nickname ||
            "";
        }
      } catch (_) {}
      return { uid, uname };
    };
    const { uid, uname } = tryExtract();
    if (uid) setUserId(String(uid));
    if (uname) setUsername(String(uname));
  }, []);

  // ✅ 이하 나머지 기존 코드 전부 그대로
  const resolveUserId = async (rawId, rawUsername) => {
    if (rawId && /^\d+$/.test(String(rawId).trim()))
      return String(rawId).trim();
    if (!rawUsername) return null;
    try {
      const res = await fetch(
        `/member/user?username=${encodeURIComponent(rawUsername)}`
      );
      if (!res.ok) return null;
      const data = await res.json();
      const id = data?.id ?? data?.userId ?? data?.user?.id;
      return id ? String(id) : null;
    } catch (_) {
      return null;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleDiagnose = async () => {
    if (!agree) {
      alert("개인정보 수집에 동의 후 이용 가능합니다.");
      return;
    }

    setLoading(true);
    setResult(null);

    const resolvedId = await resolveUserId(userId, username);
    if (!resolvedId) {
      setLoading(false);
      alert("유효한 사용자 ID가 없습니다. 다시 로그인해주세요.");
      return;
    }

    const imageFile = fileInputRef.current?.files?.[0];
    if (!imageFile) {
      setLoading(false);
      alert("이미지를 업로드하거나 촬영해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("userId", resolvedId);

    try {
      const response = await fetch(`/api/diagnosis/${selectedModel}`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!response.ok) {
        console.error("진단 실패:", text);
        setResult({ error: data.error || "진단 요청 실패" });
      } else {
        console.log("진단 성공:", data);
        setResult(data);
      }
    } catch (err) {
      console.error("요청 오류:", err);
      setResult({ error: "요청 실패" });
    } finally {
      setLoading(false);
    }
  };

  const translateLabel = (label) => {
    if (!label) return "";
    const key = label.replace(/\s+/g, "_");
    return LABEL_KO_MAP[key] || LABEL_KO_MAP[label] || label;
  };

  return (
    <div className="ai-diagnosis-container">
      <h2>AI 피부 질환 진단</h2>

      {/* ✅ 이미지 업로드 */}
      <div className="upload-section">
        <div
          className="upload-box"
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: "pointer" }}
        >
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="선택된 이미지"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                borderRadius: "8px",
              }}
            />
          ) : (
            <>
              사진 첨부파일 등록
              <br />
              <span style={{ fontSize: "13px", color: "#f56c6c" }}>
                (JPG 형식만 업로드 가능)
              </span>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        <div className="upload-buttons">
          <button onClick={() => fileInputRef.current.click()}>
            사진 업로드
          </button>
        </div>
      </div>

      {/* ✅ 주의사항 안내 */}
      <div className="info-section">
        <p>
          <strong>주의사항 및 개인정보 동의</strong>
        </p>
        <ul>
          <li>업로드한 이미지는 진단 목적으로만 사용됩니다.</li>
          <li>AI 진단 결과는 참고용이며, 전문의의 진단을 대체하지 않습니다.</li>
        </ul>
      </div>

      {/* ✅ 동의 체크박스 */}
      <div className="agree-line">
        <input
          type="checkbox"
          id="agree"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        <label htmlFor="agree">개인정보 수집에 동의합니다.</label>
      </div>

      {/* ✅ 모델 선택 */}
      <div className="model-section model-center">
        <label htmlFor="model-select">진단 모델 선택:</label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="efficientnet">EfficientNet(8)</option>
          <option value="skin_model">Skin Model(21)</option>
          <option value="acne">Acne (Binary)</option>
        </select>
      </div>

      {/* ✅ 진단 버튼 */}
      <div className="diagnosis-button">
        <button onClick={handleDiagnose} disabled={loading || !selectedImage}>
          {loading ? "진단 중..." : "AI 진단하기"}
        </button>
      </div>

      {/* ✅ 결과 표시 */}
      {result && (
        <div className="result-box">
          <h4>진단 결과</h4>
          {result.results ? (
            <ul>
              {result.results.map((r, i) => (
                <li key={i}>
                  {translateLabel(r.class)} — {(r.probability * 100).toFixed(2)}
                  %
                </li>
              ))}
            </ul>
          ) : (
            <pre
              style={{
                background: "#f9f9f9",
                padding: "12px",
                borderRadius: "8px",
                whiteSpace: "pre-wrap",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default AiDiagnosisPage;
