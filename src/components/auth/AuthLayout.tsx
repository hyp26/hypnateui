import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, MessageCircle, TrendingUp, Zap } from "lucide-react";
import "./Auth.css";

/* ─── Animated dashboard mockup — the left panel's signature element ────── */
const DashboardMockup: React.FC = () => {
    const [step, setStep] = useState(0);
    const msgs = [
        { name: "Priya S.", text: "Do you have kurta in M?", time: "now", color: "#25d366" },
        { name: "Rahul V.", text: "I want 2 pieces of vase", time: "2m", color: "#60a5fa" },
        { name: "Anjali G.", text: "When will my order ship?", time: "5m", color: "#f97316" },
    ];
    const bars = [40, 60, 45, 72, 55, 85, 100];

    useEffect(() => {
        const t = setInterval(() => setStep((s) => (s + 1) % 3), 2200);
        return () => clearInterval(t);
    }, []);

    return (
        <div
            style={{
                background: "#1e293b",
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
            }}
        >
            {/* titlebar */}
            <div
                style={{
                    background: "#0f172a",
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "block" }} />
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "block" }} />
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "block" }} />
                <span
                    style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: 10,
                        color: "rgba(255,255,255,0.25)",
                        fontFamily: "monospace",
                    }}
                >
                    hypnate.in/dashboard
                </span>
            </div>

            {/* stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, padding: "10px 10px 0" }}>
                {[
                    { v: "₹24.8k", l: "Revenue", c: "#0d9488" },
                    { v: "12", l: "Orders", c: "#6366f1" },
                    { v: "7", l: "Chats", c: "#f59e0b" },
                ].map((s) => (
                    <div
                        key={s.l}
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: 8,
                            padding: "8px 10px",
                            border: "1px solid rgba(255,255,255,0.05)",
                        }}
                    >
                        <div style={{ fontSize: 14, fontWeight: 800, color: s.c, fontFamily: "'Outfit',sans-serif" }}>{s.v}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{s.l}</div>
                    </div>
                ))}
            </div>

            {/* chart */}
            <div style={{ padding: "8px 10px 4px" }}>
                <div
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 8,
                        padding: "8px 8px 4px",
                        border: "1px solid rgba(255,255,255,0.05)",
                    }}
                >
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>Revenue this week</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 42 }}>
                        {bars.map((h, i) => (
                            <div
                                key={i}
                                style={{
                                    flex: 1,
                                    height: `${h}%`,
                                    background: "#0d9488",
                                    opacity: 0.25 + h / 160,
                                    borderRadius: "2px 2px 0 0",
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* live messages */}
            <div style={{ padding: "6px 10px 10px" }}>
                <div
                    style={{
                        fontSize: 8,
                        color: "rgba(255,255,255,0.25)",
                        marginBottom: 5,
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                    }}
                >
                    Live conversations
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {msgs.map((m, i) => (
                        <div
                            key={i}
                            style={{
                                background: i === step ? "rgba(13,148,136,0.12)" : "rgba(255,255,255,0.03)",
                                border: `1px solid ${i === step ? "rgba(13,148,136,0.3)" : "rgba(255,255,255,0.05)"}`,
                                borderRadius: 7,
                                padding: "6px 8px",
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                transition: "all 0.4s ease",
                            }}
                        >
                            <div
                                style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: "50%",
                                    background: m.color + "22",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 8,
                                    fontWeight: 700,
                                    color: m.color,
                                    flexShrink: 0,
                                }}
                            >
                                {m.name[0]}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{m.name}</div>
                                <div
                                    style={{
                                        fontSize: 8,
                                        color: "rgba(255,255,255,0.4)",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {m.text}
                                </div>
                            </div>
                            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{m.time}</div>
                            {i === step && (
                                <div
                                    style={{
                                        width: 5,
                                        height: 5,
                                        borderRadius: "50%",
                                        background: "#0d9488",
                                        flexShrink: 0,
                                        animation: "auth-pulse 1s ease-in-out infinite",
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const FeaturePill: React.FC<{ icon: React.ReactNode; text: string; delay: number }> = ({ icon, text, delay }) => (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 100,
            padding: "7px 14px",
            animation: `auth-fadeup 0.6s ease ${delay}ms both`,
        }}
    >
        <div style={{ color: "#0d9488", display: "flex", alignItems: "center" }}>{icon}</div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{text}</span>
    </div>
);

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, footer }) => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: "100vh", display: "flex", width: "100%", fontFamily: "'Outfit', sans-serif" }}>
            {/* back button */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    position: "fixed",
                    top: 18,
                    left: 18,
                    zIndex: 50,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
                aria-label="Go back"
            >
                <ArrowLeft size={16} color="#374151" />
            </button>

            {/* ══ LEFT PANEL — dark brand ══ */}
            <div
                className="auth-left-panel"
                style={{
                    width: "50%",
                    background: "#07111e",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "52px 48px",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: -120,
                        right: -120,
                        width: 400,
                        height: 400,
                        borderRadius: "50%",
                        background: "radial-gradient(circle,rgba(13,148,136,0.18) 0%,transparent 65%)",
                        pointerEvents: "none",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: -100,
                        left: -100,
                        width: 320,
                        height: 320,
                        borderRadius: "50%",
                        background: "radial-gradient(circle,rgba(234,88,12,0.08) 0%,transparent 65%)",
                        pointerEvents: "none",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)",
                        backgroundSize: "28px 28px",
                        pointerEvents: "none",
                    }}
                />

                <div style={{ position: "relative", animation: "auth-fadeup 0.6s ease both" }}>
                    <img src="/assets/hypnate-wordmark-light.png" alt="Hypnate" style={{ height: 42, width: "auto", display: "block" }} />
                </div>

                <div
                    style={{
                        position: "relative",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 32,
                        padding: "40px 0",
                    }}
                >
                    <div style={{ animation: "auth-fadeup 0.6s 0.1s ease both" }}>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 7,
                                background: "rgba(13,148,136,0.12)",
                                border: "1px solid rgba(13,148,136,0.25)",
                                borderRadius: 100,
                                padding: "5px 14px",
                                marginBottom: 16,
                            }}
                        >
                            <span
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "#0d9488",
                                    display: "block",
                                    animation: "auth-pulse 1.5s ease-in-out infinite",
                                }}
                            />
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: ".6px" }}>
                                Built for Indian D2C brands
                            </span>
                        </div>
                        <h1 style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-1.2px", margin: 0 }}>
                            Sell smarter.
                            <br />
                            <span style={{ color: "#0d9488" }}>Grow faster.</span>
                        </h1>
                        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 14, lineHeight: 1.65, maxWidth: 360 }}>
                            Manage conversations, orders, inventory and payments from one workspace while you focus on your products.
                        </p>
                    </div>

                    <div style={{ animation: "auth-fadeup 0.7s 0.2s ease both, auth-float 5s 1s ease-in-out infinite" }}>
                        <DashboardMockup />
                    </div>
                </div>

                <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <FeaturePill icon={<ShoppingBag size={13} />} text="Order management" delay={300} />
                    <FeaturePill icon={<MessageCircle size={13} />} text="Unified inbox" delay={400} />
                    <FeaturePill icon={<TrendingUp size={13} />} text="Commerce analytics" delay={500} />
                    <FeaturePill icon={<Zap size={13} />} text="AI-assisted workflows" delay={600} />
                </div>
            </div>

            {/* ══ RIGHT PANEL — auth card ══ */}
            <div
                style={{
                    flex: 1,
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "32px 20px",
                    minHeight: "100vh",
                }}
            >
                <div
                    className="auth-card"
                    style={{
                        background: "#fff",
                        borderRadius: 20,
                        padding: "36px 36px",
                        width: "100%",
                        maxWidth: 420,
                        border: "1px solid #f1f5f9",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                        animation: "auth-fadeup 0.5s ease both",
                    }}
                >
                    <div className="auth-mobile-logo" style={{ justifyContent: "center", marginBottom: 24 }}>
                        <img src="/assets/hypnate-logo.png" alt="Hypnate" style={{ height: 36 }} />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
                            {title}
                        </h2>
                        <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>{subtitle}</p>
                    </div>

                    {children}

                    {footer && <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>{footer}</div>}
                </div>
            </div>
        </div>
    );
};