import React from "react";
import { AlertCircle } from "lucide-react";
import { STEP_LABELS } from "../../data/channels";

interface SkipConfirmPopupProps {
    skippedSteps: number[];
    onContinue: () => void;
    onComplete: () => void;
}

export const SkipConfirmPopup: React.FC<SkipConfirmPopupProps> = ({ skippedSteps, onContinue, onComplete }) => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }}>
        <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "28px 24px", maxWidth: 480, width: "100%", boxShadow: "0 -8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0", margin: "0 auto 20px" }} />
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#fff7ed,#fef3c7)", border: "2px solid #fcd34d", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <AlertCircle size={24} color="#f97316" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", textAlign: "center", margin: "0 0 8px", letterSpacing: "-0.3px" }}>You're almost there!</h3>
            <p style={{ fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 1.7, margin: "0 0 12px" }}>Some steps were skipped during setup:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 14 }}>
                {skippedSteps.map((s) => (
                    <span key={s} style={{ background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, border: "1px solid #fecaca" }}>{STEP_LABELS[s]}</span>
                ))}
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", margin: "0 0 20px", lineHeight: 1.7 }}>Complete them now for the best experience, or go to the dashboard and finish later.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={onComplete} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(13,148,136,0.3)" }}>
                    Complete Setup
                </button>
                <button onClick={onContinue} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    Go to Dashboard
                </button>
            </div>
        </div>
    </div>
);