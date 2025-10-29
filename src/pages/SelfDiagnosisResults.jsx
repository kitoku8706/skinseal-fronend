import React, { useEffect, useState } from 'react';
import './SelfDiagnosisResults.css';


// API base URL from environment. Set VITE_API_BASE to e.g. 'http://localhost:8090' on other machines.
const API_BASE = import.meta.env.VITE_API_BASE || '';


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


// 질환명을 한국어로 변환하는 유틸
function translateDiseaseName(name) {
  if (!name) return '알 수 없음';
  const key = String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
  const map = {
    'acne': '여드름',
    'nonacne': '비여름',
    'eczema': '습진',
    'lupus': '루푸스',
    'bullous': '수포성 질환',
    'vitiligo': '백반증',
    'rosacea': '주사(로사케아)',
    'actinickeratosis': '광선각화증',
    'benigntumors': '양성 종양',
    'skincancer': '피부암',
    'skincancerjpg': '피부암'
  };
  return map[key] || name;
}


export default function SelfDiagnosisResults() {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.6);
  const [selectedModel, setSelectedModel] = useState('efficientnet');


  useEffect(() => {
    const { uid, uname } = extractUser();
    if (uid) setUserId(uid);
    if (uname) setUsername(uname);
  }, []);


  const normalizeModelName = (s) => (String(s || '').toLowerCase().replace(/\s|[-_]/g, ''));
  const matchesModel = (it, modelKey) => {
    const modelCandidates = [it.modelName, it.model, it.model_name, it.aiResult?.modelName, it.aiResult?.model];
    return modelCandidates.some(m => normalizeModelName(m) === normalizeModelName(modelKey));
  };


  const getCreatedTime = (it) => {
    const created = it.createdAt || it.created_at || it.created || it.createdDate || '';
    const t = Date.parse(created);
    return Number.isFinite(t) ? t : 0;
  };

  // 날짜/시간을 'YYYY-MM-DD HH:mm' 형태로 포맷합니다.
  const formatDateTime = (input) => {
    try {
      const s = String(input || '').trim();
      if (!s) return '';
      const d = Number.isFinite(Number(s)) ? new Date(Number(s)) : new Date(s);
      if (isNaN(d.getTime())) return s;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch (e) {
      return String(input || '');
    }
  };

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


    const ctl = new AbortController();
    const timeoutMs = 30000; // 30s
    const to = setTimeout(() => ctl.abort(), timeoutMs);


    try {
      // Use the new lightweight endpoint that returns the single latest record
      const url = `${API_BASE}/api/diagnosis/latest?userId=${encodeURIComponent(userId)}&modelName=${encodeURIComponent(selectedModel)}`;
      const res = await fetch(url, { signal: ctl.signal });
      clearTimeout(to);


      const text = await res.text();
      console.log('[latest] status', res.status, 'len', text?.length);


      if (!res.ok) {
        // try to surface server error message
        let parsedErr = null;
        try { parsedErr = JSON.parse(text); } catch (e) { parsedErr = text; }
        throw new Error(`HTTP ${res.status} ${JSON.stringify(parsedErr)}`);
      }


      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        try {
          const compact = text.replace(/\n|\r/g, '');
          parsed = JSON.parse(compact);
        } catch (e2) {
          parsed = null;
        }
      }


      let outItems = [];
      if (parsed && !Array.isArray(parsed)) {
        // single-object response expected
        outItems = [parsed];
      } else if (Array.isArray(parsed) && parsed.length > 0) {
        outItems = [parsed[0]]; // defensive: take first
      } else {
        outItems = [];
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
  }, [userId, selectedModel]);


  return (
    <div className="sdr-container" style={{ fontSize: '110%' }}>
      <h2 className="sdr-title">자가 진단 결과</h2>
      <div className="sdr-userline">
        <strong>사용자:</strong> {username || userId || '알 수 없음'}
        <button onClick={fetchHistory} className="sdr-button">새로고침</button>
      </div>


      <div className="sdr-controls">
        <label><strong>모델 선택:</strong></label>
        <select value={selectedModel} onChange={(e) => { setSelectedModel(e.target.value); setExpanded(null); }}>
          <option value="efficientnet">efficientnet</option>
          <option value="skin_model">skin_model</option>
          <option value="acne">acne</option>
        </select>
      </div>


      {loading && <div>로딩 중...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}


      {!loading && items.length === 0 && <div>저장된 진단 결과가 없습니다.</div>}


      <div className="sdr-results">
        {(!loading && items.length > 0) ? (() => {
          const filtered = items.filter(it => matchesModel(it, selectedModel));
          if (filtered.length === 0) return <div>{selectedModel} 모델로 저장된 진단 결과가 없습니다.</div>;
          const sorted = filtered.slice().sort((a, b) => getCreatedTime(b) - getCreatedTime(a));


          return (
            <div>
              <div className="sdr-results-header">
                <div className="sdr-col-created">진단일시</div>
                <div className="sdr-col-model">진단모델명</div>
                <div className="sdr-col-result">진단결과</div>
                <div style={{ width: 110 }}></div>
              </div>


              {sorted.map((it, idx) => {
                const modelName = it.modelName || it.model || 'unknown';
                const createdRaw = it.createdAt || it.created_at || it.created || it.createdDate || '';
                const created = formatDateTime(createdRaw);
                const resultArrRaw = Array.isArray(it.result) ? it.result : (it?.aiResult?.result || it?.result);


                // 저장 구조가 [ { userId:..., result:[{class,probability}, ...], modelName:... } ] 처럼
                // wrapper 배열 안에 실제 result 배열이 들어있는 경우를 처리합니다.
                let resultArr = null;
                if (Array.isArray(resultArrRaw)) {
                  if (resultArrRaw.length > 0 && Array.isArray(resultArrRaw[0]?.result)) {
                    resultArr = resultArrRaw[0].result;
                  } else {
                    resultArr = resultArrRaw;
                  }
                } else if (resultArrRaw && Array.isArray(resultArrRaw.result)) {
                  resultArr = resultArrRaw.result;
                } else {
                  resultArr = resultArrRaw;
                }

                // 상위 1개 결과를 분해해서 판단명과 가능성으로 처리
                let resName = '';
                let resProb = '';
                let resIsString = false;
                let resString = '';
                if (Array.isArray(resultArr) && resultArr.length > 0) {
                  const top = resultArr[0];
                  resName = translateDiseaseName(top?.class || top?.name || top?.label || '알 수 없음');
                  resProb = top?.probability || top?.prob || '';
                } else if (typeof resultArr === 'string' && resultArr.trim()) {
                  resIsString = true;
                  resString = resultArr;
                } else if (resultArr && typeof resultArr === 'object') {
                  resName = translateDiseaseName(resultArr.class || resultArr.name || resultArr.label || '알 수 없음');
                  resProb = resultArr.probability || resultArr.prob || '';
                } else {
                  resIsString = true;
                  resString = '결과 없음';
                }


                return (
                  <div className="sdr-row-wrapper" key={idx}>
                    <div className="sdr-row">
                      <div className="sdr-col-created">{created}</div>
                      <div className="sdr-col-model">{modelName}</div>
                      <div className="sdr-col-result">
                        {resIsString ? (
                          <div style={{ whiteSpace: 'pre-wrap' }}>{resString}</div>
                        ) : (
                          <>
                            <div>판단명 : {resName}</div>
                            <div>가능성 : {resProb}</div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="sdr-row-footer">
                      <button className="sdr-button" onClick={() => setExpanded(expanded === idx ? null : idx)}>
                        {expanded === idx ? '닫기' : '상세 보기'}
                      </button>
                    </div>


                    {expanded === idx && (
                      <div className="sdr-details">
                        <div style={{ marginBottom: 8 }}>
                          <strong>결과:</strong>
                          <div style={{ marginTop: 8 }}>
                            {Array.isArray(resultArr) ? (
                              resultArr.map((r, i) => (
                                <div key={i} style={{ marginBottom: 6 }}>
                                  <div><strong>{translateDiseaseName(r.class || r.label || r.name)}</strong> <span style={{ color: '#666' }}>{r.probability || r.prob}</span></div>
                                </div>
                              ))
                            ) : (
                              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(it.result || it, null, 2)}</pre>
                            )}
                          </div>
                        </div>


                        {(() => {
                          const grad = it.gradcam || it.aiResult?.gradcam || (typeof it === 'object' && it.gradcam ? it.gradcam : null);
                          const overlayB64 = grad?.overlay_base64 || it.overlay_base64 || it.overlayBase64 || null;
                          const heatmapB64 = grad?.heatmap_base64 || it.heatmap_base64 || it.heatmapBase64 || null;
                          if (!overlayB64 && !heatmapB64) return null;


                          return (
                            <div className="sdr-gradcam">
                              <div className="sdr-imgbox">
                                {overlayB64 ? (
                                  <img alt="overlay" src={`data:image/png;base64,${overlayB64}`} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: overlayOpacity }} />
                                ) : null}
                                {heatmapB64 && !overlayB64 ? (
                                  <img alt="heatmap" src={`data:image/png;base64,${heatmapB64}`} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: overlayOpacity }} />
                                ) : null}
                                <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: overlayB64 || heatmapB64 ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>원본 이미지 없음</div>
                              </div>
                              <div style={{ minWidth: 160 }}>
                                <div style={{ marginBottom: 8 }}>
                                  <label style={{ fontSize: 13 }}>투명도: {Math.round(overlayOpacity * 100)}%</label>
                                  <input type="range" min="0" max="1" step="0.05" value={overlayOpacity} onChange={(e) => setOverlayOpacity(Number(e.target.value))} style={{ width: '100%' }} />
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  {overlayB64 && <button className="sdr-button" onClick={() => downloadBase64(overlayB64, `overlay_${idx}.png`)}>오버레이 다운로드</button>}
                                  {heatmapB64 && <button className="sdr-button" onClick={() => downloadBase64(heatmapB64, `heatmap_${idx}.png`)}>히트맵 다운로드</button>}
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
          );
        })() : null}
      </div>
    </div>
  );
}



