import { useEffect, useState } from "react";
import axios from "axios";
import MessageInput from "./MessageInput";
import { io } from "socket.io-client";

// 🔥 create socket (outside component)
const socket = io("http://localhost:4000");

export default function ChatWindow({ conversation }: any) {
    const [messages, setMessages] = useState<any[]>([]);

    // 🔥 Fetch messages when conversation changes
    useEffect(() => {
        if (conversation) {
            fetchMessages();

            // 🔥 join socket room
            socket.emit("join_conversation", conversation.id);
        }
    }, [conversation]);

    // 🔥 Fetch messages
    const fetchMessages = async () => {
        const res = await axios.get(
            `http://localhost:4000/api/conversations/${conversation.id}/messages`
        );
        setMessages(res.data);
    };

    // 🔥 Listen for real-time messages
    useEffect(() => {
        socket.on("new_message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.off("new_message");
        };
    }, []);

    if (!conversation) {
        return <div style={{ padding: 20 }}>Select a conversation</div>;
    }

    return (
        <div style={{ width: "70%", padding: 20 }}>
            <h3>{conversation.customerName}</h3>

            {/* 🔥 Messages */}
            <div
                style={{
                    height: "70vh",
                    overflowY: "scroll",
                    border: "1px solid #ddd",
                    padding: 10,
                }}
            >
                {messages.map((msg: any) => (
                    <div
                        key={msg.id}
                        style={{
                            textAlign: msg.sender === "SELLER" ? "right" : "left",
                            margin: "10px 0",
                        }}
                    >
                        <span
                            style={{
                                background: msg.sender === "SELLER" ? "#DCF8C6" : "#eee",
                                padding: "8px 12px",
                                borderRadius: 10,
                                display: "inline-block",
                            }}
                        >
                            {msg.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* 🔥 Input */}
            <MessageInput
                conversationId={conversation.id}
                onSend={() => { }} // no need to refetch now
            />
        </div>
    );
}