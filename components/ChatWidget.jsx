import React, { useState, useEffect } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello — I am the IGNITIA Assistant. How can I assist you today?",
    },
  ]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const saved = localStorage.getItem("ignitia_chat");
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("ignitia_chat", JSON.stringify(messages));
    } catch {}
  }, [messages, mounted]);

  const reply = (text) => {
    const t = text.toLowerCase();

    if (t.includes("event"))
      return "You can explore all events on the Events page.";
    if (t.includes("ticket"))
      return "Tickets can be purchased securely using Razorpay.";
    if (t.includes("login"))
      return "You can log in using the Login page at the top.";
    if (t.includes("contact"))
      return "You can contact us through the Contact page.";
    if (t.includes("hello") || t.includes("hi"))
      return "Hello! How can I help you today?";

    return "I can help with Events, Tickets, Venue, Schedule and Registration.";
  };

  const send = () => {
    if (!input.trim()) return;
    const text = input.trim();

    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");

    setTimeout(
      () =>
        setMessages((m) => [...m, { from: "bot", text: reply(text) }]),
      500
    );
  };

  const onKey = (e) => e.key === "Enter" && send();

  if (!mounted) return null;

  return (
    <div className="chat-root">
      {/* Preview Bubble */}
      {!open && (
        <div className="preview">
          <div className="bubble" onClick={() => setOpen(true)}>
            <span>Hi, how can I assist you?</span>
            <button className="close">×</button>
          </div>
        </div>
      )}

      {/* Avatar Button */}
      <button className="avatar" onClick={() => setOpen(!open)}>
        {/* chat logo */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="black"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3" y="6" width="18" height="14" rx="3" fill="black" />
          <rect x="7" y="10" width="3" height="3" rx="1" fill="#FFD75A" />
          <rect x="14" y="10" width="3" height="3" rx="1" fill="#FFD75A" />
        </svg>
      </button>

      {/* Chat Panel */}
      <div className={`panel ${open ? "open" : ""}`}>
        <div className="panel-header">
          <span>IGNITIA Assistant</span>
          <button className="panel-close" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>

        <div className="panel-body">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.from}`}>
              {m.text}
            </div>
          ))}
        </div>

        <div className="panel-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type a message..."
          />
          <button onClick={send}>Send</button>
        </div>
      </div>

      <style jsx>{`
        .chat-root {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        /* Preview bubble */
        .preview {
          animation: fadeIn 0.4s ease;
        }
        .bubble {
          background: #0b0b0b;
          border: 2px solid #ffd75a;
          color: white;
          padding: 12px 18px;
          border-radius: 12px;
          display: flex;
          gap: 10px;
          align-items: center;
          cursor: pointer;
        }
        .close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
        }

        /* Avatar Button */
        .avatar {
          width: 62px;
          height: 62px;
          border-radius: 50%;
          background: #ffd75a;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.45);
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0);
          }
        }

        /* Panel */
        .panel {
          width: 360px;
          max-width: calc(100vw - 40px);
          background: #0b0b0b;
          border-radius: 14px;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          transform: scale(0.85) translateY(10px);
          transition: 0.25s ease;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
        }
        .panel.open {
          opacity: 1;
          transform: scale(1) translateY(0);
          pointer-events: auto;
        }

        .panel-header {
          background: #ffd75a;
          color: black;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          font-weight: 600;
        }
        .panel-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }

        .panel-body {
          max-height: 260px;
          overflow-y: auto;
          padding: 12px;
        }

        .msg {
          padding: 10px 12px;
          margin-bottom: 10px;
          border-radius: 10px;
          font-size: 14px;
        }
        .msg.bot {
          background: rgba(255, 215, 90, 0.1);
          color: #ffd75a;
        }

        .msg.user {
          background: rgba(255, 255, 255, 0.04);
          color: #ffffff;
          align-self: flex-end;
        }

        .panel-input {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.03);
        }

        .panel-input input {
          flex: 1;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.04);
          background: #0b0b0b;
          color: #fff;
        }

        .panel-input button {
          background: #ffd75a;
          border: none;
          padding: 10px 14px;
          border-radius: 8px;
          cursor: pointer;
          color: #000;
          font-weight: 600;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
