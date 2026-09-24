import React, { useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, HelpCircle, Loader2, X } from "lucide-react";
import { StepField } from "./StepField";
import { inputStyle, fi, fo } from "./formStyles";
import { CHANNEL_CFG } from "../../data/channels";
import type { ModalType } from "../../types/onboarding";

interface ChannelModalProps {
    type: ModalType;
    onClose: () => void;
    onConnect: (type: string, data: any) => Promise<void>;
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

        if (type === "whatsapp" && (!phone.trim() || !apiKey.trim())) {
            setError("Phone number and API key are required.");
            return;
        }

        if (type === "telegram") {
            const token = botToken.trim();
            if (!token) {
                setError("Bot token is required.");
                return;
            }
            if (!/^\d{5,12}:[A-Za-z0-9_-]{20,}$/.test(token)) {
                setError("That does not look like a valid Telegram bot token. Copy the complete token from @BotFather.");
                return;
            }
        }

        setLoading(true);
        try {
            await onConnect(type, type === "whatsapp"
                ? { phone: phone.trim(), apiKey: apiKey.trim() }
                : type === "telegram"
                    ? { botToken: botToken.trim() }
                    : {}
            );
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || `Could not connect ${cfg.name}. Please check the details and try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 20,
                padding: "22px 22px 20px",
                width: "100%",
                maxWidth: 560,
                boxShadow: "0 24px 80px rgba(15,23,42,0.25)",
                maxHeight: "calc(100dvh - 40px)",
                overflowY: "auto",
                boxSizing: "border-box",
            }}
            className="ob-modal-sheet"
        >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0", margin: "0 auto 18px" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: cfg.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 18px ${cfg.glow}`, flexShrink: 0 }}>
                    <cfg.icon size={21} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>Connect {cfg.name}</h3>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "3px 0 0" }}>{cfg.desc}</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    style={{ width: 32, height: 32, borderRadius: 9, background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                    <X size={15} color="#64748b" />
                </button>
            </div>

            <div className="ob-channel-guide">
                <div className="ob-channel-guide-header">
                    <div className="ob-channel-guide-icon"><HelpCircle size={17} /></div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <strong>How to connect {cfg.name}</strong>
                        <span>Follow these steps to get the required account or credentials.</span>
                    </div>
                    {cfg.setupUrl && (
                        <a href={cfg.setupUrl} target="_blank" rel="noreferrer" className="ob-channel-guide-link">
                            {cfg.setupLabel || "Open guide"} <ExternalLink size={12} />
                        </a>
                    )}
                </div>
                <ol className="ob-channel-guide-steps">
                    {cfg.setupSteps.map((step, index) => (
                        <li key={step}>
                            <span>{index + 1}</span>
                            <p>{step}</p>
                        </li>
                    ))}
                </ol>
                {cfg.setupNote && (
                    <div className="ob-channel-guide-note">
                        <strong>Important:</strong> {cfg.setupNote}
                    </div>
                )}
            </div>

            {error && (
                <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, marginBottom: 14 }} role="alert">
                    <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: "#dc2626", margin: 0, lineHeight: 1.5 }}>{error}</p>
                </div>
            )}

            {type === "whatsapp" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <StepField label="Phone Number" required>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="+91 98765 43210" autoComplete="tel" onFocus={fi} onBlur={fo} />
                    </StepField>
                    <StepField label="WhatsApp Business API Key" required>
                        <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" style={{ ...inputStyle, fontFamily: "monospace" }} placeholder="EAAG..." autoComplete="off" onFocus={fi} onBlur={fo} />
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "5px 0 0" }}>Use the access token from your Meta Developer setup.</p>
                    </StepField>
                </div>
            )}

            {type === "telegram" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <StepField label="Telegram Bot Token" required>
                        <input value={botToken} onChange={(e) => setBotToken(e.target.value)} type="password" style={{ ...inputStyle, fontFamily: "monospace" }} placeholder="123456:ABC-DEF1234..." autoComplete="off" onFocus={fi} onBlur={fo} />
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "5px 0 0" }}>Paste the complete token generated by @BotFather.</p>
                    </StepField>
                </div>
            )}

            {(type === "instagram" || type === "facebook") && (
                <div style={{ display: "flex", gap: 9, padding: "11px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, fontSize: 12, color: "#1e3a8a", lineHeight: 1.5 }}>
                    <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>You will authorize the connection through Meta. Do not enter your social-media password into Hypnate.</span>
                </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button type="button" onClick={onClose} disabled={loading} style={{ flex: 1, padding: "11px 12px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleConnect}
                    disabled={loading}
                    style={{ flex: 2, padding: "11px 12px", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", background: cfg.gradient, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 16px ${cfg.glow}`, fontFamily: "inherit", opacity: loading ? 0.75 : 1 }}
                >
                    {loading ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> : null}
                    {loading ? "Connecting..." : type === "instagram" || type === "facebook" ? "Continue with Meta" : `Connect ${cfg.name}`}
                </button>
            </div>
        </div>
    );
};
