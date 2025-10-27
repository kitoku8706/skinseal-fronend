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

    // 진단 요청
    const handleDiagnose = async () => {
        setLoading(true);
        setResult(null);

        if (!userId || String(userId).trim() === "") {
            setLoading(false);
            setResult({ error: "User ID is required" });
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
        formData.append("userId", String(userId));
        try {
            const response = await fetch(`/api/diagnosis/${selectedModel}`, { method: "POST", body: formData });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setResult(data?.error ? { error: data.error } : { error: "진단 요청 실패" });
            } else {
                setResult(data);
            }
        } catch (err) {
            setResult({ error: "진단 요청 실패" });
        }
        setLoading(false);
    };

    // 결과 렌더링 유틸
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
                                <strong>{item.class}</strong>
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