import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ErrorBannerProps {
    error: string;
    onClear: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onClear }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12 }}>
        <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: "#dc2626", margin: 0, flex: 1 }}>{error}</p>
        <button onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", color: "#fca5a5", flexShrink: 0 }}>
            <X size={14} />
        </button>
    </div>
);