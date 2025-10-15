import React, { useState, useRef, useEffect } from "react";
import "./ChatbotConsultPage.css";

function ChatbotConsultPage() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "안녕하세요! 무엇을 도와드릴까요?" }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    // 간단한 답변 예시 (실제 AI 연동은 별도 구현)
    setTimeout(() => {
      setMessages(msgs => [
        ...msgs,
        { from: "bot", text: "상담 내용을 확인했습니다. 담당자가 곧 답변드릴 예정입니다." }
      ]);
    }, 800);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
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
        <button onClick={handleSend}>전송</button>
      </div>
    </div>
  );
}

export default ChatbotConsultPage;