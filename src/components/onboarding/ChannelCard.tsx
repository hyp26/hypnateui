import React from "react";
import { Check } from "lucide-react";
import type { ChannelConfig } from "../../types/onboarding";

interface ChannelCardProps {
    cfg: ChannelConfig;
    connected: boolean;
    onClick: () => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ cfg, connected, onClick }) => {
    const Icon = cfg.icon;
    return (
        <button
            onClick={onClick}
            style={{
                padding: "16px 12px 14px",
                borderRadius: 16,
                border: `1.5px solid ${connected ? "transparent" : "#f1f5f9"}`,
                background: connected ? cfg.gradient : "#fff",
                cursor: connected ? "default" : "pointer",
                transition: "all 0.25s",
                position: "relative",
                textAlign: "center",
                boxShadow: connected ? `0 8px 24px ${cfg.glow}` : "0 2px 8px rgba(0,0,0,0.04)",
                fontFamily: "inherit",
                width: "100%",
            }}
            onMouseEnter={(e) => {
                if (!connected) {
                    const b = e.currentTarget;
                    b.style.borderColor = "#0d9488";
                    b.style.boxShadow = "0 8px 24px rgba(13,148,136,0.1)";
                    b.style.transform = "translateY(-2px)";
                }
            }}
            onMouseLeave={(e) => {
                if (!connected) {
                    const b = e.currentTarget;
                    b.style.borderColor = "#f1f5f9";
                    b.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    b.style.transform = "translateY(0)";
                }
            }}
        >
            {cfg.badge && !connected && (
                <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#0d9488,#34d399)", color: "#fff", fontSize: 8, fontWeight: 800, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {cfg.badge}
                </div>
            )}
            {connected && (
                <div style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={11} color="#fff" strokeWidth={2.5} />
                </div>
            )}
            <div style={{ width: 46, height: 46, borderRadius: 14, background: connected ? "rgba(255,255,255,0.2)" : cfg.gradient, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", boxShadow: connected ? "none" : `0 6px 20px ${cfg.glow}`, transition: "all 0.2s" }}>
                <Icon size={22} color="#fff" />
            </div>
            <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 3px", color: connected ? "#fff" : "#0f172a" }}>{cfg.name}</p>
            <p style={{ fontSize: 11, margin: 0, color: connected ? "rgba(255,255,255,0.8)" : "#94a3b8", fontWeight: connected ? 600 : 400 }}>
                {connected ? "Connected ✓" : cfg.desc}
            </p>
        </button>
    );
};