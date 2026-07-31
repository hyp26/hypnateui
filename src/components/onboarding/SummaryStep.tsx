import React from "react";
import { Bot, Check, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { STEP_LABELS } from "../../data/channels";
import type { AutoTask } from "../../types/onboarding";

interface SummaryStepProps {
    completed: Set<number>;
    skipped: Set<number>;
    autoProgress: number;
    autoTasks: AutoTask[];
}

export const SummaryStep: React.FC<SummaryStepProps> = ({ completed, skipped, autoProgress, autoTasks }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "8px 0 12px", gap: 24 }}>
        <div style={{ position: "relative" }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#f0fdfa,#ccfbf1)", border: "2px solid #6ee7b7", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, boxShadow: "0 0 0 10px rgba(13,148,136,0.06)" }}>
                <Bot size={36} color="#0d9488" style={{ animation: "bob 2s ease infinite" }} />
            </div>
            <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "2px dashed #0d9488", opacity: 0.2, animation: "rotateSlow 8s linear infinite" }} />
        </div>

        <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.4px" }}>Setting up your store</h2>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>Hypnate AI is configuring your workspace...</p>
        </div>

        <div style={{ width: "100%", maxWidth: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Progress</span>
                <span style={{ fontSize: 12, color: "#0d9488", fontWeight: 700 }}>{autoProgress}%</span>
            </div>
            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ height: "100%", width: `${autoProgress}%`, background: "linear-gradient(90deg,#0d9488,#34d399)", borderRadius: 4, transition: "width 0.3s ease", boxShadow: "0 0 8px rgba(13,148,136,0.4)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
                {autoTasks.map((task, i) => (
                    <div
                        key={task.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 12px",
                            background: task.done ? "#f0fdf4" : i === autoTasks.findIndex((t) => !t.done) ? "#f0fdfa" : "#f8fafc",
                            borderRadius: 10,
                            border: `1px solid ${task.done ? "#bbf7d0" : "#f1f5f9"}`,
                            transition: "all 0.3s",
                        }}
                    >
                        {task.done ? (
                            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#16a34a,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Check size={11} color="#fff" strokeWidth={2.5} />
                            </div>
                        ) : i === autoTasks.findIndex((t) => !t.done) ? (
                            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Loader2 size={12} color="#fff" style={{ animation: "spin 0.7s linear infinite" }} />
                            </div>
                        ) : (
                            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#f1f5f9", flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: 13, fontWeight: task.done ? 400 : 600, color: task.done ? "#94a3b8" : "#0f172a", textDecoration: task.done ? "line-through" : "none" }}>{task.label}</span>
                    </div>
                ))}
            </div>
        </div>

        <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 16, padding: "16px", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px", textAlign: "left" }}>Setup Summary</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3, 4].map((step) => {
                    const isCompleted = completed.has(step);
                    const isSkipped = skipped.has(step);
                    return (
                        <div key={step} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: isCompleted ? "#f0fdf4" : isSkipped ? "#fef2f2" : "#f8fafc", borderRadius: 10, border: `1px solid ${isCompleted ? "#bbf7d0" : isSkipped ? "#fecaca" : "#f1f5f9"}` }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{STEP_LABELS[step]}</span>
                            {isCompleted ? (
                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>
                                    <CheckCircle2 size={10} /> Done
                                </span>
                            ) : isSkipped ? (
                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#dc2626", background: "#fee2e2", padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>
                                    <XCircle size={10} /> Skipped
                                </span>
                            ) : (
                                <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);