import { useState } from "react";
import api from "../lib/api";

export default function MessageInput({ conversationId, onSend }: { conversationId: string; onSend: () => void }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const send = async () => {
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    setError(null);
    try {
      await api.post("/api/messages/send", { conversationId, text: message });
      setText("");
      onSend();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not send the message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <label htmlFor="conversation-message" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>Message</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          id="conversation-message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          disabled={sending}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
          style={{ flex: 1 }}
        />
        <button type="button" onClick={() => void send()} disabled={sending || !text.trim()}>
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
      {error && <p role="alert" style={{ marginTop: 6, color: "#b91c1c" }}>{error}</p>}
    </div>
  );
}
