import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, ShoppingBag, MessageCircle, Users,
  ArrowUpRight, ArrowDownRight, ChevronRight,
  Package, CheckCircle2, Sparkles, IndianRupee,
  BarChart2, RefreshCw, AlertTriangle, Bell, Wifi, WifiOff,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { useAuthStore } from "../stores/useAuthStore";
import api from "../lib/api";

const POLL_INTERVAL = 30_000;

interface DashboardStats {
  todayRevenue: number; revenueChange: number; ordersToday: number;
  ordersChange: number; activeChats: number; totalCustomers: number;
  newCustomersThisMonth: number; lowStockCount: number; unreadNotifications: number;
}
interface RecentOrder {
  id: number; customerName: string; totalAmount: number;
  status: string; paymentStatus: string; createdAt: string;
  products?: { product: { name: string } }[];
}
interface ChartPoint { day: string; revenue: number; orders: number }
interface TopProduct { name: string; unitsSold: number }
interface DashboardData {
  stats: DashboardStats; recentOrders: RecentOrder[];
  chartData: ChartPoint[]; topProduct: TopProduct | null;
  statusBreakdown: Record<string, number>; generatedAt: string;
}

const ORDER_STATUS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING: { label: "Pending", color: "#92400e", bg: "#fef3c7", dot: "#f59e0b" },
  PROCESSING: { label: "Processing", color: "#1e40af", bg: "#dbeafe", dot: "#3b82f6" },
  SHIPPED: { label: "Shipped", color: "#065f46", bg: "#d1fae5", dot: "#10b981" },
  DELIVERED: { label: "Delivered", color: "#166534", bg: "#dcfce7", dot: "#16a34a" },
  CANCELLED: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2", dot: "#ef4444" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 16px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
      <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "6px" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: "14px", fontWeight: 600 }}>
          {p.name === "revenue" ? `₹${p.value.toLocaleString()}` : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

const Skeleton: React.FC<{ w?: string; h?: string; r?: string }> = ({ w = "100%", h = "16px", r = "8px" }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease infinite" }} />
);

export const Dashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [chartType, setChartType] = useState<"revenue" | "orders">("revenue");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDashboard = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true); else setRefreshing(true);
      const res = await api.get("/api/dashboard");
      setData(res.data); setError(null); setOnline(true);
    } catch (err: any) {
      setOnline(false);
      if (!silent) setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchDashboard();
    pollRef.current = setInterval(() => fetchDashboard(true), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchDashboard]);

  const greeting = () => { const h = new Date().getHours(); if (h < 12) return "Good morning"; if (h < 17) return "Good afternoon"; return "Good evening"; };
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  if (loading) return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, sans-serif", padding: "16px" }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "80px", color: "#94a3b8", fontSize: "14px" }}>
        <div style={{ width: "20px", height: "20px", border: "2px solid #e2e8f0", borderTopColor: "#0ea5e9", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        Loading your dashboard…
      </div>
    </div>
  );

  if (error && !data) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", fontFamily: "'DM Sans', sans-serif", padding: "16px" }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Dashboard unavailable</h3>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>{error}</p>
        <button onClick={() => fetchDashboard()} style={{ background: "#0ea5e9", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Try again</button>
      </div>
    </div>
  );

  const { stats, recentOrders, chartData, topProduct, statusBreakdown } = data!;
  const generatedAt = data?.generatedAt ? fmtTime(data.generatedAt) : "";

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .order-row:hover { background: #f8fafc !important; }
        .refresh-btn:hover { background: #f1f5f9 !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

        /* ── Responsive layout classes ── */
        .dash-wrap { padding: 16px; max-width: 1400px; margin: 0 auto; }

        /* Stat cards: 2-col on mobile, 4-col on desktop */
        .dash-stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        /* Stat card inner — fix clipping */
        .dash-stat-card {
          background: #fff;
          border-radius: 16px;
          padding: 14px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          position: relative;
          overflow: hidden;
          min-width: 0; /* prevent overflow */
        }

        /* Main chart + sidebar */
        .dash-main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        /* Bottom 2-col */
        .dash-bottom-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        /* Quick actions: 2-col always */
        .dash-quick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        /* Orders table */
        .dash-header-row { display: none; }
        .dash-order-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 12px 16px;
          border-bottom: 1px solid #f8fafc;
          cursor: pointer;
          transition: background 0.1s;
        }
        .dash-order-row-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .dash-order-row-bottom { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .dash-order-product { display: none; }

        /* Header meta row */
        .dash-header-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        @media (min-width: 640px) {
          .dash-wrap { padding: 24px; }
          .dash-stat-grid { gap: 16px; }
          .dash-stat-card { padding: 18px 20px; }
        }

        @media (min-width: 1024px) {
          .dash-wrap { padding: 32px; }
          .dash-stat-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
          .dash-stat-card { padding: 20px 24px; }
          .dash-main-grid { grid-template-columns: 1fr 340px; gap: 20px; margin-bottom: 20px; }
          .dash-bottom-grid { grid-template-columns: 1fr 1fr; gap: 20px; }

          /* Desktop order table */
          .dash-header-row {
            display: grid;
            grid-template-columns: 1fr 1.5fr 2fr 1fr 1fr 1fr;
            padding: 12px 24px;
            background: #fafafa;
            border-bottom: 1px solid #f1f5f9;
          }
          .dash-order-row {
            display: grid;
            grid-template-columns: 1fr 1.5fr 2fr 1fr 1fr 1fr;
            flex-direction: unset;
            gap: 0;
            padding: 14px 24px;
            align-items: center;
          }
          .dash-order-row-top { display: contents; }
          .dash-order-row-bottom { display: contents; }
          .dash-order-product { display: block; }
          .dash-order-paybadge { display: inline-flex !important; }
        }
      `}</style>

      <div className="dash-wrap">

        {/* ── HEADER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", animation: "slideUp 0.4s ease both", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500, marginBottom: "4px", letterSpacing: "0.05em", textTransform: "uppercase" }}>{greeting()},</p>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, color: "#0f172a", fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.02em", lineHeight: 1.1, margin: 0 }}>
              {user?.name?.split(" ")[0] || "Merchant"} <span style={{ fontStyle: "italic" }}>👋</span>
            </h1>
            <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "6px" }}>Here's what's happening with your store today.</p>
          </div>
          <div className="dash-header-meta">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: online ? "#16a34a" : "#dc2626" }}>
              {online ? <Wifi style={{ width: 14, height: 14 }} /> : <WifiOff style={{ width: 14, height: 14 }} />}
              {online ? "Live" : "Offline"}
            </div>
            {stats.lowStockCount > 0 && (
              <button onClick={() => navigate("/products?filter=low-stock")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 12px", borderRadius: "10px", background: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                <AlertTriangle style={{ width: 13, height: 13 }} />{stats.lowStockCount} low stock
              </button>
            )}
            <button onClick={() => fetchDashboard(true)} className="refresh-btn" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "background 0.15s" }}>
              <RefreshCw style={{ width: 14, height: 14, animation: refreshing ? "spin 0.6s linear infinite" : "none" }} />
            </button>
            <div style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>Updated {generatedAt}</div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="dash-stat-grid">
          {[
            { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, change: stats.revenueChange, accent: "#0ea5e9", icon: <IndianRupee style={{ width: 18, height: 18 }} />, sub: "vs yesterday", delay: "0ms" },
            { label: "Orders Today", value: String(stats.ordersToday), change: stats.ordersChange, accent: "#8b5cf6", icon: <ShoppingBag style={{ width: 18, height: 18 }} />, sub: "vs yesterday", delay: "60ms" },
            { label: "Active Chats", value: String(stats.activeChats), accent: "#f59e0b", icon: <MessageCircle style={{ width: 18, height: 18 }} />, sub: "open chats", delay: "120ms" },
            { label: "Customers", value: stats.totalCustomers.toLocaleString(), accent: "#10b981", icon: <Users style={{ width: 18, height: 18 }} />, sub: `+${stats.newCustomersThisMonth} this month`, delay: "180ms" },
          ].map((s, i) => (
            <div key={i} className="dash-stat-card" style={{ animation: `slideUp 0.5s ease both`, animationDelay: s.delay }}>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "70px", height: "70px", borderRadius: "50%", background: s.accent, opacity: 0.1, pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: s.accent + "15", display: "flex", alignItems: "center", justifyContent: "center", color: s.accent, flexShrink: 0 }}>{s.icon}</div>
                {s.change !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: "3px", padding: "2px 7px", borderRadius: "999px", background: s.change >= 0 ? "#dcfce7" : "#fee2e2", color: s.change >= 0 ? "#16a34a" : "#dc2626", fontSize: "11px", fontWeight: 600, flexShrink: 0 }}>
                    {s.change >= 0 ? <ArrowUpRight style={{ width: 11, height: 11 }} /> : <ArrowDownRight style={{ width: 11, height: 11 }} />}{Math.abs(s.change)}%
                  </div>
                )}
              </div>
              <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "3px", fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: "clamp(16px, 3vw, 24px)", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID (chart + sidebar) ── */}
        <div className="dash-main-grid">
          {/* Chart */}
          <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", animation: "slideUp 0.5s ease both", animationDelay: "200ms" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", marginBottom: "2px" }}>Revenue Overview</h2>
                <p style={{ fontSize: "12px", color: "#94a3b8" }}>Last 7 days</p>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(["revenue", "orders"] as const).map((t) => (
                  <button key={t} onClick={() => setChartType(t)} style={{ padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, border: "none", cursor: "pointer", transition: "all 0.15s", textTransform: "capitalize", background: chartType === t ? "#0f172a" : "#f1f5f9", color: chartType === t ? "#fff" : "#64748b" }}>{t}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartType === "revenue" ? "#0ea5e9" : "#8b5cf6"} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={chartType === "revenue" ? "#0ea5e9" : "#8b5cf6"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey={chartType} stroke={chartType === "revenue" ? "#0ea5e9" : "#8b5cf6"} strokeWidth={2.5} fill="url(#grad1)" dot={false} activeDot={{ r: 5, fill: chartType === "revenue" ? "#0ea5e9" : "#8b5cf6", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "20px", padding: "20px", animation: "slideUp 0.5s ease both", animationDelay: "240ms" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <Sparkles style={{ width: 14, height: 14, color: "#f59e0b" }} />
                <p style={{ fontSize: "11px", color: "#64748b", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>Top product (30 days)</p>
              </div>
              {topProduct ? (
                <>
                  <p style={{ fontSize: "17px", fontWeight: 600, color: "#fff", marginBottom: "4px", lineHeight: 1.3 }}>{topProduct.name}</p>
                  <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>{topProduct.unitsSold} units sold</p>
                </>
              ) : <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>No sales data yet</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {Object.entries(ORDER_STATUS).map(([key, cfg]) => {
                  const count = statusBreakdown[key] || 0;
                  const total = Object.values(statusBreakdown).reduce((a, b) => a + b, 0) || 1;
                  if (count === 0) return null;
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: "11px", color: "#64748b", flex: 1 }}>{cfg.label}</span>
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>{count}</span>
                      <div style={{ width: "40px", height: "3px", borderRadius: "2px", background: "#1e293b", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.round((count / total) * 100)}%`, background: cfg.dot, borderRadius: "2px" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", animation: "slideUp 0.5s ease both", animationDelay: "280ms" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", margin: 0 }}>Orders by day</h3>
                <BarChart2 style={{ width: 16, height: 16, color: "#94a3b8" }} />
              </div>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }} barSize={12}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} />
                  <Bar dataKey="orders" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── RECENT ORDERS ── */}
        <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", animation: "slideUp 0.5s ease both", animationDelay: "300ms", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", margin: 0 }}>Recent Orders</h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Latest 5 transactions</p>
            </div>
            <button onClick={() => navigate("/orders")} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 12px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#0ea5e9", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
              View all <ChevronRight style={{ width: 13, height: 13 }} />
            </button>
          </div>

          {/* Desktop header */}
          <div className="dash-header-row">
            {["Order ID", "Customer", "Product", "Amount", "Payment", "Status"].map((h) => (
              <p key={h} style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{h}</p>
            ))}
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>No orders yet</div>
          ) : (
            recentOrders.map((order, i) => {
              const status = ORDER_STATUS[order.status] || ORDER_STATUS.PENDING;
              const productName = order.products?.[0]?.product?.name || "—";
              return (
                <div
                  key={order.id}
                  className="order-row dash-order-row"
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{ borderBottom: i < recentOrders.length - 1 ? "1px solid #f8fafc" : "none", animation: "slideUp 0.4s ease both", animationDelay: `${340 + i * 40}ms` }}
                >
                  {/* Mobile: top row = id + customer + amount */}
                  <div className="dash-order-row-top">
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#0ea5e9", fontFamily: "monospace", margin: 0 }}>#{String(order.id).padStart(4, "0")}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                      <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#0284c7", flexShrink: 0 }}>{order.customerName.charAt(0).toUpperCase()}</div>
                      <p style={{ fontSize: "12px", fontWeight: 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{order.customerName}</p>
                    </div>
                    {/* product — hidden on mobile via CSS */}
                    <p className="dash-order-product" style={{ fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{productName}</p>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a", margin: 0 }}>₹{order.totalAmount.toLocaleString()}</p>
                  </div>
                  {/* Mobile: bottom row = payment + status */}
                  <div className="dash-order-row-bottom">
                    <div className="dash-order-paybadge" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "999px", background: order.paymentStatus === "PAID" ? "#dcfce7" : "#fef3c7", color: order.paymentStatus === "PAID" ? "#166534" : "#92400e", fontSize: "10px", fontWeight: 600 }}>
                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: order.paymentStatus === "PAID" ? "#16a34a" : "#f59e0b" }} />{order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "999px", background: status.bg, color: status.color, fontSize: "10px", fontWeight: 600 }}>
                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: status.dot }} />{status.label}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── BOTTOM GRID ── */}
        <div className="dash-bottom-grid">
          {/* Checklist */}
          <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", animation: "slideUp 0.5s ease both", animationDelay: "500ms" }}>
            {(() => {
              const items = [
                { label: "Verify Business Details", done: true },
                { label: "Connect Sales Channels", done: false },
                { label: "Upload Product Catalog", done: !!topProduct },
                { label: "Setup Payment Gateway", done: false },
                { label: "Configure Auto-replies", done: false },
              ];
              const completedCount = items.filter(i => i.done).length;
              const pct = Math.round((completedCount / 5) * 100);
              return (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", margin: 0 }}>Setup Checklist</h2>
                      <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{completedCount} of 5 complete</p>
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#0ea5e9" }}>{pct}%</div>
                  </div>
                  <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", marginBottom: "16px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #0ea5e9, #8b5cf6)", borderRadius: "3px" }} />
                  </div>
                  {items.map((item) => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "1px solid #f8fafc" }}>
                      {item.done ? <CheckCircle2 style={{ width: 16, height: 16, color: "#16a34a", flexShrink: 0 }} /> : <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #cbd5e1", flexShrink: 0 }} />}
                      <p style={{ fontSize: "13px", color: item.done ? "#94a3b8" : "#0f172a", fontWeight: item.done ? 400 : 500, textDecoration: item.done ? "line-through" : "none", flex: 1, margin: 0 }}>{item.label}</p>
                      {!item.done && <ChevronRight style={{ width: 13, height: 13, color: "#cbd5e1" }} />}
                    </div>
                  ))}
                  <button onClick={() => navigate("/onboarding")} style={{ marginTop: "16px", width: "100%", padding: "11px", background: "#0d9488", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                    Complete Setup →
                  </button>
                </>
              );
            })()}
          </div>

          {/* Quick actions */}
          <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", animation: "slideUp 0.5s ease both", animationDelay: "540ms" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", marginBottom: "4px", marginTop: 0 }}>Quick Actions</h2>
            <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>Jump to what you need</p>
            <div className="dash-quick-grid">
              {[
                { label: "Add Product", icon: Package, color: "#8b5cf6", bg: "#f3f0ff", path: "/products/new" },
                { label: "View Orders", icon: ShoppingBag, color: "#0ea5e9", bg: "#e0f2fe", path: "/orders" },
                { label: "Customers", icon: Users, color: "#10b981", bg: "#d1fae5", path: "/customers" },
                { label: "Analytics", icon: TrendingUp, color: "#f59e0b", bg: "#fef3c7", path: "/analytics" },
                { label: "Conversations", icon: MessageCircle, color: "#ec4899", bg: "#fce7f3", path: "/conversations" },
                { label: "Hypnate X", icon: Sparkles, color: "#6366f1", bg: "#eef2ff", path: "/hypnate-x" },
              ].map(({ label, icon: Icon, color, bg, path }) => (
                <button key={label} onClick={() => navigate(path)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: bg, border: "none", cursor: "pointer", transition: "transform 0.15s", textAlign: "left" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 14, height: 14, color }} />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};