import React, { useRef, useState } from "react";

function AiDiagnosisPage() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef();
    const videoRef = useRef();
    const canvasRef = useRef();
    const [showCamera, setShowCamera] = useState(false);

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
        try {
            const response = await fetch("/api/diagnosis/efficientnet", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setResult({ error: "진단 요청 실패" });
        }
        setLoading(false);
    };

    // 사이드바 마크업 제거, 메인 콘텐츠 영역만 남김
    return (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
            <h2>AI 피부 질환 진단</h2>
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
                <button onClick={handleDiagnose} disabled={loading}>
                    {loading ? "진단 중..." : "AI 진단하기"}
                </button>
            </div>
            {result && (
                <div className="result-card">
                    {result.error ? (
                        <div style={{ color: "red" }}>{result.error}</div>
                    ) : (
                        <>
                            <h2>진단 결과</h2>
                            <div className="result-item">
                                <span>진단명:</span> {result.aiResult?.diagnosis || "N/A"}
                            </div>
                            <div className="result-item">
                                <span>신뢰도:</span> <span className="confidence">{result.aiResult?.confidence || "N/A"}</span>
                            </div>
                            <div className="result-item">
                                <span>파일명:</span> {result.aiResult?.filename || "N/A"}
                            </div>
                            <div className="result-item">
                                <span>비고:</span> {result.aiResult?.note || "N/A"}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default AiDiagnosisPage;