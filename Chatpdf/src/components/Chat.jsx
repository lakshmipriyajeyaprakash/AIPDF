import { useState } from "react";

function renderLine(line, idx) {
  // Bullet point line starting with * or -
  const bulletMatch = line.match(/^[\*\-]\s+(.*)/);
  if (bulletMatch) {
    return <li key={idx} className="ml-4 list-disc">{renderInline(bulletMatch[1])}</li>;
  }
  return <p key={idx} className={line === "" ? "mt-2" : ""}>{renderInline(line)}</p>;
}

function renderInline(text) {
  // Handle **bold**
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

function renderText(text) {
  const lines = text.split("\n");
  const elements = [];
  let bulletGroup = [];

  lines.forEach((line, idx) => {
    const isBullet = /^[\*\-]\s+/.test(line);
    if (isBullet) {
      bulletGroup.push(renderLine(line, idx));
    } else {
      if (bulletGroup.length > 0) {
        elements.push(<ul key={`ul${idx}`} className="my-1 space-y-1">{bulletGroup}</ul>);
        bulletGroup = [];
      }
      elements.push(renderLine(line, idx));
    }
  });

  if (bulletGroup.length > 0) {
    elements.push(<ul key="ul-end" className="my-1 space-y-1">{bulletGroup}</ul>);
  }

  return elements;
}

function Chat() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!question.trim()) return;

    const userMessage = { role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      const botMessage = {
        role: "bot",
        text: response.ok ? data.answer : "Error: " + data.error,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Error connecting to server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Messages */}
      <div className="flex flex-col gap-3 p-4 flex-1 overflow-y-auto bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-10">
            Ask anything about your PDF...
          </p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`px-4 py-2 rounded-lg max-w-[80%] text-sm ${
              msg.role === "user"
                ? "bg-blue-600 text-white self-end"
                : "bg-gray-100 text-gray-800 self-start"
            }`}
          >
            {renderText(msg.text)}
          </div>
        ))}
        {loading && (
          <div className="bg-gray-100 text-gray-500 text-sm px-4 py-2 rounded-lg self-start">
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex border-t border-gray-300 bg-white">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          className="flex-1 px-4 py-3 text-sm outline-none"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-3 mx-2 my-2 rounded-lg hover:bg-blue-700 cursor-pointer transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
