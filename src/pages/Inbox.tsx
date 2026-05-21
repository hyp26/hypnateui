import { useState } from "react";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";

export default function Inbox() {
    const [selectedConversation, setSelectedConversation] = useState<any>(null);

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* LEFT */}
            <ConversationList onSelect={setSelectedConversation} />

            {/* RIGHT */}
            <ChatWindow conversation={selectedConversation} />
        </div>
    );
}