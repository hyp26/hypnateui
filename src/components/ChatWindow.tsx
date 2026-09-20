import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { io } from "socket.io-client";
import MessageInput from "./MessageInput";

export default function ChatWindow({ conversation }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socket = useMemo(() => io(process.env.REACT_APP_API_URL || window.location.origin, { withCredentials: true }), []);

  useEffect(() => {
    let active = true;
    if (!conversation) return () => { active = false; };

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/conversations/${conversation.id}/messages`);
        if (active) {
          setMessages(Array.isArray(res.data) ? res.data : []);
          setError(null);
        }
        socket.emit("join_conversation", conversation.id);
      } catch (err: any) {
        if (active) setError(err?.response?.data?.message || "Could not load messages.");
      }
    };

    void fetchMessages();
    return () => {
      active = false;
      socket.emit("leave_conversation", conversation.id);
    };
  }, [conversation, socket]);

  useEffect(() => {
    const handleMessage = (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("new_message", handleMessage);
    return () => { socket.off("new_message", handleMessage); socket.close(); };
  }, [socket]);

  if (!conversation) {
    return <div style={{ padding: 20 }}>Select a conversation</div>;
  }

  return (
    <div style={{ width: "70%", padding: 20 }}>
      <h2>{conversation.customerName || "Conversation"}</h2>
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation messages"
        style={{ height: "70vh", overflowY: "auto", border: "1px solid #ddd", padding: 10 }}
      >
        {messages.map((msg: any) => (
          <div key={msg.id} style={{ textAlign: msg.sender === "SELLER" ? "right" : "left", margin: "10px 0" }}>
            <span style={{ background: msg.sender === "SELLER" ? "#DCF8C6" : "#eee", padding: "8px 12px", borderRadius: 10, display: "inline-block" }}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <MessageInput conversationId={conversation.id} onSend={() => undefined} />
    </div>
  );
}
