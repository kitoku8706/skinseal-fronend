import React, { useRef, useState, useEffect } from "react";

function AiDiagnosisPage() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState("efficientnet"); // 기본 모델 설정
    const [userId, setUserId] = useState("");
    const [username, setUsername] = useState("");
    const fileInputRef = useRef();
    const videoRef = useRef();
    const canvasRef = useRef();
    const [showCamera, setShowCamera] = useState(false);

    // JWT payload 추출 유틸 (서명 검증 없이 클라이언트 디코드)
    const decodeJwt = (token) => {
        try {
            const payload = token.split(".")[1];
            const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
            return JSON.parse(decodeURIComponent(escape(json)));
        } catch (_) { return null; }
    };

    // 다양한 저장소에서 userId/username 자동 주입 시도
    useEffect(() => {
        const tryExtract = () => {
            let uid = "";
            let uname = "";
            try {
                // direct 저장 값
                const directId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
                if (directId) uid = directId;

                const directName = localStorage.getItem("username") || sessionStorage.getItem("username");
                if (directName) uname = directName;

                // user 객체
                const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
                if (userStr) {
                    const u = JSON.parse(userStr);
                    uid = uid || u?.id || u?.userId || "";
                    uname = uname || u?.username || u?.name || u?.nickname || "";
                }

                // auth 객체
                const authStr = localStorage.getItem("auth") || sessionStorage.getItem("auth");
                if (authStr) {
                    const a = JSON.parse(authStr);
                    uid = uid || a?.id || a?.user?.id || a?.userId || "";
                    uname = uname || a?.username || a?.user?.username || a?.name || a?.user?.name || "";
                }

                // 토큰 페이로드
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                if (token) {
                    const payload = decodeJwt(token) || {};
                    uid = uid || payload?.userId || payload?.id || "";
                    uname = uname || payload?.username || payload?.name || payload?.nickname || "";
                }
            } catch (_) {}
            return { uid, uname };
        };
        const { uid, uname } = tryExtract();
        if (uid) setUserId(String(uid));
        if (uname) setUsername(String(uname));
    }, []);

    // 모델 변경 시 이전에 업로드/캡처한 이미지를 초기화하여 UI가 리셋되도록 처리
    useEffect(() => {
        // revoke object URL if one was created
        try {
            if (selectedImage && typeof selectedImage === 'string' && selectedImage.startsWith('blob:')) {
                URL.revokeObjectURL(selectedImage);
            }
        } catch (_) {}

        setSelectedImage(null);
        setResult(null);
        setLoading(false);

        // clear file input value so the same file can be re-selected if needed
        try {
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (_) {}

        // clear canvas if used
        try {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext && canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        } catch (_) {}

        // stop camera stream if it was running
        try {
            const video = videoRef.current;
            if (video && video.srcObject) {
                const tracks = video.srcObject.getTracks();
                tracks.forEach((t) => t.stop());
                video.srcObject = null;
            }
        } catch (_) {}

        setShowCamera(false);
    }, [selectedModel]);

    // 이미지 파일 업로드 핸들러
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
        }
    };

    // 카메라 켜기
    const handleOpenCamera = async () => {
        setShowCamera(true);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        }
    };

    // 사진 촬영
    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                setSelectedImage(URL.createObjectURL(blob));
            }, "image/jpeg");
        }
        // 카메라 종료
        if (video && video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
        }
        setShowCamera(false);
    };

    // helper: ensure we send numeric userId. If current userId looks non-numeric but username exists,
    // try to resolve via backend GET /member/user?username=... (expects JSON with id).
    const resolveUserId = async (rawId, rawUsername) => {
        if (rawId && /^\d+$/.test(String(rawId).trim())) return String(rawId).trim();
        if (!rawUsername) return null;
        try {
            const res = await fetch(`/member/user?username=${encodeURIComponent(rawUsername)}`);
            if (!res.ok) return null;
            const data = await res.json();
            // backend may return { id: 123, ... } or { userId: 123 }
            const id = data?.id ?? data?.userId ?? data?.user?.id;
            return id ? String(id) : null;
        } catch (_) {
            return null;
        }
    };

    // 진단 요청
    const handleDiagnose = async () => {
        setLoading(true);
        setResult(null);

        // resolve numeric userId
        const resolvedId = await resolveUserId(userId, username);
        console.log('[DEBUG] resolved userId:', resolvedId, 'raw userId:', userId, 'username:', username);
        if (!resolvedId) {
            setLoading(false);
            setResult({ error: '유효한 사용자 ID가 없습니다. 사용자 설정을 확인하세요.' });
            return;
        }

        let imageFile;
        if (fileInputRef.current && fileInputRef.current.files[0]) {
            imageFile = fileInputRef.current.files[0];
        } else if (canvasRef.current) {
            // 캡처된 이미지를 파일로 변환
            const canvas = canvasRef.current;
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg"));
            imageFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
        }
        if (!imageFile) {
            setLoading(false);
            alert("이미지를 업로드하거나 촬영해 주세요.");
            return;
        }
        // FormData로 API 전송
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("userId", String(resolvedId));

        // debug: log formData entries (can't log file contents fully)
        try {
            const entries = [];
            for (const pair of formData.entries()) {
                entries.push([pair[0], pair[1] && pair[1].name ? `(file:${pair[1].name})` : pair[1]]);
            }
            console.log('[DEBUG] formData entries before POST:', entries);
        } catch (e) {
            console.log('[DEBUG] failed to enumerate formData', e);
        }

        try {
            const response = await fetch(`/api/diagnosis/${selectedModel}`, { method: "POST", body: formData });
            // DEBUG: 서버가 text/html 또는 오류 HTML을 반환할 수 있으므로 먼저 텍스트로 받아 전체 내용을 로깅
            const text = await response.text();
            console.error('[DEBUG] diagnosis response text', response.status, text);
            let data = {};
            try {
                data = JSON.parse(text);
            } catch (e) {
                // JSON이 아니면 그대로 text로 처리
            }

            if (!response.ok) {
                console.error('[DEBUG] diagnosis response error', response.status, text);
                // 서버가 에러 메시지를 텍스트로 반환하는 경우도 있어 사용자가 볼 수 있게 포함
                setResult(data?.error ? { error: data.error } : { error: `진단 요청 실패: ${text}` });
            } else {
                console.log('[DEBUG] diagnosis success', data || text);
                setResult(Object.keys(data || {}).length ? data : { raw: text });
            }
        } catch (err) {
            console.error('[DEBUG] diagnosis request failed', err);
            setResult({ error: "진단 요청 실패" });
        }
        setLoading(false);
    };

    // 결과 렌더링 유틸
    // 영어 레이블을 한국어로 변환하는 매핑
    const LABEL_KO_MAP = {
        Acne: "여드름",
        Actinic_Keratosis: "광선각화증",
        Benign_tumors: "양성 종양",
        Bullous: "수포성 질환",
        Candidiasis: "칸디다증(진균 감염)",
        DrugEruption: "약물발진",
        Eczema: "습진",
        Infestations_Bites: "기생충/물림",
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
        Warts: "사마귀"
    };

    const getDisplayLabel = (label) => {
        if (!label && label !== 0) return "";
        const s = String(label).trim();
        if (LABEL_KO_MAP[s]) return LABEL_KO_MAP[s];
        const normalized = s.replace(/\s+/g, "_");
        if (LABEL_KO_MAP[normalized]) return LABEL_KO_MAP[normalized];
        // case-insensitive match
        const lower = s.toLowerCase();
        for (const k of Object.keys(LABEL_KO_MAP)) {
            if (k.toLowerCase() === lower || k.toLowerCase() === normalized.toLowerCase()) return LABEL_KO_MAP[k];
        }
        // 기본 폴백: 언더스코어를 공백으로 바꿔 보여줌
        return s.replace(/_/g, " ");
    };

    const renderResults = () => {
        if (!result) return null;
        if (result.error) return <div style={{ color: "red" }}>{result.error}</div>;
        const list = Array.isArray(result) ? result : result?.results || [];
        if (!Array.isArray(list) || list.length === 0) {
            return <pre>{JSON.stringify(result, null, 2)}</pre>;
        }
        return (
            <div>
                {list.map((item, idx) => {
                    const probNum = typeof item.probability === "string" ? parseFloat(item.probability) : (Number(item.probability) * 100 || 0);
                    return (
                        <div key={idx} style={{ marginBottom: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                                <strong>{getDisplayLabel(item.class)}</strong>
                                <span>{(probNum || 0).toFixed(2)}%</span>
                            </div>
                            <div style={{ height: 8, background: "#eee", borderRadius: 999 }}>
                                <div style={{ width: `${Math.max(0, Math.min(100, probNum || 0))}%`, height: "100%", background: "#4f46e5", borderRadius: 999 }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // 사이드바 마크업 제거, 메인 콘텐츠 영역만 남김
    return (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
            <h2>AI 피부 질환 진단</h2>

            {/* 모델 선택 드롭다운 */}
            <div style={{ marginBottom: 16 }}>
                <label htmlFor="model-select" style={{ marginRight: 8 }}>진단 모델 선택:</label>
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

            {/* 사용자 표시 (userId 대신 username 노출) */}
            <div style={{ marginBottom: 16 }}>
                <label htmlFor="username" style={{ marginRight: 8 }}>사용자:</label>
                <input
                    id="username"
                    type="text"
                    value={username || ""}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="로그인 사용자"
                    style={{ width: 240 }}
                    disabled
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                />
                <button onClick={() => fileInputRef.current.click()}>사진 업로드</button>
                <button onClick={handleOpenCamera} style={{ marginLeft: 8 }}>카메라로 촬영</button>
            </div>
            {selectedImage && (
                <div style={{ marginBottom: 16 }}>
                    <img src={selectedImage} alt="선택된 이미지" style={{ maxWidth: "100%", maxHeight: 300 }} />
                </div>
            )}
            {showCamera && (
                <div style={{ marginBottom: 16 }}>
                    <video ref={videoRef} autoPlay style={{ width: 300, height: 225, border: "1px solid #ccc" }} />
                    <br />
                    <button onClick={handleCapture}>촬영</button>
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>
            )}
            <div style={{ marginBottom: 16 }}>
                <button onClick={handleDiagnose} disabled={loading || (!selectedImage && !canvasRef.current)}>
                    {loading ? "진단 중..." : "AI 진단하기"}
                </button>
            </div>
            {result && (
                <div style={{ background: "#f9f9f9", padding: 16, borderRadius: 8 }}>
                    <h4>진단 결과</h4>
                    {renderResults()}
                </div>
            )}
        </div>
    );
}

export default AiDiagnosisPage;