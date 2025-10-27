import React, { useEffect, useState } from 'react';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
}

function extractUser() {
  let uid = '';
  let uname = '';
  try {
    const directId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (directId) uid = directId;
    const directName = localStorage.getItem('username') || sessionStorage.getItem('username');
    if (directName) uname = directName;
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      uid = uid || u?.id || u?.userId || '';
      uname = uname || u?.username || u?.name || u?.nickname || '';
    }
    const authStr = localStorage.getItem('auth') || sessionStorage.getItem('auth');
    if (authStr) {
      const a = JSON.parse(authStr);
      uid = uid || a?.id || a?.user?.id || a?.userId || '';
      uname = uname || a?.username || a?.user?.username || a?.name || a?.user?.name || '';
    }
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      const payload = decodeJwt(token) || {};
      uid = uid || payload?.userId || payload?.id || '';
      uname = uname || payload?.username || payload?.name || payload?.nickname || '';
    }
  } catch (e) {}
  return { uid: String(uid || ''), uname: String(uname || '') };
}

export default function SelfDiagnosisResults() {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.6);

  useEffect(() => {
    const { uid, uname } = extractUser();
    if (uid) setUserId(uid);
    if (uname) setUsername(uname);
  }, []);

  const downloadBase64 = (b64, filename = 'gradcam.png') => {
    if (!b64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${b64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchHistory = async () => {
    if (!userId) {
      setError('사용자 ID가 없습니다. 로그인 후 다시 시도하세요.');
      return;
    }
    setLoading(true);
    setError(null);

    // AbortController를 사용해 타임아웃 처리 (긴 목록을 위해 30초로 연장)
    const ctl = new AbortController();
    const timeoutMs = 30000; // 30s
    const to = setTimeout(() => ctl.abort(), timeoutMs);

    try {
      // DEBUG: use direct Spring Boot URL to bypass Vite proxy
      const res = await fetch(`http://localhost:8090/api/diagnosis/history?userId=${encodeURIComponent(userId)}`, { signal: ctl.signal });
      clearTimeout(to);

      // 받아오는 내용을 먼저 text로 받아 전체를 확인한다 (대용량/비표준 JSON 방지)
      const text = await res.text();
      console.log('[DEBUG] history response status', res.status);
      console.log('[DEBUG] history response text (truncated 5000):', text ? text.slice(0, 5000) : '');

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        // 서버가 정상 JSON을 반환하지 않는 경우 대비: 공백 제거 후 재시도
        try {
          const compact = text.replace(/\n|\r/g, '');
          parsed = JSON.parse(compact);
        } catch (e2) {
          // 마지막으로, 응답 자체가 이미 JSON 문자열을 포함하고 있는 경우 파싱 시도
          try {
            // 예: '{"result":"[...]"}' 같은 형태
            const asObj = eval('(' + text + ')'); // fallback (디버그 전용) - 안전한 환경에서만 사용
            parsed = asObj;
          } catch (e3) {
            parsed = null;
          }
        }
      }

      // parsed를 items 배열 형태로 정규화
      let outItems = [];
      if (Array.isArray(parsed)) {
        outItems = parsed;
      } else if (parsed && Array.isArray(parsed.result)) {
        outItems = parsed.result;
      } else if (parsed && typeof parsed.result === 'string') {
        try {
          outItems = JSON.parse(parsed.result);
        } catch (_) {
          outItems = [parsed];
        }
      } else if (parsed) {
        outItems = [parsed];
      } else {
        // parsed가 null이면, 시도 삼아서 text가 JSON 배열로 보이면 eval로 변환
        try {
          const maybe = eval('(' + text + ')');
          outItems = Array.isArray(maybe) ? maybe : [maybe];
        } catch (_) {
          outItems = [];
        }
      }

      setItems(outItems);
    } catch (e) {
      if (e.name === 'AbortError') {
        setError(`이력 조회 타임아웃(${timeoutMs}ms). 서버가 응답하지 않거나 네트워크 문제가 있습니다.`);
      } else {
        setError('이력 조회 실패: ' + (e.message || e.toString()));
      }
      setItems([]);
    } finally {
      clearTimeout(to);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>자가 진단 결과</h2>
      <div style={{ marginBottom: 12 }}>
        <strong>사용자:</strong> {username || userId || '알 수 없음'}
        <button onClick={fetchHistory} style={{ marginLeft: 12 }}>새로고침</button>
      </div>

      {loading && <div>로딩 중...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && items.length === 0 && <div>저장된 진단 결과가 없습니다.</div>}

      <div>
        {items.map((it, idx) => {
          // it is expected to contain fields like userId, modelName, result (array) or raw
          const modelName = it.modelName || it.model || 'unknown';
          const created = it.createdAt || it.created_at || it.created || '';
          const resultArr = Array.isArray(it.result) ? it.result : (it?.aiResult?.result || it?.result);
          const top = Array.isArray(resultArr) && resultArr.length ? resultArr[0] : null;
          return (
            <div key={idx} style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{modelName} {top ? `- ${top.class || top.name || top.label}` : ''}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{created}</div>
                </div>
                <div>
                  <button onClick={() => setExpanded(expanded === idx ? null : idx)} style={{ marginRight: 8 }}>
                    {expanded === idx ? '닫기' : '상세 보기'}
                  </button>
                </div>
              </div>

              {expanded === idx && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>결과:</strong>
                    <div style={{ marginTop: 8 }}>
                      {Array.isArray(resultArr) ? (
                        resultArr.map((r, i) => (
                          <div key={i} style={{ marginBottom: 6 }}>
                            <div><strong>{r.class || r.label || r.name}</strong> <span style={{ color: '#666' }}>{r.probability || r.prob}</span></div>
                          </div>
                        ))
                      ) : (
                        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(it.result || it, null, 2)}</pre>
                      )}
                    </div>
                  </div>

                  {/* Grad-CAM rendering if base64 available */}
                  {(() => {
                    const grad = it.gradcam || it.aiResult?.gradcam || (typeof it === 'object' && it.gradcam ? it.gradcam : null);
                    const overlayB64 = grad?.overlay_base64 || it.overlay_base64 || it.overlayBase64 || null;
                    const heatmapB64 = grad?.heatmap_base64 || it.heatmap_base64 || it.heatmapBase64 || null;
                    if (!overlayB64 && !heatmapB64) return null;

                    return (
                      <div style={{ marginTop: 12 }}>
                        <strong>Grad-CAM</strong>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 8 }}>
                          <div style={{ position: 'relative', width: 320, height: 320, background: '#fafafa', border: '1px solid #eee' }}>
                            {/* If overlay exists, show it; otherwise show heatmap */}
                            {overlayB64 ? (
                              <img alt="overlay" src={`data:image/png;base64,${overlayB64}`} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: overlayOpacity }} />
                            ) : null}
                            {heatmapB64 && !overlayB64 ? (
                              <img alt="heatmap" src={`data:image/png;base64,${heatmapB64}`} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: overlayOpacity }} />
                            ) : null}
                            {/* If no base image available, show placeholder */}
                            <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: overlayB64 || heatmapB64 ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>원본 이미지 없음</div>
                          </div>
                          <div style={{ minWidth: 160 }}>
                            <div style={{ marginBottom: 8 }}>
                              <label style={{ fontSize: 13 }}>투명도: {Math.round(overlayOpacity * 100)}%</label>
                              <input type="range" min="0" max="1" step="0.05" value={overlayOpacity} onChange={(e) => setOverlayOpacity(Number(e.target.value))} style={{ width: '100%' }} />
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              {overlayB64 && <button onClick={() => downloadBase64(overlayB64, `overlay_${idx}.png`)}>오버레이 다운로드</button>}
                              {heatmapB64 && <button onClick={() => downloadBase64(heatmapB64, `heatmap_${idx}.png`)}>히트맵 다운로드</button>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div>
                    <details>
                      <summary>원본 JSON 보기</summary>
                      <pre style={{ maxHeight: 300, overflow: 'auto' }}>{JSON.stringify(it, null, 2)}</pre>
                    </details>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
