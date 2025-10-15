import React, { useState, useRef, useEffect } from "react";
import "./ChatbotConsultPage.css";

const quickReplies = [
  { label: "상담문의", value: "상담문의" },
  { label: "예약문의", value: "예약문의" },
  { label: "오시는길", value: "오시는길" },
  { label: "주의사항", value: "주의사항" },
  { label: "AI진단하기", value: "AI진단하기" },
];

function ChatbotConsultPage() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "안녕하세요! 무엇을 도와드릴까요?" }
  ]);
  const [input, setInput] = useState("");
  const [showQuick, setShowQuick] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (msg) => {
    const userMsg = msg || input;
    if (!userMsg.trim()) return;
    setMessages([...messages, { from: "user", text: userMsg }]);
    setShowQuick(false);
    // 간단한 답변 예시 (실제 AI 연동은 별도 구현)
    setTimeout(() => {
      setMessages(msgs => [
        ...msgs,
        { from: "bot", text: `"${userMsg}"에 대한 답변을 준비 중입니다.` }
      ]);
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
      <div className="chatbot-header">AI 챗봇 간편상담</div>
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chatbot-message ${msg.from === "user" ? "user" : "bot"}`}
          >
            {msg.text}
          </div>
        ))}
        {/* 빠른 선택 박스: 첫 메시지 이후에만 노출 */}
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
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={() => handleSend()}>전송</button>
      </div>
    </div>
  );
}

export default ChatbotConsultPage;