import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Scene data ─────────────────────────────────────────────────────────── */
const SCENES = [
    { id: "dashboard", title: "Dashboard — Your store at a glance", sub: "Real-time revenue, orders and active conversations. Everything in one view." },
    { id: "whatsapp", title: "WhatsApp AI — Orders captured automatically", sub: "Customer sends a message → AI replies, takes the order, logs it. Zero manual work." },
    { id: "products", title: "Products — Your catalog, always up to date", sub: "Inventory updates automatically after every sale. Low-stock alerts built in." },
    { id: "orders", title: "Orders — Every sale tracked perfectly", sub: "From chat to structured order card in seconds. Never lose a sale again." },
    { id: "payments", title: "Payments — Collect money without friction", sub: "Payment links sent automatically via WhatsApp. Track paid vs pending live." },
];

const SCENE_DURATION = 10000; // ms per scene

/* ─── Sub-components for each scene ─────────────────────────────────────── */

const SidebarItem: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
    <div style={{
        padding: "7px 10px", borderRadius: 7, fontSize: 12,
        color: active ? "#fff" : "#94a3b8",
        background: active ? "#0d9488" : "transparent",
        marginBottom: 2, display: "flex", alignItems: "center", gap: 7,
        fontWeight: active ? 700 : 400,
    }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#fff" : "#94a3b8", opacity: active ? 1 : 0.5, flexShrink: 0 }} />
        {label}
    </div>
);

const AppSidebar: React.FC<{ active: string }> = ({ active }) => (
    <div style={{ width: 155, background: "#1e293b", height: "100%", padding: "12px 8px", flexShrink: 0, borderRight: "1px solid #334155" }}>
        <div style={{ padding: "6px 4px", marginBottom: 14 }}>
            <img
                src="/assets/logo.svg"
                alt="Hypnate"
                style={{ width: "100%", maxWidth: 130, height: "auto", display: "block" }}
            />
        </div>
        {["Dashboard", "Conversations", "Products", "Orders", "Payments", "Analytics"].map(l => (
            <SidebarItem key={l} label={l} active={active === l} />
        ))}
    </div>
);

const StatCard: React.FC<{ val: string; label: string; change?: string; changeColor?: string }> = ({ val, label, change, changeColor }) => (
    <div style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{val}</div>
        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{label}</div>
        {change && <div style={{ fontSize: 10, color: changeColor || "#16a34a", marginTop: 2, fontWeight: 600 }}>{change}</div>}
    </div>
);

/* ─── Scene 0: Dashboard ─────────────────────────────────────────────────── */
const SceneDashboard: React.FC = () => {
    const bars = [45, 60, 38, 72, 55, 88, 100];
    return (
        <div style={{ flex: 1, background: "#f8fafc", padding: 16, overflowY: "auto", overflowX: "hidden" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>Dashboard — Live overview</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                <StatCard val="₹24,800" label="Today's revenue" change="+18% vs yesterday" changeColor="#0d9488" />
                <StatCard val="12" label="Orders today" change="+4 this hour" changeColor="#2563eb" />
                <StatCard val="7" label="Active chats" change="3 need reply" changeColor="#9333ea" />
            </div>
            <div style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid #f1f5f9", marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8 }}>Revenue this week</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 70 }}>
                    {bars.map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, background: "#0d9488", opacity: 0.3 + (h / 200), borderRadius: "4px 4px 0 0" }} />
                    ))}
                </div>
            </div>
            {[
                { title: "New order from Priya Sharma — ₹2,199", sub: "WhatsApp · Auto-captured by AI", time: "2 min ago", color: "#0d9488" },
                { title: "Payment pending — Rahul Verma · ₹899", sub: "Payment link sent automatically", time: "8 min ago", color: "#f59e0b" },
            ].map((n, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 9, padding: "9px 11px", borderLeft: `3px solid ${n.color}`, border: `1px solid #f1f5f9`, borderLeftWidth: 3, borderLeftColor: n.color, marginBottom: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{n.title}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{n.sub}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{n.time}</div>
                </div>
            ))}
        </div>
    );
};

/* ─── Scene 1: WhatsApp chat ─────────────────────────────────────────────── */
const SceneWhatsApp: React.FC = () => {
    const messages = [
        { from: "customer", text: "Hi! Do you have the cotton kurta in size M?" },
        { from: "bot", text: "Hi Priya! Yes, the Premium Cotton Kurta is available in M — ₹1,299. Want me to place the order?", ai: true },
        { from: "customer", text: "Yes please! COD ok?" },
        { from: "bot", text: "Done! Order #1042 placed — Cotton Kurta (M) · COD ₹1,299. Tracking shared once shipped!", ai: true },
        { from: "system", text: "Order #1042 created automatically in dashboard" },
        { from: "customer", text: "That was so fast, thanks!" },
    ];
    return (
        <div style={{ flex: 1, background: "#f8fafc", padding: 16, overflowY: "auto", overflowX: "hidden" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>WhatsApp — AI handles the conversation</div>
            <div style={{ background: "#e5ddd5", borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ background: "#075e54", borderRadius: "8px 8px 0 0", padding: "8px 12px", margin: "-10px -10px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>P</div>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Priya Sharma</div><div style={{ fontSize: 10, color: "rgba(255,255,255,.6)" }}>Online</div></div>
                </div>
                {messages.map((m, i) => {
                    if (m.from === "system") return (
                        <div key={i} style={{ background: "rgba(0,0,0,.12)", borderRadius: 8, padding: "4px 10px", alignSelf: "center", color: "#555", fontSize: 10, textAlign: "center" }}>{m.text}</div>
                    );
                    const isBot = m.from === "bot";
                    return (
                        <div key={i} style={{ maxWidth: "82%", padding: "7px 10px", borderRadius: 10, fontSize: 12, lineHeight: 1.5, alignSelf: isBot ? "flex-end" : "flex-start", background: isBot ? "#dcf8c6" : "#fff", borderTopRightRadius: isBot ? 2 : 10, borderTopLeftRadius: isBot ? 10 : 2, color: "#1a1a1a" }}>
                            {m.text}
                            {m.ai && <span style={{ background: "#0d9488", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20, marginLeft: 6 }}>AI</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ─── Scene 2: Products ──────────────────────────────────────────────────── */
const SceneProducts: React.FC = () => {
    const products = [
        { emoji: "👘", bg: "#fef3c7", name: "Premium Cotton Kurta", price: "₹1,299", stock: "Stock: 24", low: false },
        { emoji: "🏺", bg: "#f0fdf4", name: "Handcrafted Vase", price: "₹899", stock: "Stock: 11", low: false },
        { emoji: "👜", bg: "#eff6ff", name: "Embroidered Bag", price: "₹2,199", stock: "Stock: 8", low: false },
        { emoji: "💍", bg: "#fdf2f8", name: "Silver Jhumkas", price: "₹649", stock: "Low: 3", low: true },
    ];
    return (
        <div style={{ flex: 1, background: "#f8fafc", padding: 16, overflowY: "auto", overflowX: "hidden" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>Products — Catalog & inventory</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                {products.map(p => (
                    <div key={p.name} style={{ background: "#fff", borderRadius: 10, padding: 10, border: "1px solid #f1f5f9" }}>
                        <div style={{ width: "100%", height: 52, borderRadius: 7, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 7 }}>{p.emoji}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "#0d9488", fontWeight: 700 }}>{p.price}</div>
                        <div style={{ fontSize: 10, color: p.low ? "#ef4444" : "#94a3b8" }}>{p.stock}</div>
                    </div>
                ))}
            </div>
            <div style={{ background: "#f0fdfa", borderRadius: 9, padding: "9px 12px", border: "1px solid #ccfbf1", fontSize: 11, color: "#0d9488", fontWeight: 500, display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0d9488", flexShrink: 0 }} />
                AI auto-updated Silver Jhumkas stock after 2 orders — low stock alert sent
            </div>
        </div>
    );
};

/* ─── Scene 3: Orders ────────────────────────────────────────────────────── */
const SceneOrders: React.FC = () => {
    const orders = [
        { id: "#1042", status: "Confirmed", statusBg: "#dcfce7", statusColor: "#166534", customer: "Priya Sharma", item: "Cotton Kurta (M)", amount: "₹1,299", extra: "WhatsApp · AI" },
        { id: "#1041", status: "Shipped", statusBg: "#dbeafe", statusColor: "#1e40af", customer: "Rahul Verma", item: "Handcrafted Vase", amount: "₹899", extra: "Tracking: BD12345678IN" },
        { id: "#1040", status: "Payment Pending", statusBg: "#fef3c7", statusColor: "#92400e", customer: "Anjali Gupta", item: "Embroidered Bag", amount: "₹2,199", extra: "Link sent 5 min ago" },
    ];
    return (
        <div style={{ flex: 1, background: "#f8fafc", padding: 16, overflowY: "auto", overflowX: "hidden" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>Orders — Every sale tracked</div>
            {orders.map(o => (
                <div key={o.id} style={{ background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9", overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ background: "#f8fafc", padding: "7px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#0d9488" }}>{o.id}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: o.statusBg, color: o.statusColor }}>{o.status}</span>
                    </div>
                    <div style={{ padding: "9px 12px" }}>
                        {[["Customer", o.customer], ["Item", o.item], ["Amount", o.amount], ["Note", o.extra]].map(([k, v]) => (
                            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
                                <span>{k}</span><span style={{ color: "#0f172a", fontWeight: 600 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ─── Scene 4: Payments ──────────────────────────────────────────────────── */
const ScenePayments: React.FC = () => {
    const txns = [
        { name: "Priya Sharma", sub: "Cotton Kurta · WhatsApp", amt: "₹1,299", paid: true },
        { name: "Rahul Verma", sub: "Handcrafted Vase · WhatsApp", amt: "₹899", paid: true },
        { name: "Anjali Gupta", sub: "Embroidered Bag · Instagram", amt: "₹2,199", paid: false },
        { name: "Sneha Patel", sub: "Silver Jhumkas · WhatsApp", amt: "₹649", paid: true },
    ];
    return (
        <div style={{ flex: 1, background: "#f8fafc", padding: 16, overflowY: "auto", overflowX: "hidden" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>Payments — Collected & tracked</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
                <StatCard val="₹24,800" label="Collected today" />
                <StatCard val="₹2,199" label="Pending" changeColor="#f59e0b" change="1 pending" />
                <StatCard val="16" label="Transactions" changeColor="#2563eb" change="Today" />
            </div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "4px 12px", border: "1px solid #f1f5f9", marginBottom: 8 }}>
                {txns.map((t, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < txns.length - 1 ? "1px solid #f8fafc" : "none" }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{t.name}</div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>{t.sub}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{t.amt}</div>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: t.paid ? "#dcfce7" : "#fef3c7", color: t.paid ? "#166534" : "#92400e" }}>{t.paid ? "Paid" : "Pending"}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ background: "#f0fdfa", borderRadius: 9, padding: "9px 12px", border: "1px solid #ccfbf1", fontSize: 11, color: "#0d9488", fontWeight: 500 }}>
                Razorpay payment link auto-sent to Anjali via WhatsApp
            </div>
        </div>
    );
};

const SCENE_COMPONENTS = [SceneDashboard, SceneWhatsApp, SceneProducts, SceneOrders, ScenePayments];
const SIDEBAR_ACTIVES = ["Dashboard", "Conversations", "Products", "Orders", "Payments"];

/* ─── Main Demo Player ───────────────────────────────────────────────────── */
export const HypnateDemoPlayer: React.FC = () => {
    const navigate = useNavigate();
    const [cur, setCur] = useState(0);
    const [playing, setPlaying] = useState(true);
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
            if (progressRef.current >= 100) {
                setCur(c => (c + 1) % SCENES.length);
            }
        }, 50);
    }, []);

    useEffect(() => {
        if (playing) startTimer();
        else stopTimer();
        return stopTimer;
    }, [cur, playing, startTimer]);

    const goTo = (n: number) => { setCur(n); };
    const SceneComp = SCENE_COMPONENTS[cur];

    return (
        <>
            <style>{css}</style>
            <div className="hdp-wrap">
                {/* Browser chrome */}
                <div className="hdp-chrome">
                    <div className="hdp-dots">
                        <span style={{ background: "#ef4444" }} />
                        <span style={{ background: "#f59e0b" }} />
                        <span style={{ background: "#22c55e" }} />
                    </div>
                    <div className="hdp-url">hypnate.in/dashboard</div>
                    <div style={{ width: 60 }} />
                </div>

                {/* App shell */}
                <div className="hdp-app">
                    <AppSidebar active={SIDEBAR_ACTIVES[cur]} />
                    <SceneComp key={cur} />
                </div>

                {/* Progress bar */}
                <div className="hdp-prog-track">
                    <div className="hdp-prog-fill" style={{ width: `${progress}%` }} />
                </div>

                {/* Info bar */}
                <div className="hdp-infobar">
                    <div>
                        <div className="hdp-info-title">{SCENES[cur].title}</div>
                        <div className="hdp-info-sub">{SCENES[cur].sub}</div>
                    </div>
                    {/* <button className="hdp-play-btn" onClick={() => setPlaying(p => !p)}>
                        {playing ? "⏸ Pause" : "▶ Play"}
                    </button> */}
                </div>

                {/* Controls */}
                <div className="hdp-controls">
                    <button className="hdp-btn-prev" onClick={() => goTo((cur - 1 + SCENES.length) % SCENES.length)}>← Prev</button>
                    <div className="hdp-dots-row">
                        {SCENES.map((_, i) => (
                            <div key={i} className={`hdp-dot ${i === cur ? "active" : ""}`} onClick={() => goTo(i)} />
                        ))}
                    </div>
                    <button className="hdp-btn-next" onClick={() => goTo((cur + 1) % SCENES.length)}>Next →</button>
                </div>

                {/* CTA */}
                <div className="hdp-cta-row">
                    <span className="hdp-cta-text">Ready to set this up for your business?</span>
                    <button className="hdp-cta-btn" onClick={() => navigate("/signup")}>Start free — no card needed →</button>
                </div>
            </div>
        </>
    );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
.hdp-wrap {
  font-family: 'Outfit', sans-serif;
  background: #0f172a;
  border-radius: 16px;

  width: 100%;
  max-width: 100%;
  margin: 0 auto;

  overflow: hidden;
}
.hdp-chrome { background:#1e293b; padding:10px 16px; display:flex; align-items:center; gap:10px; border-bottom:1px solid #334155; border-radius:16px 16px 0 0; }
.hdp-dots { display:flex; gap:5px; }
.hdp-dots span { width:10px; height:10px; border-radius:50%; display:inline-block; }
.hdp-url { flex:1; background:#0f172a; border-radius:6px; padding:4px 12px; font-size:12px; color:#64748b; text-align:center; max-width:280px; margin:0 auto; }
.hdp-app { display:flex; animation:hdpFadeIn .35s ease; min-height: 400px; height: auto; overflow:hidden; }
@keyframes hdpFadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
.hdp-prog-track { height:3px; background:#1e293b; }
.hdp-prog-fill { height:100%; background:#0d9488; transition:width .05s linear; }
.hdp-infobar { background:#1e293b; padding:12px 16px; display:flex; align-items:flex-start; justify-content:space-between; gap:12px; border-top:1px solid #334155; }
.hdp-info-title { font-size:13px; font-weight:700; color:#fff; margin-bottom:3px; }
.hdp-info-sub { font-size:11px; color:#64748b; line-height:1.5; }
.hdp-play-btn { padding:6px 14px; background:#334155; color:#94a3b8; border:none; border-radius:7px; font-size:11px; font-weight:700; cursor:pointer; white-space:nowrap; font-family:'Outfit',sans-serif; transition:all .15s; flex-shrink:0; }
.hdp-play-btn:hover { background:#475569; color:#fff; }
.hdp-controls { background:#1e293b; padding:8px 16px; display:flex; align-items:center; justify-content:space-between; border-top:1px solid #334155; }
.hdp-btn-prev,.hdp-btn-next { padding:6px 16px; border-radius:8px; border:none; cursor:pointer; font-size:12px; font-weight:700; font-family:'Outfit',sans-serif; transition:all .15s; }
.hdp-btn-prev { background:#334155; color:#94a3b8; }
.hdp-btn-prev:hover { background:#475569; color:#fff; }
.hdp-btn-next { background:#0d9488; color:#fff; }
.hdp-btn-next:hover { background:#0f766e; }
.hdp-dots-row { display:flex; gap:6px; align-items:center; }
.hdp-dot { width:8px; height:8px; border-radius:50%; background:#334155; cursor:pointer; transition:all .2s; }
.hdp-dot.active { background:#0d9488; width:20px; border-radius:4px; }
.hdp-cta-row { background:#0d9488; padding:12px 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; border-radius:0 0 16px 16px; }
.hdp-cta-text { font-size:13px; font-weight:600; color:#fff; }
.hdp-cta-btn { padding:8px 18px; background:#fff; color:#0d9488; border:none; border-radius:8px; font-size:13px; font-weight:800; cursor:pointer; font-family:'Outfit',sans-serif; transition:all .15s; white-space:nowrap; }
.hdp-cta-btn:hover { background:#f0fdfa; transform:scale(1.02); }
@media (max-width: 900px) {
  .hdp-wrap {
    transform: scale(0.9);
    transform-origin: top center;
  }
}

@media (max-width: 700px) {
  .hdp-wrap {
    transform: scale(0.8);
  }
}

@media (max-width: 500px) {
  .hdp-wrap {
    transform: scale(0.7);
  }
}
`;