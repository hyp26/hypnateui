import { useEffect, useState } from "react";
import api from "../lib/api";

interface Conversation {
  id: string;
  customerName?: string;
  lastMessage?: string;
}

export default function ConversationList({ onSelect }: { onSelect: (conversation: Conversation) => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchConversations = async () => {
      try {
        const res = await api.get("/api/conversations");
        if (active) setConversations(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        if (active) setError(err?.response?.data?.message || "Could not load conversations.");
      }
    };
    void fetchConversations();
    return () => { active = false; };
  }, []);

  return (
    <div style={{ width: "30%", borderRight: "1px solid #ccc" }}>
      {error && <p role="alert" style={{ padding: 10, color: "#b91c1c" }}>{error}</p>}
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          type="button"
          onClick={() => onSelect(conversation)}
          style={{ display: "block", width: "100%", padding: 10, textAlign: "left", cursor: "pointer", background: "transparent", border: 0 }}
        >
          <strong>{conversation.customerName || "Unknown customer"}</strong>
          <p>{conversation.lastMessage || "No messages yet"}</p>
        </button>
      ))}
    </div>
  );
}
