import { useEffect, useState } from "react";
import axios from "axios";

export default function ConversationList({ onSelect }: any) {
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        const res = await axios.get("http://localhost:4000/api/conversations");
        setConversations(res.data);
    };

    return (
        <div style={{ width: "30%", borderRight: "1px solid #ccc" }}>
            {conversations.map((c: any) => (
                <div
                    key={c.id}
                    onClick={() => onSelect(c)}
                    style={{ padding: 10, cursor: "pointer" }}
                >
                    <strong>{c.customerName}</strong>
                    <p>{c.lastMessage}</p>
                </div>
            ))}
        </div>
    );
}