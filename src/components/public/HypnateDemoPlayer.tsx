import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const SCENES = [
    { id: "dashboard", title: "Dashboard — Example overview", sub: "Illustrative dashboard preview using example data." },
    { id: "whatsapp", title: "WhatsApp — Example assisted conversation", sub: "Illustrative example of a supported commerce conversation." },
    { id: "products", title: "Products — Example catalog & inventory", sub: "Illustrative catalog and inventory view." },
    { id: "orders", title: "Orders — Example order tracking", sub: "Illustrative order-management workflow." },
    { id: "payments", title: "Payments — Example payment workflow", sub: "Illustrative payment-link workflow." },
    { id: "analytics", title: "Analytics — Example commerce overview", sub: "Illustrative analytics view using example data." },
];

const SCENE_DURATION = 6000;

const SidebarItem: React.FC<{ label: string; active?: boolean; short?: string }> = ({ label, active, short }) => (
    <div style={{ padding: "5px 7px", borderRadius: 5, fontSize: 10, color: active ? "#fff" : "#94a3b8", background: active ? "#0d9488" : "transparent", marginBottom: 2, display: "flex", alignItems: "center", gap: 5, fontWeight: active ? 700 : 400 }}>
        <span style={{ width: 4, height: 4, borderRadius: "50%", background: active ? "#fff" : "#64748b", flexShrink: 0 }} />
        <span className="sidebar-label">{label}</span>
    </div>
);

const Sidebar: React.FC<{ active: string }> = ({ active }) => (
    <div style={{ width: 120, background: "#1e293b", flexShrink: 0, borderRight: "1px solid #334155", display: "flex", flexDirection: "column", padding: "8px 6px" }} className="hdp-sidebar">
        <div style={{ padding: "3px 3px 8px", marginBottom: 5, borderBottom: "1px solid #334155" }}>
            <img src="/assets/hypnate-wordmark-light.png" alt="Hypnate" style={{ width: "92%", height: "auto", display: "block" }} />
        </div>
        {["Dashboard", "Conversations", "Products", "Orders", "Payments", "Analytics"].map(l => (
            <SidebarItem key={l} label={l} active={active === l} />
        ))}
    </div>
);

const SceneBox: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ flex: 1, background: "#f8fafc", display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <div style={{ padding: "8px 12px 5px", borderBottom: "1px solid #e2e8f0", background: "#fff", flexShrink: 0 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: ".8px" }}>{title}</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: 10 }}>{children}</div>
    </div>
);

const StatCard: React.FC<{ val: string; label: string; note?: string; noteColor?: string }> = ({ val, label, note, noteColor }) => (
    <div style={{ background: "#fff", borderRadius: 7, padding: "7px 8px", border: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{val}</div>
        <div style={{ fontSize: 8, color: "#94a3b8", marginTop: 2 }}>{label}</div>
        {note && <div style={{ fontSize: 8, color: noteColor || "#16a34a", marginTop: 1, fontWeight: 600 }}>{note}</div>}
    </div>
);

const SceneDashboard: React.FC = () => {
    const bars = [40, 55, 35, 68, 50, 82, 100];
    return (
        <SceneBox title="Dashboard — Example overview">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, marginBottom: 8 }}>
                <StatCard val="₹24,800" label="Example revenue" note="Illustrative" noteColor="#0d9488" />
                <StatCard val="12" label="Example orders" note="Illustrative" noteColor="#2563eb" />
                <StatCard val="7" label="Example chats" note="Illustrative" noteColor="#9333ea" />
            </div>
            <div style={{ background: "#fff", borderRadius: 7, padding: "8px 8px 5px", border: "1px solid #f1f5f9", marginBottom: 7 }}>
                <div style={{ fontSize: 8, color: "#94a3b8", marginBottom: 6 }}>Example revenue trend</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 50 }}>
                    {bars.map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, background: "#0d9488", opacity: 0.25 + (h / 160), borderRadius: "2px 2px 0 0" }} />)}
                </div>
            </div>
            {[
                { title: "Example order · ₹2,199", sub: "WhatsApp · Example workflow", c: "#0d9488" },
                { title: "Example payment · ₹899", sub: "Payment-link workflow", c: "#f59e0b" },
            ].map((n, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 6, padding: "6px 8px", borderLeft: `3px solid ${n.c}`, border: `1px solid #f1f5f9`, borderLeftWidth: 3, borderLeftColor: n.c, marginBottom: 4 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#0f172a" }}>{n.title}</div>
                    <div style={{ fontSize: 8, color: "#64748b", marginTop: 1 }}>{n.sub}</div>
                </div>
            ))}
        </SceneBox>
    );
};

const SceneWhatsApp: React.FC = () => {
    const msgs = [
        { from: "customer", text: "Hi! Do you have the cotton kurta in size M?" },
        { from: "merchant", text: "Yes — ₹1,299. I can add the requested item to the order.", },
        { from: "customer", text: "Yes please. COD ok?" },
        { from: "merchant", text: "Example order workflow — Cotton Kurta (M) · COD ₹1,299.", },
        { from: "system", text: "Example order created" },
    ];
    return (
        <SceneBox title="WhatsApp — Example conversation workflow">
            <div style={{ background: "#e5ddd5", borderRadius: 7, padding: 7, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ background: "#075e54", borderRadius: "5px 5px 0 0", padding: "6px 8px", margin: "-7px -7px 7px", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>P</div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>Example customer</div><div style={{ fontSize: 8, color: "rgba(255,255,255,.5)" }}>Online</div></div>
                </div>
                {msgs.map((m, i) => {
                    if (m.from === "system") return <div key={i} style={{ background: "rgba(0,0,0,.1)", borderRadius: 5, padding: "2px 7px", alignSelf: "center", color: "#555", fontSize: 8, textAlign: "center" }}>{m.text}</div>;
                    const isBot = m.from === "merchant";
                    return (
                        <div key={i} style={{ maxWidth: "82%", padding: "5px 8px", borderRadius: 7, fontSize: 10, lineHeight: 1.4, alignSelf: isBot ? "flex-end" : "flex-start", background: isBot ? "#dcf8c6" : "#fff", color: "#1a1a1a" }}>
                            {m.text}
                        </div>
                    );
                })}
            </div>
        </SceneBox>
    );
};

const SceneProducts: React.FC = () => {
    const products = [
        { emoji: "👘", bg: "#fef3c7", name: "Cotton Kurta", price: "₹1,299", stock: "24", low: false },
        { emoji: "🏺", bg: "#f0fdf4", name: "Handcrafted Vase", price: "₹899", stock: "11", low: false },
        { emoji: "👜", bg: "#eff6ff", name: "Embroidered Bag", price: "₹2,199", stock: "8", low: false },
        { emoji: "💍", bg: "#fdf2f8", name: "Silver Jhumkas", price: "₹649", stock: "3", low: true },
    ];
    return (
        <SceneBox title="Products — Catalog & inventory">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {products.map(p => (
                    <div key={p.name} style={{ background: "#fff", borderRadius: 7, padding: 7, border: "1px solid #f1f5f9" }}>
                        <div style={{ width: "100%", height: 36, borderRadius: 5, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 5 }}>{p.emoji}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#0f172a", marginBottom: 2, lineHeight: 1.3 }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: "#0d9488", fontWeight: 700 }}>{p.price}</div>
                        <div style={{ fontSize: 8, color: p.low ? "#ef4444" : "#94a3b8" }}>Stock: {p.stock}</div>
                    </div>
                ))}
            </div>
        </SceneBox>
    );
};

const SceneOrders: React.FC = () => {
    const orders = [
        { id: "#1042", status: "Confirmed", sBg: "#dcfce7", sCol: "#166534", customer: "Example customer", amount: "₹1,299" },
        { id: "#1041", status: "Shipped", sBg: "#dbeafe", sCol: "#1e40af", customer: "Example customer", amount: "₹899" },
        { id: "#1040", status: "Pending", sBg: "#fef3c7", sCol: "#92400e", customer: "Example customer", amount: "₹2,199" },
    ];
    return (
        <SceneBox title="Orders — Example order tracking">
            {orders.map(o => (
                <div key={o.id} style={{ background: "#fff", borderRadius: 7, border: "1px solid #f1f5f9", overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ background: "#f8fafc", padding: "5px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#0d9488" }}>{o.id}</span>
                        <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: o.sBg, color: o.sCol }}>{o.status}</span>
                    </div>
                    <div style={{ padding: "5px 8px" }}>
                        {([["Customer", o.customer], ["Amount", o.amount]] as [string, string][]).map(([k, v]) => (
                            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#64748b", marginBottom: 1 }}>
                                <span>{k}</span><span style={{ color: "#0f172a", fontWeight: 600 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </SceneBox>
    );
};

const ScenePayments: React.FC = () => {
    const txns = [
        { name: "Example customer", amt: "₹1,299", paid: true },
        { name: "Example customer", amt: "₹899", paid: true },
        { name: "Example customer", amt: "₹2,199", paid: false },
    ];
    return (
        <SceneBox title="Payments — Example payment workflow">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, marginBottom: 8 }}>
                <StatCard val="₹24,800" label="Example collected" />
                <StatCard val="₹2,199" label="Example pending" note="Example" noteColor="#f59e0b" />
                <StatCard val="16" label="Example transactions" />
            </div>
            <div style={{ background: "#fff", borderRadius: 7, padding: "2px 8px", border: "1px solid #f1f5f9" }}>
                {txns.map((t, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < txns.length - 1 ? "1px solid #f8fafc" : "none" }}>
                        <span style={{ fontSize: 10, fontWeight: 500, color: "#374151" }}>{t.name}</span>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#0f172a" }}>{t.amt}</div>
                            <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 20, background: t.paid ? "#dcfce7" : "#fef3c7", color: t.paid ? "#166534" : "#92400e" }}>{t.paid ? "Paid" : "Pending"}</span>
                        </div>
                    </div>
                ))}
            </div>
        </SceneBox>
    );
};

const SceneAnalytics: React.FC = () => {
    const bars = [30, 50, 42, 65, 48, 78, 90];
    const channels = [{ name: "WhatsApp", pct: 55, color: "#25d366" }, { name: "Instagram", pct: 20, color: "#e1306c" }, { name: "Facebook", pct: 15, color: "#1877f2" }, { name: "Telegram", pct: 10, color: "#26a5e4" }];
    return (
        <SceneBox title="Analytics — Example commerce overview">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, marginBottom: 8 }}>
                <StatCard val="₹62,400" label="Example revenue" note="Illustrative" noteColor="#0d9488" />
                <StatCard val="48" label="Example orders" note="Illustrative" noteColor="#2563eb" />
                <StatCard val="18.5%" label="Example conversion" note="Illustrative" noteColor="#9333ea" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 6, marginBottom: 7 }}>
                <div style={{ background: "#fff", borderRadius: 7, padding: "7px 8px", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 8, color: "#94a3b8", marginBottom: 6 }}>Example revenue trend</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 44 }}>
                        {bars.map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, background: "#0d9488", opacity: 0.25 + (h / 150), borderRadius: "2px 2px 0 0" }} />)}
                    </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 7, padding: "7px 8px", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 8, color: "#94a3b8", marginBottom: 6 }}>Example channel mix</div>
                    {channels.map(c => (
                        <div key={c.name} style={{ marginBottom: 5 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, marginBottom: 2 }}>
                                <span style={{ color: "#374151" }}>{c.name}</span>
                                <span style={{ color: c.color, fontWeight: 700 }}>{c.pct}%</span>
                            </div>
                            <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                                <div style={{ height: "100%", width: `${c.pct}%`, background: c.color, borderRadius: 2 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SceneBox>
    );
};

const SCENE_COMPONENTS = [SceneDashboard, SceneWhatsApp, SceneProducts, SceneOrders, ScenePayments, SceneAnalytics];
const SIDEBAR_ACTIVES = ["Dashboard", "Conversations", "Products", "Orders", "Payments", "Analytics"];

export const HypnateDemoPlayer: React.FC = () => {
    const navigate = useNavigate();
    const [cur, setCur] = useState(0);
    const [playing, setPlaying] = useState(() => {
        if (typeof window === "undefined") return false;
        return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });
    const [progress, setProgress] = useState(0);
    const progRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const progressRef = useRef(0);

    const stopTimer = () => { if (progRef.current) clearInterval(progRef.current); };
    const startTimer = useCallback(() => {
        stopTimer();
        progressRef.current = 0;
        setProgress(0);
        progRef.current = setInterval(() => {
            progressRef.current += (100 / (SCENE_DURATION / 50));
            setProgress(Math.min(progressRef.current, 100));
            if (progressRef.current >= 100) setCur(c => (c + 1) % SCENES.length);
        }, 50);
    }, []);

    useEffect(() => {
        if (playing) startTimer(); else stopTimer();
        return stopTimer;
    }, [cur, playing, startTimer]);

    const goTo = (n: number) => setCur(n);
    const SceneComp = SCENE_COMPONENTS[cur];

    return (
        <>
            <style>{css}</style>
            <div className="hdp-wrap">
                {/* Chrome bar */}
                <div className="hdp-chrome">
                    <div className="hdp-chrome-dots">
                        <span style={{ background: "#ef4444" }} /><span style={{ background: "#f59e0b" }} /><span style={{ background: "#22c55e" }} />
                    </div>
                    <div className="hdp-url">hypnate.in/dashboard</div>
                    <div className="hdp-demo-label">ILLUSTRATIVE PREVIEW · EXAMPLE DATA</div>
                    <div style={{ width: 40 }} />
                </div>

                {/* App shell */}
                <div className="hdp-app">
                    <Sidebar active={SIDEBAR_ACTIVES[cur]} />
                    <SceneComp key={cur} />
                </div>

                {/* Progress */}
                <div className="hdp-prog-track"><div className="hdp-prog-fill" style={{ width: `${progress}%` }} /></div>

                {/* Info bar */}
                <div className="hdp-infobar">
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="hdp-info-title">{SCENES[cur].title}</div>
                        <div className="hdp-info-sub">{SCENES[cur].sub}</div>
                    </div>
                    <button type="button" className="hdp-play-btn" aria-label={playing ? "Pause walkthrough" : "Play walkthrough"} onClick={() => setPlaying(p => !p)}>
                        {playing ? "⏸" : "▶"}
                    </button>
                </div>

                {/* Controls */}
                <div className="hdp-controls">
                    <button type="button" aria-label="Previous walkthrough scene" className="hdp-ctrl-btn hdp-prev" onClick={() => goTo((cur - 1 + SCENES.length) % SCENES.length)}>← Prev</button>
                    <div className="hdp-dots-row">
                        {SCENES.map((scene, i) => (
                            <button
                                key={scene.id}
                                type="button"
                                className={"hdp-dot" + (i === cur ? " active" : "")}
                                aria-label={`Go to ${scene.title} scene`}
                                aria-current={i === cur ? "step" : undefined}
                                onClick={() => goTo(i)}
                            />
                        ))}
                    </div>
                    <button type="button" aria-label="Next walkthrough scene" className="hdp-ctrl-btn hdp-next" onClick={() => goTo((cur + 1) % SCENES.length)}>Next →</button>
                </div>

                {/* CTA */}
                <div className="hdp-cta">
                    <span className="hdp-cta-txt">Ready to set this up for your business?</span>
                    <button type="button" className="hdp-cta-btn" onClick={() => navigate("/signup")}>Get started →</button>
                </div>
            </div>
        </>
    );
};

const css = `
.hdp-wrap {
  background: #0f172a;
  border-radius: 12px;
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.4);
}

.hdp-chrome {
  background: #1e293b;
  padding: 7px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #334155;
  flex-shrink: 0;
}
.hdp-chrome-dots { display: flex; gap: 4px; }
.hdp-chrome-dots span { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.hdp-url { flex: 1; background: #0f172a; border-radius: 5px; padding: 3px 10px; font-size: 10px; color: #64748b; text-align: center; max-width: 200px; margin: 0 auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* App shell — responsive height */
.hdp-app {
  display: flex;
  height: 260px;
  flex-shrink: 0;
  overflow: hidden;
  animation: hdpFade .3s ease;
}
@media(min-width: 480px){ .hdp-app { height: 320px; } }
@media(min-width: 640px){ .hdp-app { height: 360px; } }
@media(min-width: 768px){ .hdp-app { height: 400px; } }
@keyframes hdpFade { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }

/* Sidebar responsive */
.hdp-sidebar { width: 90px !important; }
@media(min-width: 480px){ .hdp-sidebar { width: 110px !important; } }
@media(min-width: 640px){ .hdp-sidebar { width: 130px !important; } }

.hdp-prog-track { height: 3px; background: #334155; flex-shrink: 0; }
.hdp-prog-fill  { height: 100%; background: #0d9488; transition: width .05s linear; }

.hdp-infobar {
  background: #1e293b;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid #334155;
  flex-shrink: 0;
}
.hdp-info-title { font-size: clamp(10px, 2vw, 12px); font-weight: 700; color: #fff; margin-bottom: 2px; }
.hdp-info-sub   { font-size: clamp(9px, 1.5vw, 10px); color: #64748b; line-height: 1.4; }
.hdp-play-btn { padding: 5px 10px; background: #334155; color: #94a3b8; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all .15s; flex-shrink: 0; }
.hdp-play-btn:hover { background: #475569; color: #fff; }

.hdp-controls {
  background: #1e293b;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #334155;
  flex-shrink: 0;
}
.hdp-ctrl-btn { padding: 4px 10px; border-radius: 7px; border: none; cursor: pointer; font-size: 10px; font-weight: 700; transition: all .15s; }
.hdp-prev { background: #334155; color: #94a3b8; }
.hdp-prev:hover { background: #475569; color: #fff; }
.hdp-next { background: #0d9488; color: #fff; }
.hdp-next:hover { background: #0f766e; }
.hdp-dots-row { display: flex; gap: 4px; align-items: center; }
.hdp-dot { width: 6px; height: 6px; padding: 0; border: 0; border-radius: 50%; background: #334155; cursor: pointer; transition: all .2s; appearance: none; -webkit-appearance: none; font: inherit; }
.hdp-dot.active { background: #0d9488; width: 14px; border-radius: 3px; }

.hdp-cta {
  background: #0d9488;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.hdp-cta-txt { font-size: clamp(10px, 2vw, 12px); font-weight: 600; color: #fff; }
.hdp-cta-btn { padding: 6px 12px; background: #fff; color: #0d9488; border: none; border-radius: 7px; font-size: clamp(10px, 2vw, 12px); font-weight: 800; cursor: pointer; transition: all .15s; white-space: nowrap; }
.hdp-cta-btn:hover { background: #f0fdfa; transform: scale(1.02); }
`;