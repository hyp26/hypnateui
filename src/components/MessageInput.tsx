import { useState } from "react";
import axios from "axios";

export default function MessageInput({ conversationId, onSend }: any) {
    const [text, setText] = useState("");

    const send = async () => {
        if (!text) return;

        await axios.post("http://localhost:4000/api/messages/send", {
            conversationId,
            text,
        });

        setText("");
        onSend(); // refresh messages
    };

    return (
        <div style={{ marginTop: 10 }}>
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type message..."
            />
            <button onClick={send}>Send</button>
        </div>
    );
}