import React from "react";
import { Check, X } from "lucide-react";
import { STEPS_CONFIG } from "../../data/channels";

interface StepperProps {
    current: number;
    completed: Set<number>;
    skipped: Set<number>;
}

export const OnboardingStepper: React.FC<StepperProps> = ({ current, completed, skipped }) => (
    <div style={{ background: "#fff", borderRadius: 18, padding: "16px 12px", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
            <div style={{ position: "absolute", top: 16, left: "9%", right: "9%", height: 2, background: "#f1f5f9", zIndex: 0 }} />
            <div
                style={{
                    position: "absolute",
                    top: 16,
                    left: "9%",
                    height: 2,
                    background: "linear-gradient(90deg,#0d9488,#34d399)",
                    zIndex: 0,
                    transition: "width 0.5s ease",
                    width: `${Math.max(0, ((current - 1) / 4) * 82)}%`,
                }}
            />

            {STEPS_CONFIG.map((step) => {
                const done = completed.has(step.id);
                const skip = skipped.has(step.id);
                const active = current === step.id;
                const Icon = step.icon;
                return (
                    <div key={step.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 1, flex: 1 }}>
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: done ? "linear-gradient(135deg,#0d9488,#34d399)" : skip ? "#fee2e2" : active ? "#f0fdfa" : "#f8fafc",
                                border: `2px solid ${done ? "#0d9488" : skip ? "#fca5a5" : active ? "#0d9488" : "#e2e8f0"}`,
                                boxShadow: active ? "0 0 0 4px rgba(13,148,136,0.12)" : "none",
                                transition: "all 0.3s",
                            }}
                        >
                            {done ? (
                                <Check size={13} color="#fff" strokeWidth={2.5} />
                            ) : skip ? (
                                <X size={12} color="#ef4444" />
                            ) : (
                                <Icon size={13} color={active ? "#0d9488" : "#94a3b8"} />
                            )}
                        </div>
                        <span
                            className="ob-step-label"
                            style={{
                                fontSize: 10,
                                fontWeight: active ? 700 : done ? 600 : 400,
                                color: done ? "#0d9488" : skip ? "#ef4444" : active ? "#0f172a" : "#94a3b8",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {step.title}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
);