import React from "react";
import { ChevronRight, Loader2, SkipForward } from "lucide-react";

interface OnboardingFooterProps {
    onBack?: () => void;
    onSkip?: () => void;
    onNext: () => void;
    loading: boolean;
    showBack: boolean;
    showSkip: boolean;
}

export const OnboardingFooter: React.FC<OnboardingFooterProps> = ({ onBack, onSkip, onNext, loading, showBack, showSkip }) => (
    <div className="ob-onboarding-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {showBack && (
                <button onClick={onBack} style={{ fontSize: 14, fontWeight: 500, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: "8px 4px", fontFamily: "inherit" }}>
                    ← Back
                </button>
            )}
            {showSkip && (
                <button
                    onClick={onSkip}
                    style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
                >
                    <SkipForward size={13} /> <span className="ob-skip-label">Skip for now</span>
                </button>
            )}
        </div>
        <button
            onClick={onNext}
            disabled={loading}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                background: loading ? "#94a3b8" : "linear-gradient(135deg,#0d9488,#0f766e)",
                color: "#fff",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 16px rgba(13,148,136,0.3)",
                transition: "all 0.2s",
                fontFamily: "inherit",
            }}
        >
            {loading ? (
                <>
                    <Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} /> Saving…
                </>
            ) : (
                <>
                    Next Step <ChevronRight size={16} />
                </>
            )}
        </button>
    </div>
);