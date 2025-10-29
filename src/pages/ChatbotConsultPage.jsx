import React, { useState, useRef, useEffect } from "react";
import "./ChatbotConsultPage.css";

const quickReplies = [
  { label: "상담문의", value: "상담문의" },
  { label: "예약문의", value: "예약문의" },
  { label: "오시는길", value: "오시는길" },
  { label: "주의사항", value: "주의사항" },
  { label: "AI진단하기", value: "AI진단하기" },
];

const INITIAL_MESSAGES = [
  { from: "bot", text: "안녕하세요! 무엇을 도와드릴까요?" },
];

function ChatbotConsultPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [showQuick, setShowQuick] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleGoToMain = () => {
    setMessages(INITIAL_MESSAGES);
    setShowQuick(true);
  };

  const handleSend = (msg) => {
    const userMsg = msg || input;
    if (!userMsg.trim()) return;
    setMessages([...messages, { from: "user", text: userMsg }]);
    setShowQuick(false);

    let botResponse = `"${userMsg}"에 대한 답변을 준비 중입니다. 잠시만 기다려주세요.`;

    if (userMsg === "상담문의") {
      botResponse = `상담은 세 명의 상담사 중 선택하실 수 있습니다. 자세한 상담을 원하시면 <a href="/reservation/consult">여기</a>를 선택해주세요.`;
    } else if (userMsg === "예약문의") {
      botResponse = `예약은 <a href="/reservation/timetable">온라인 예약 페이지</a> 로 확인 가능합니다. 예약 가능한 시간을 확인해보세요.`;
    } else if (userMsg === "오시는길") {
      botResponse = `저희 사무실은 구로 디지털 단지 역에서 도보 5분 거리에 위치해 있습니다. 자세한 주소는 <a href="/directions">여기</a>를 참고해주세요.`;
    } else if (userMsg === "주의사항") {
      botResponse =
        "이 서비스는 챗봇이 제공하는 간편 상담이며, 최종적인 법적 또는 전문적인 판단은 반드시 전문가와 직접 상담하시기 바랍니다.";
    } else if (userMsg === "AI진단하기") {
      botResponse = `AI 진단 서비스는 별도 페이지에서 진행됩니다. 로그인 상태인지 확인하고 <a href="/ai/diagnose">여기</a>를 참고해주세요.`;
    }

    setTimeout(() => {
      setMessages((msgs) => [...msgs, { from: "bot", text: botResponse }]);
    }, 800);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleQuickReply = (value) => {
    handleSend(value);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        챗봇 간편상담
        <button className="main-reset-btn" onClick={handleGoToMain}>
          🏠 메인으로
        </button>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chatbot-message ${
              msg.from === "user" ? "user" : "bot"
            }`}
          >
            <span dangerouslySetInnerHTML={{ __html: msg.text }} />

            {msg.from === "bot" &&
              idx === messages.length - 1 &&
              !showQuick && (
                <button className="goto-main-btn" onClick={handleGoToMain}>
                  처음으로 돌아가기 (메인)
                </button>
              )}
          </div>
        ))}
        {showQuick && (
          <div className="chatbot-quick-replies">
            {quickReplies.map((item) => (
              <button
                key={item.value}
                className="quick-reply-btn"
                onClick={() => handleQuickReply(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="chatbot-input-area">
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={() => handleSend()}>전송</button>
      </div>
    </div>
  );
}

export default ChatbotConsultPage;
