import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import "./SelfDiagnosisResults.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
}

function extractUser() {
  let uid = "";
  let uname = "";
  try {
    const directId =
      localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (directId) uid = directId;
    const directName =
      localStorage.getItem("username") || sessionStorage.getItem("username");
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
        uname || payload?.username || payload?.name || payload?.nickname || "";
    }
  } catch (e) {}
  return { uid: String(uid || ""), uname: String(uname || "") };
}

function translateDiseaseName(name) {
  if (!name) return "알 수 없음";
  const key = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const map = {
    acne: "여드름",
    nonacne: "비여름",
    eczema: "습진",
    lupus: "루푸스",
    bullous: "수포성 질환",
    vitiligo: "백반증",
    rosacea: "주사(로사케아)",
    actinickeratosis: "광선각화증",
    benigntumors: "양성 종양",
    skincancer: "피부암",
    skincancerjpg: "피부암",
  };
  return map[key] || name;
}

export default function SelfDiagnosisResults() {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState("efficientnet");
  const navigate = useNavigate(); // ✅ 추가

  useEffect(() => {
    const { uid, uname } = extractUser();
    if (uid) setUserId(uid);
    if (uname) setUsername(uname);
  }, []);

  const normalizeModelName = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/\s|[-_]/g, "");
  const matchesModel = (it, modelKey) => {
    const modelCandidates = [
      it.modelName,
      it.model,
      it.model_name,
      it.aiResult?.modelName,
      it.aiResult?.model,
    ];
    return modelCandidates.some(
      (m) => normalizeModelName(m) === normalizeModelName(modelKey)
    );
  };

  const getCreatedTime = (it) => {
    const created =
      it.createdAt || it.created_at || it.created || it.createdDate || "";
    const t = Date.parse(created);
    return Number.isFinite(t) ? t : 0;
  };

  const formatDateTime = (input) => {
    try {
      const s = String(input || "").trim();
      if (!s) return "";
      const d = Number.isFinite(Number(s)) ? new Date(Number(s)) : new Date(s);
      if (isNaN(d.getTime())) return s;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch (e) {
      return String(input || "");
    }
  };

  const fetchHistory = async () => {
    if (!userId) {
      setError("사용자 ID가 없습니다. 로그인 후 다시 시도하세요.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE}/api/diagnosis/latest?userId=${encodeURIComponent(
        userId
      )}&modelName=${encodeURIComponent(selectedModel)}`;
      const res = await fetch(url);
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const parsed = JSON.parse(text);

      // ✅ 프론트에서 최신(createdAt) 데이터만 표시하도록 수정
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sorted = parsed.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setItems([sorted[0]]); // ✅ 가장 최근 1건만 유지
      } else {
        setItems([parsed]);
      }
    } catch (e) {
      setError("이력 조회 실패: " + (e.message || e.toString()));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchHistory();
  }, [userId, selectedModel]);

  return (
    <div className="sdr-container" style={{ fontSize: "110%" }}>
      <h2 className="sdr-title">자가 진단 결과</h2>

      {/* ✅ 사용자 + 모델 한 줄 */}
      <div className="sdr-userinfo">
        <span>
          <strong>사용자:</strong> {username || userId || "알 수 없음"}
        </span>
        <span>
          <strong>모델:</strong> {selectedModel}
        </span>
      </div>

      {loading && <div>로딩 중...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!loading && items.length === 0 && (
        <div>저장된 진단 결과가 없습니다.</div>
      )}

      <div className="sdr-results">
        {!loading && items.length > 0
          ? (() => {
              const filtered = items.filter((it) =>
                matchesModel(it, selectedModel)
              );
              if (filtered.length === 0)
                return (
                  <div>{selectedModel} 모델로 저장된 진단 결과가 없습니다.</div>
                );
              const sorted = filtered
                .slice()
                .sort((a, b) => getCreatedTime(b) - getCreatedTime(a));

              return (
                <div>
                  <div className="sdr-results-header">
                    <div className="sdr-col-created">진단일시</div>
                    <div className="sdr-col-model">진단모델명</div>
                    <div className="sdr-col-result">진단결과</div>
                    <div className="sdr-col-detail">상세결과</div>
                  </div>

                  {sorted.map((it, idx) => {
                    const modelName = it.modelName || it.model || "unknown";
                    const created = formatDateTime(it.createdAt);
                    const resultArr = Array.isArray(it.result)
                      ? it.result
                      : it?.aiResult?.result || [];
                    const top = resultArr[0] || {};
                    return (
                      <div className="sdr-row-wrapper" key={idx}>
                        <div className="sdr-row">
                          <div className="sdr-col-created">{created}</div>
                          <div className="sdr-col-model">{modelName}</div>
                          <div className="sdr-col-result">
                            판단명 :{" "}
                            {translateDiseaseName(
                              top.class || top.name || top.label
                            )}
                            <br />
                            가능성 : {top.probability || top.prob || "-"}
                          </div>
                          <div className="sdr-col-detail">
                            {Array.isArray(resultArr) &&
                            resultArr.length > 0 ? (
                              resultArr.slice(0, 5).map((r, i) => (
                                <div key={i}>
                                  {translateDiseaseName(
                                    r.class || r.label || r.name
                                  )}{" "}
                                  {r.probability || r.prob}
                                </div>
                              ))
                            ) : (
                              <div>결과 없음</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          : null}
      </div>

      {/* ✅ 기존 문구 유지 */}
      <p className="latest-result">
        💡 사용자의 <b>가장 최근 진단결과</b>를 불러옵니다.
      </p>

      {/* ✅ 추가: 버튼 3개 (오류 안전버전 포함) */}
      <div className="sdr-button-area">
        <button
          className="sdr-consult-btn"
          onClick={() => navigate("/consult")}
        >
          1:1 상담하기
        </button>

        <button
          className="sdr-back-btn"
          onClick={() => navigate("/ai/diagnose")}
        >
          뒤로가기
        </button>

        {/* ✅ 추가: 결과 삭제 (오류 안전버전) */}
        <button
          className="sdr-delete-btn"
          onClick={() => {
            if (window.confirm("현재 진단 결과를 삭제하시겠습니까?")) {
              try {
                localStorage.removeItem("latestDiagnosisResult");
                alert("진단 결과가 삭제되었습니다. 새로운 진단을 시작합니다.");
                setTimeout(() => {
                  navigate("/ai/diagnose");
                  setTimeout(() => setItems([]), 0);
                }, 100);
              } catch (e) {
                console.warn("localStorage 접근 실패:", e);
                alert("삭제 중 오류가 발생했습니다.");
              }
            }
          }}
        >
          결과 삭제
        </button>
      </div>
    </div>
  );
}
