import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const SCENES = [
    { id: "dashboard", title: "Dashboard — Your store at a glance", sub: "Real-time revenue, orders and active conversations. Everything in one view." },
    { id: "whatsapp", title: "WhatsApp AI — Orders captured automatically", sub: "Customer sends a message → AI replies, takes the order, logs it. Zero manual work." },
    { id: "products", title: "Products — Catalog, always up to date", sub: "Inventory updates automatically after every sale. Low-stock alerts built in." },
    { id: "orders", title: "Orders — Every sale tracked perfectly", sub: "From chat to structured order card in seconds. Never lose a sale again." },
    { id: "payments", title: "Payments — Collect money without friction", sub: "Payment links sent automatically via WhatsApp. Track paid vs pending live." },
    { id: "analytics", title: "Analytics — Know your numbers", sub: "Revenue trends, top products, and channel performance — updated in real time." },
];

const SCENE_DURATION = 6000;

/* ─── Shared shell pieces ─────────────────────────────────────────────────── */
const SidebarItem: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
    <div style={{ padding: "6px 9px", borderRadius: 6, fontSize: 11, color: active ? "#fff" : "#94a3b8", background: active ? "#0d9488" : "transparent", marginBottom: 2, display: "flex", alignItems: "center", gap: 6, fontWeight: active ? 700 : 400 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "#fff" : "#64748b", flexShrink: 0 }} />
        {label}
    </div>
);

const Sidebar: React.FC<{ active: string }> = ({ active }) => (
    <div style={{ width: 140, background: "#1e293b", flexShrink: 0, borderRight: "1px solid #334155", display: "flex", flexDirection: "column", padding: "10px 7px" }}>
        <div style={{ padding: "4px 4px 10px", marginBottom: 6, borderBottom: "1px solid #334155" }}>
            <img src="/assets/logo.svg" alt="Hypnate" style={{ width: "90%", height: "auto", display: "block" }} />
        </div>
        {["Dashboard", "Conversations", "Products", "Orders", "Payments", "Analytics"].map(l => (
            <SidebarItem key={l} label={l} active={active === l} />
        ))}
    </div>
);

/* ─── Scene wrapper — fixed height, no bleed ─────────────────────────────── */
const SceneBox: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ flex: 1, background: "#f8fafc", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid #e2e8f0", background: "#fff", flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: ".9px" }}>{title}</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: 12 }}>
            {children}
        </div>
    </div>
);

const StatCard: React.FC<{ val: string; label: string; note?: string; noteColor?: string }> = ({ val, label, note, noteColor }) => (
    <div style={{ background: "#fff", borderRadius: 8, padding: "9px 10px", border: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{val}</div>
        <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 3 }}>{label}</div>
        {note && <div style={{ fontSize: 9, color: noteColor || "#16a34a", marginTop: 2, fontWeight: 600 }}>{note}</div>}
    </div>
);

/* ─── Scene 0: Dashboard ─────────────────────────────────────────────────── */
const SceneDashboard: React.FC = () => {
    const bars = [40, 55, 35, 68, 50, 82, 100];
    return (
        <SceneBox title="Dashboard — Live overview">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 10 }}>
                <StatCard val="₹24,800" label="Today revenue" note="+18% yesterday" noteColor="#0d9488" />
                <StatCard val="12" label="Orders today" note="+4 this hour" noteColor="#2563eb" />
                <StatCard val="7" label="Active chats" note="3 need reply" noteColor="#9333ea" />
            </div>
            <div style={{ background: "#fff", borderRadius: 8, padding: "10px 10px 6px", border: "1px solid #f1f5f9", marginBottom: 8 }}>
                <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 8 }}>Revenue this week</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
                    {bars.map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, background: "#0d9488", opacity: 0.25 + (h / 160), borderRadius: "3px 3px 0 0" }} />
                    ))}
                </div>
            </div>
            {[
                { title: "New order — Priya Sharma · ₹2,199", sub: "WhatsApp · AI captured", time: "2 min ago", c: "#0d9488" },
                { title: "Payment pending — Rahul Verma · ₹899", sub: "Link sent automatically", time: "8 min ago", c: "#f59e0b" },
            ].map((n, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 7, padding: "7px 10px", borderLeft: `3px solid ${n.c}`, border: `1px solid #f1f5f9`, borderLeftWidth: 3, borderLeftColor: n.c, marginBottom: 5 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#0f172a" }}>{n.title}</div>
                    <div style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>{n.sub}</div>
                    <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{n.time}</div>
                </div>
            ))}
        </SceneBox>
    );
};

/* ─── Scene 1: WhatsApp ──────────────────────────────────────────────────── */
const SceneWhatsApp: React.FC = () => {
    const msgs = [
        { from: "customer", text: "Hi! Do you have the cotton kurta in size M?" },
        { from: "bot", text: "Hi Priya! Yes — Premium Cotton Kurta M is ₹1,299. Shall I place the order?", ai: true },
        { from: "customer", text: "Yes please! COD ok?" },
        { from: "bot", text: "Done! Order #1042 placed — Cotton Kurta (M) · COD ₹1,299. Tracking once shipped!", ai: true },
        { from: "system", text: "Order #1042 created automatically in dashboard" },
        { from: "customer", text: "That was so fast, thanks!" },
    ];
    return (
        <SceneBox title="WhatsApp — AI handles the conversation">
            <div style={{ background: "#e5ddd5", borderRadius: 8, padding: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ background: "#075e54", borderRadius: "6px 6px 0 0", padding: "7px 10px", margin: "-8px -8px 8px", display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>P</div>
                    <div><div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>Priya Sharma</div><div style={{ fontSize: 9, color: "rgba(255,255,255,.5)" }}>Online</div></div>
                </div>
                {msgs.map((m, i) => {
                    if (m.from === "system") return (
                        <div key={i} style={{ background: "rgba(0,0,0,.1)", borderRadius: 6, padding: "3px 8px", alignSelf: "center", color: "#555", fontSize: 9, textAlign: "center" }}>{m.text}</div>
                    );
                    const isBot = m.from === "bot";
                    return (
                        <div key={i} style={{ maxWidth: "80%", padding: "6px 9px", borderRadius: 8, fontSize: 11, lineHeight: 1.45, alignSelf: isBot ? "flex-end" : "flex-start", background: isBot ? "#dcf8c6" : "#fff", borderTopRightRadius: isBot ? 2 : 8, borderTopLeftRadius: isBot ? 8 : 2, color: "#1a1a1a" }}>
                            {m.text}
                            {m.ai && <span style={{ background: "#0d9488", color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 20, marginLeft: 5 }}>AI</span>}
                        </div>
                    );
                })}
            </div>
        </SceneBox>
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
        <SceneBox title="Products — Catalog & inventory">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 8 }}>
                {products.map(p => (
                    <div key={p.name} style={{ background: "#fff", borderRadius: 8, padding: 8, border: "1px solid #f1f5f9" }}>
                        <div style={{ width: "100%", height: 44, borderRadius: 6, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 6 }}>{p.emoji}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#0f172a", marginBottom: 2, lineHeight: 1.3 }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: "#0d9488", fontWeight: 700 }}>{p.price}</div>
                        <div style={{ fontSize: 9, color: p.low ? "#ef4444" : "#94a3b8" }}>{p.stock}</div>
                    </div>
                ))}
            </div>
            <div style={{ background: "#f0fdfa", borderRadius: 7, padding: "8px 10px", border: "1px solid #ccfbf1", fontSize: 10, color: "#0d9488", fontWeight: 500, display: "flex", gap: 7, alignItems: "center" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0d9488", flexShrink: 0 }} />
                AI auto-updated Silver Jhumkas stock after 2 orders — low stock alert sent
            </div>
        </SceneBox>
    );
};

/* ─── Scene 3: Orders ────────────────────────────────────────────────────── */
const SceneOrders: React.FC = () => {
    const orders = [
        { id: "#1042", status: "Confirmed", sBg: "#dcfce7", sCol: "#166534", customer: "Priya Sharma", item: "Cotton Kurta (M)", amount: "₹1,299", note: "WhatsApp · AI" },
        { id: "#1041", status: "Shipped", sBg: "#dbeafe", sCol: "#1e40af", customer: "Rahul Verma", item: "Handcrafted Vase", amount: "₹899", note: "BD12345678IN" },
        { id: "#1040", status: "Payment Pending", sBg: "#fef3c7", sCol: "#92400e", customer: "Anjali Gupta", item: "Embroidered Bag", amount: "₹2,199", note: "Link sent 5m ago" },
    ];
    return (
        <SceneBox title="Orders — Every sale tracked">
            {orders.map(o => (
                <div key={o.id} style={{ background: "#fff", borderRadius: 8, border: "1px solid #f1f5f9", overflow: "hidden", marginBottom: 7 }}>
                    <div style={{ background: "#f8fafc", padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#0d9488" }}>{o.id}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: o.sBg, color: o.sCol }}>{o.status}</span>
                    </div>
                    <div style={{ padding: "7px 10px" }}>
                        {([["Customer", o.customer], ["Item", o.item], ["Amount", o.amount], ["Note", o.note]] as [string, string][]).map(([k, v]) => (
                            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 2 }}>
                                <span>{k}</span><span style={{ color: "#0f172a", fontWeight: 600 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </SceneBox>
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
        <SceneBox title="Payments — Collected & tracked">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 8 }}>
                <StatCard val="₹24,800" label="Collected today" />
                <StatCard val="₹2,199" label="Pending" note="1 pending" noteColor="#f59e0b" />
                <StatCard val="16" label="Transactions" note="Today" noteColor="#2563eb" />
            </div>
            <div style={{ background: "#fff", borderRadius: 8, padding: "2px 10px", border: "1px solid #f1f5f9", marginBottom: 7 }}>
                {txns.map((t, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < txns.length - 1 ? "1px solid #f8fafc" : "none" }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 500, color: "#374151" }}>{t.name}</div>
                            <div style={{ fontSize: 9, color: "#94a3b8" }}>{t.sub}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{t.amt}</div>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: t.paid ? "#dcfce7" : "#fef3c7", color: t.paid ? "#166534" : "#92400e" }}>{t.paid ? "Paid" : "Pending"}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ background: "#f0fdfa", borderRadius: 7, padding: "7px 10px", border: "1px solid #ccfbf1", fontSize: 10, color: "#0d9488", fontWeight: 500 }}>
                Razorpay payment link auto-sent to Anjali via WhatsApp
            </div>
        </SceneBox>
    );
};

/* ─── Scene 5: Analytics ─────────────────────────────────────────────────── */
const SceneAnalytics: React.FC = () => {
    const bars = [30, 50, 42, 65, 48, 78, 90];
    const channels = [
        { name: "WhatsApp", pct: 65, color: "#25d366" },
        { name: "Instagram", pct: 25, color: "#e1306c" },
        { name: "Facebook", pct: 10, color: "#1877f2" },
    ];
    const topProducts = [
        { name: "Premium Cotton Kurta", rev: "₹18,200", units: 14, pct: 100 },
        { name: "Embroidered Bag", rev: "₹8,800", units: 4, pct: 48 },
        { name: "Handcrafted Vase", rev: "₹5,400", units: 6, pct: 30 },
    ];
    return (
        <SceneBox title="Analytics — Know your numbers">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 8 }}>
                <StatCard val="₹62,400" label="Revenue (30d)" note="+22% vs last month" noteColor="#0d9488" />
                <StatCard val="48" label="Orders (30d)" note="+8 this week" noteColor="#2563eb" />
                <StatCard val="18.5%" label="Conv rate" note="+2.1% vs last week" noteColor="#9333ea" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 7, marginBottom: 8 }}>
                {/* Revenue chart */}
                <div style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 7 }}>Revenue — Last 7 days</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 52 }}>
                        {bars.map((h, i) => (
                            <div key={i} style={{ flex: 1, height: `${h}%`, background: "#0d9488", opacity: 0.25 + (h / 150), borderRadius: "3px 3px 0 0" }} />
                        ))}
                    </div>
                </div>
                {/* Channel pie simulation */}
                <div style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 8 }}>Sales by channel</div>
                    {channels.map(c => (
                        <div key={c.name} style={{ marginBottom: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 2 }}>
                                <span style={{ color: "#374151", fontWeight: 500 }}>{c.name}</span>
                                <span style={{ color: c.color, fontWeight: 700 }}>{c.pct}%</span>
                            </div>
                            <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3 }}>
                                <div style={{ height: "100%", width: `${c.pct}%`, background: c.color, borderRadius: 3 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Top products */}
            <div style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 7 }}>Top products by revenue</div>
                {topProducts.map((p, i) => (
                    <div key={i} style={{ marginBottom: i < topProducts.length - 1 ? 7 : 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#0f172a" }}>{p.name}</span>
                            <span style={{ fontSize: 10, color: "#64748b" }}>{p.rev} · {p.units} sold</span>
                        </div>
                        <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                            <div style={{ height: "100%", width: `${p.pct}%`, background: "linear-gradient(90deg,#0d9488,#0ea5e9)", borderRadius: 2 }} />
                        </div>
                    </div>
                ))}
            </div>
        </SceneBox>
    );
};

const SCENE_COMPONENTS = [SceneDashboard, SceneWhatsApp, SceneProducts, SceneOrders, ScenePayments, SceneAnalytics];
const SIDEBAR_ACTIVES = ["Dashboard", "Conversations", "Products", "Orders", "Payments", "Analytics"];

/* ─── Main player ────────────────────────────────────────────────────────── */
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
                        <span style={{ background: "#ef4444" }} />
                        <span style={{ background: "#f59e0b" }} />
                        <span style={{ background: "#22c55e" }} />
                    </div>
                    <div className="hdp-url">hypnate.in/dashboard</div>
                    <div style={{ width: 56 }} />
                </div>

                {/* App shell — fixed height, clip inside */}
                <div className="hdp-app">
                    <Sidebar active={SIDEBAR_ACTIVES[cur]} />
                    <SceneComp key={cur} />
                </div>

                {/* Progress */}
                <div className="hdp-prog-track">
                    <div className="hdp-prog-fill" style={{ width: `${progress}%` }} />
                </div>

                {/* Info bar */}
                <div className="hdp-infobar">
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="hdp-info-title">{SCENES[cur].title}</div>
                        <div className="hdp-info-sub">{SCENES[cur].sub}</div>
                    </div>
                    <button className="hdp-play-btn" onClick={() => setPlaying(p => !p)}>
                        {playing ? "⏸ Pause" : "▶ Play"}
                    </button>
                </div>

                {/* Controls */}
                <div className="hdp-controls">
                    <button className="hdp-ctrl-btn hdp-prev" onClick={() => goTo((cur - 1 + SCENES.length) % SCENES.length)}>← Prev</button>
                    <div className="hdp-dots-row">
                        {SCENES.map((_, i) => (
                            <div key={i} className={"hdp-dot" + (i === cur ? " active" : "")} onClick={() => goTo(i)} />
                        ))}
                    </div>
                    <button className="hdp-ctrl-btn hdp-next" onClick={() => goTo((cur + 1) % SCENES.length)}>Next →</button>
                </div>

                {/* CTA */}
                <div className="hdp-cta">
                    <span className="hdp-cta-txt">Ready to set this up for your business?</span>
                    <button className="hdp-cta-btn" onClick={() => navigate("/signup")}>Start free — no card needed →</button>
                </div>
            </div>
        </>
    );
};

const css = `
.hdp-wrap { background:#0f172a; border-radius:16px; width:100%; max-width:860px; margin:0 auto; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 24px 64px rgba(0,0,0,0.4); }

.hdp-chrome { background:#1e293b; padding:9px 16px; display:flex; align-items:center; gap:10px; border-bottom:1px solid #334155; flex-shrink:0; }
.hdp-chrome-dots { display:flex; gap:5px; }
.hdp-chrome-dots span { width:9px; height:9px; border-radius:50%; display:inline-block; }
.hdp-url { flex:1; background:#0f172a; border-radius:6px; padding:3px 12px; font-size:11px; color:#64748b; text-align:center; max-width:260px; margin:0 auto; }

.hdp-app { display:flex; height:380px; flex-shrink:0; overflow:hidden; animation:hdpFade .3s ease; }
@keyframes hdpFade { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }

.hdp-prog-track { height:3px; background:#334155; flex-shrink:0; }
.hdp-prog-fill  { height:100%; background:#0d9488; transition:width .05s linear; }

.hdp-infobar { background:#1e293b; padding:10px 16px; display:flex; align-items:center; justify-content:space-between; gap:12px; border-top:1px solid #334155; flex-shrink:0; }
.hdp-info-title { font-size:12px; font-weight:700; color:#fff; margin-bottom:2px; }
.hdp-info-sub   { font-size:10px; color:#64748b; line-height:1.5; }
.hdp-play-btn { padding:5px 12px; background:#334155; color:#94a3b8; border:none; border-radius:7px; font-size:11px; font-weight:700; cursor:pointer; white-space:nowrap; transition:all .15s; flex-shrink:0; }
.hdp-play-btn:hover { background:#475569; color:#fff; }

.hdp-controls { background:#1e293b; padding:7px 16px; display:flex; align-items:center; justify-content:space-between; border-top:1px solid #334155; flex-shrink:0; }
.hdp-ctrl-btn { padding:5px 14px; border-radius:8px; border:none; cursor:pointer; font-size:11px; font-weight:700; transition:all .15s; }
.hdp-prev { background:#334155; color:#94a3b8; }
.hdp-prev:hover { background:#475569; color:#fff; }
.hdp-next { background:#0d9488; color:#fff; }
.hdp-next:hover { background:#0f766e; }
.hdp-dots-row { display:flex; gap:5px; align-items:center; }
.hdp-dot { width:7px; height:7px; border-radius:50%; background:#334155; cursor:pointer; transition:all .2s; }
.hdp-dot.active { background:#0d9488; width:18px; border-radius:3px; }

.hdp-cta { background:#0d9488; padding:11px 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; flex-shrink:0; }
.hdp-cta-txt { font-size:12px; font-weight:600; color:#fff; }
.hdp-cta-btn { padding:7px 16px; background:#fff; color:#0d9488; border:none; border-radius:8px; font-size:12px; font-weight:800; cursor:pointer; transition:all .15s; white-space:nowrap; }
.hdp-cta-btn:hover { background:#f0fdfa; transform:scale(1.02); }
`;