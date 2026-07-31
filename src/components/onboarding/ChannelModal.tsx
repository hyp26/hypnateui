import React, { useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { StepField } from "./StepField";
import { inputStyle, fi, fo } from "./formStyles";
import { CHANNEL_CFG } from "../../data/channels";
import type { ModalType } from "../../types/onboarding";

interface ChannelModalProps {
    type: ModalType;
    onClose: () => void;
    onConnect: (type: string, data: any) => void;
}

export const ChannelModal: React.FC<ChannelModalProps> = ({ type, onClose, onConnect }) => {
    const [phone, setPhone] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [botToken, setBotToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!type) return null;
    const cfg = CHANNEL_CFG[type];

    const handleConnect = async () => {
        setError("");
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        try {
            if (type === "whatsapp") {
                if (!phone || !apiKey) {
                    setError("Phone and API key are required");
                    setLoading(false);
                    return;
                }
                onConnect("whatsapp", { phone, apiKey });
            } else if (type === "telegram") {
                if (!botToken || !botToken.includes(":")) {
                    setError("Invalid bot token format");
                    setLoading(false);
                    return;
                }
                onConnect("telegram", { botToken });
            } else {
                onConnect(type, { mock: true });
            }
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "24px 20px", width: "100%", maxWidth: 480, boxShadow: "0 -8px 40px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }} className="ob-modal-sheet">
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0", margin: "0 auto 20px" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: cfg.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 18px ${cfg.glow}`, flexShrink: 0 }}>
                    <cfg.icon size={20} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>Connect {cfg.name}</h3>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{cfg.desc}</p>
                </div>
                <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: "#f8fafc", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <X size={14} color="#64748b" />
                </button>
            </div>

            {error && (
                <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, marginBottom: 14 }}>
                    <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{error}</p>
                </div>
            )}

            {type === "whatsapp" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ padding: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, fontSize: 13, color: "#166534", lineHeight: 1.6 }}>
                        You need a Facebook Business Manager account and a number not registered on WhatsApp personal.
                    </div>
                    <StepField label="Phone Number" required>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="+91 98765 43210" onFocus={fi} onBlur={fo} />
                    </StepField>
                    <StepField label="WhatsApp Business API Key" required>
                        <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ ...inputStyle, fontFamily: "monospace" }} placeholder="EAAG..." onFocus={fi} onBlur={fo} />
                        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Found in your Meta Developer Portal.</p>
                    </StepField>
                </div>
            )}
            {type === "telegram" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ padding: 12, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, fontSize: 13, color: "#0c4a6e", lineHeight: 1.6 }}>
                        Message <strong>@BotFather</strong> on Telegram, type <code>/newbot</code>, follow the steps, and paste your token below.
                    </div>
                    <StepField label="Bot Token" required>
                        <input value={botToken} onChange={(e) => setBotToken(e.target.value)} style={{ ...inputStyle, fontFamily: "monospace" }} placeholder="123456:ABC-DEF1234..." onFocus={fi} onBlur={fo} />
                    </StepField>
                </div>
            )}
            {(type === "instagram" || type === "facebook") && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ padding: 12, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, fontSize: 13, color: "#1e3a8a", lineHeight: 1.6 }}>
                        We need permission to manage your Pages and read messages to automate replies.
                    </div>
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>You will be redirected to {type === "instagram" ? "Instagram" : "Facebook"} to authorize Hypnate.</p>
                </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={onClose} style={{ flex: 1, padding: "11px 12px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                    Cancel
                </button>
                <button
                    onClick={handleConnect}
                    disabled={loading}
                    style={{ flex: 2, padding: "11px 12px", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", background: cfg.gradient, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 16px ${cfg.glow}`, fontFamily: "inherit" }}
                >
                    {loading ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> : null}
                    {type === "instagram" || type === "facebook" ? `Continue with ${type === "instagram" ? "Instagram" : "Facebook"}` : "Connect"}
                </button>
            </div>
        </div>
    );
};