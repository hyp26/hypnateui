import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag, MessageCircle, Users, ArrowUpRight, ArrowDownRight,
  ChevronRight, Package, CheckCircle2, Sparkles, IndianRupee,
  BarChart2, RefreshCw, TrendingUp, Loader2, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { useAuthStore } from "../stores/useAuthStore";
import api from "../lib/api";

/* ─── TYPES ─── */
interface Order {
  id: number;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  products?: { product: { name: string } }[];
}

interface Customer { id: number; createdAt: string; totalSpent: number }
interface Product { id: number; name: string; stock: number; createdAt: string }

interface DashStats {
  todayRevenue: number;
  revenueChange: number;
  ordersToday: number;
  ordersChange: number;
  activeChats: number;
  totalCustomers: number;
  customersChange: number;
  topProduct: string;
  topProductUnits: number;
}

interface ChartPoint { day: string; revenue: number; orders: number }

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING: { label: "Pending", color: "#92400e", bg: "#fef3c7", dot: "#f59e0b" },
  PROCESSING: { label: "Processing", color: "#1e40af", bg: "#dbeafe", dot: "#3b82f6" },
  SHIPPED: { label: "Shipped", color: "#065f46", bg: "#d1fae5", dot: "#10b981" },
  DELIVERED: { label: "Delivered", color: "#166534", bg: "#dcfce7", dot: "#16a34a" },
  CANCELLED: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2", dot: "#ef4444" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ─── HELPERS ─── */
const pctChange = (curr: number, prev: number) =>
  prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100 * 10) / 10;

const isToday = (d: string) =>
  new Date(d).toDateString() === new Date().toDateString();

const isYesterday = (d: string) => {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return new Date(d).toDateString() === y.toDateString();
};

const buildChart = (orders: Order[]): ChartPoint[] => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const dayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === dateStr);
    return {
      day: DAYS[d.getDay()],
      revenue: Math.round(dayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0)),
      orders: dayOrders.length,
    };
  });
};

/* ─── TOOLTIP ─── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 16px" }}>
      <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "6px" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: "14px", fontWeight: 600 }}>
          {p.name === "revenue" ? `₹${p.value.toLocaleString()}` : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

/* ─── STAT CARD ─── */
const StatCard = ({ label, value, change, icon, accent, delay, loading }: any) => (
  <div style={{
    background: "#fff", borderRadius: "20px", padding: "24px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
    position: "relative", overflow: "hidden",
    animation: "slideUp 0.5s ease both", animationDelay: delay,
    transition: "transform 0.2s, box-shadow 0.2s",
  }}
    onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = "translateY(-2px)"; d.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)"; }}
    onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = "translateY(0)"; d.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)"; }}
  >
    <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: accent, opacity: 0.12 }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
      <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: accent + "15", display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
        {icon}
      </div>
      {change !== undefined && !loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "999px", background: change >= 0 ? "#dcfce7" : "#fee2e2", color: change >= 0 ? "#16a34a" : "#dc2626", fontSize: "12px", fontWeight: 600 }}>
          {change >= 0 ? <ArrowUpRight style={{ width: 13, height: 13 }} /> : <ArrowDownRight style={{ width: 13, height: 13 }} />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "6px", fontWeight: 500, letterSpacing: "0.02em" }}>{label}</p>
    {loading
      ? <div style={{ width: "80px", height: "28px", background: "#f1f5f9", borderRadius: "6px", animation: "pulse 1.5s ease infinite" }} />
      : <p style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", fontFamily: "'DM Sans',sans-serif" }}>{value}</p>
    }
  </div>
);

/* ─── MAIN ─── */
export const Dashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [chartType, setChartType] = useState<"revenue" | "orders">("revenue");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const [ordersRes, customersRes] = await Promise.allSettled([
        api.get("/api/orders?limit=100"),
        api.get("/api/customers"),
      ]);

      const allOrders: Order[] = ordersRes.status === "fulfilled"
        ? (ordersRes.value.data?.orders || ordersRes.value.data || [])
        : [];

      const allCustomers: Customer[] = customersRes.status === "fulfilled"
        ? (customersRes.value.data?.customers || customersRes.value.data || [])
        : [];

      // Today vs yesterday orders
      const todayOrders = allOrders.filter((o) => isToday(o.createdAt));
      const yesterdayOrders = allOrders.filter((o) => isYesterday(o.createdAt));

      const todayRevenue = todayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
      const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

      // Today vs yesterday customers
      const todayCusts = allCustomers.filter((c) => isToday(c.createdAt)).length;
      const yesterdayCusts = allCustomers.filter((c) => isYesterday(c.createdAt)).length;

      // Top product
      const productCount: Record<string, number> = {};
      allOrders.forEach((o) => {
        o.products?.forEach(({ product }) => {
          productCount[product.name] = (productCount[product.name] || 0) + 1;
        });
      });
      const topProduct = Object.entries(productCount).sort((a, b) => b[1] - a[1])[0];

      setStats({
        todayRevenue,
        revenueChange: pctChange(todayRevenue, yesterdayRevenue),
        ordersToday: todayOrders.length,
        ordersChange: pctChange(todayOrders.length, yesterdayOrders.length),
        activeChats: 0, // connect to conversations API when ready
        totalCustomers: allCustomers.length,
        customersChange: pctChange(todayCusts, yesterdayCusts),
        topProduct: topProduct?.[0] || "No data yet",
        topProductUnits: topProduct?.[1] || 0,
      });

      setRecentOrders(
        [...allOrders]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      );
      setChartData(buildChart(allOrders));
      setLastUpdated(new Date());
    } catch (err: any) {
      setError("Failed to load dashboard data. Check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const checklist = [
    { label: "Verify Business Details", done: !!user },
    { label: "Connect Sales Channels", done: false },
    { label: "Upload Product Catalog", done: (stats?.topProductUnits || 0) > 0 },
    { label: "Setup Payment Gateway", done: false },
    { label: "Configure Auto-replies", done: false },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const donePct = Math.round((doneCount / checklist.length) * 100);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "'DM Sans',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .order-row:hover   { background:#f8fafc !important; }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", animation: "slideUp 0.4s ease both" }}>
          <div>
            <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500, marginBottom: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {greeting()},
            </p>
            <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#0f172a", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              {user?.name?.split(" ")[0] || "Merchant"} <span style={{ fontStyle: "italic", color: "#0ea5e9" }}>👋</span>
            </h1>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>Here's what's happening with your store today.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", background: "#fee2e2", borderRadius: "8px", color: "#dc2626", fontSize: "12px" }}>
                <AlertCircle style={{ width: 14, height: 14 }} /> {error}
              </div>
            )}
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
            >
              {refreshing
                ? <Loader2 style={{ width: 14, height: 14, animation: "spin 0.8s linear infinite" }} />
                : <RefreshCw style={{ width: 14, height: 14 }} />
              }
              Refresh
            </button>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px", marginBottom: "24px" }}>
          <StatCard loading={loading} delay="0ms" label="Today's Revenue" value={`₹${(stats?.todayRevenue || 0).toLocaleString()}`} change={stats?.revenueChange} accent="#0ea5e9" icon={<IndianRupee style={{ width: 20, height: 20 }} />} />
          <StatCard loading={loading} delay="60ms" label="Orders Today" value={String(stats?.ordersToday || 0)} change={stats?.ordersChange} accent="#8b5cf6" icon={<ShoppingBag style={{ width: 20, height: 20 }} />} />
          <StatCard loading={loading} delay="120ms" label="Active Chats" value={String(stats?.activeChats || 0)} accent="#f59e0b" icon={<MessageCircle style={{ width: 20, height: 20 }} />} />
          <StatCard loading={loading} delay="180ms" label="Total Customers" value={(stats?.totalCustomers || 0).toLocaleString()} change={stats?.customersChange} accent="#10b981" icon={<Users style={{ width: 20, height: 20 }} />} />
        </div>

        {/* ── CHART + SIDEBAR ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", marginBottom: "20px" }}>

          {/* Area chart */}
          <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", animation: "slideUp 0.5s ease both", animationDelay: "200ms" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>Revenue Overview</h2>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Last 7 days — real data</p>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(["revenue", "orders"] as const).map((t) => (
                  <button key={t} onClick={() => setChartType(t)} style={{ padding: "5px 12px", borderRadius: "7px", fontSize: "12px", fontWeight: 500, border: "none", cursor: "pointer", textTransform: "capitalize", background: chartType === t ? "#0f172a" : "#f1f5f9", color: chartType === t ? "#fff" : "#64748b" }}>{t}</button>
                ))}
              </div>
            </div>
            {loading
              ? <div style={{ height: "220px", background: "#f8fafc", borderRadius: "12px", animation: "pulse 1.5s ease infinite" }} />
              : chartData.length === 0
                ? <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "14px" }}>No data for the last 7 days</div>
                : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartType === "revenue" ? "#0ea5e9" : "#8b5cf6"} stopOpacity={0.15} />
                          <stop offset="100%" stopColor={chartType === "revenue" ? "#0ea5e9" : "#8b5cf6"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey={chartType} stroke={chartType === "revenue" ? "#0ea5e9" : "#8b5cf6"} strokeWidth={2.5} fill="url(#cg)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )
            }
          </div>

          {/* Sidebar cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Top product */}
            <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: "20px", padding: "22px", animation: "slideUp 0.5s ease both", animationDelay: "240ms" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Sparkles style={{ width: 13, height: 13, color: "#f59e0b" }} />
                <p style={{ fontSize: "11px", color: "#64748b", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Top product today</p>
              </div>
              {loading
                ? <div style={{ height: "20px", background: "#1e293b", borderRadius: "6px", marginBottom: "8px", animation: "pulse 1.5s ease infinite" }} />
                : <p style={{ fontSize: "17px", fontWeight: 600, color: "#fff", marginBottom: "4px", lineHeight: 1.3 }}>{stats?.topProduct || "No orders yet"}</p>
              }
              <p style={{ fontSize: "12px", color: "#475569", marginBottom: "14px" }}>
                {loading ? "—" : `${stats?.topProductUnits || 0} orders`}
              </p>
              <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: loading ? "0%" : "72%", background: "linear-gradient(90deg,#0ea5e9,#8b5cf6)", borderRadius: "2px", transition: "width 1s ease" }} />
              </div>
            </div>

            {/* Bar chart */}
            <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", animation: "slideUp 0.5s ease both", animationDelay: "280ms", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>Orders by day</h3>
                <BarChart2 style={{ width: 15, height: 15, color: "#94a3b8" }} />
              </div>
              {loading
                ? <div style={{ height: "100px", background: "#f8fafc", borderRadius: "8px", animation: "pulse 1.5s ease infinite" }} />
                : (
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }} barSize={12}>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: "#f8fafc" }} content={<ChartTooltip />} />
                      <Bar dataKey="orders" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )
              }
            </div>
          </div>
        </div>

        {/* ── RECENT ORDERS ── */}
        <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", animation: "slideUp 0.5s ease both", animationDelay: "300ms", overflow: "hidden", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>Recent Orders</h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Live from your store</p>
            </div>
            <button onClick={() => navigate("/orders")} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 12px", borderRadius: "9px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#0ea5e9", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              View all <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Col headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 2fr 1fr 1fr 1fr", padding: "10px 24px", background: "#fafafa" }}>
            {["Order ID", "Customer", "Product", "Amount", "Payment", "Status"].map((h) => (
              <p key={h} style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</p>
            ))}
          </div>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 2fr 1fr 1fr 1fr", padding: "14px 24px", borderBottom: "1px solid #f8fafc", gap: "16px" }}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} style={{ height: "14px", background: "#f1f5f9", borderRadius: "4px", animation: "pulse 1.5s ease infinite" }} />
                ))}
              </div>
            ))
          ) : recentOrders.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "#94a3b8" }}>
              <ShoppingBag style={{ width: 32, height: 32, margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ fontSize: "14px" }}>No orders yet. Share your store link to get started!</p>
            </div>
          ) : recentOrders.map((order, i) => {
            const sc = STATUS_CFG[order.status] || STATUS_CFG.PENDING;
            const pName = order.products?.[0]?.product?.name || "—";
            return (
              <div key={order.id} className="order-row" onClick={() => navigate(`/orders/${order.id}`)} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 2fr 1fr 1fr 1fr", padding: "14px 24px", borderBottom: i < recentOrders.length - 1 ? "1px solid #f8fafc" : "none", cursor: "pointer", alignItems: "center", transition: "background 0.1s", animation: "slideUp 0.4s ease both", animationDelay: `${340 + i * 40}ms` }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#0ea5e9", fontFamily: "monospace" }}>#{String(order.id).padStart(4, "0")}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#0284c7", flexShrink: 0 }}>
                    {order.customerName.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>{order.customerName}</p>
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pName}</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>₹{order.totalAmount.toLocaleString()}</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "999px", width: "fit-content", background: order.paymentStatus === "PAID" ? "#dcfce7" : "#fef3c7", color: order.paymentStatus === "PAID" ? "#166534" : "#92400e", fontSize: "10px", fontWeight: 600 }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: order.paymentStatus === "PAID" ? "#16a34a" : "#f59e0b" }} />
                  {order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "999px", width: "fit-content", background: sc.bg, color: sc.color, fontSize: "10px", fontWeight: 600 }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc.dot }} />
                  {sc.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── BOTTOM ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          {/* Checklist */}
          <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", animation: "slideUp 0.5s ease both", animationDelay: "500ms" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>Setup Checklist</h2>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{doneCount} of {checklist.length} complete</p>
              </div>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#0ea5e9" }}>{donePct}%</span>
            </div>
            <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "3px", marginBottom: "18px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${donePct}%`, background: "linear-gradient(90deg,#0ea5e9,#8b5cf6)", borderRadius: "3px", transition: "width 1s ease" }} />
            </div>
            {checklist.map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "1px solid #f8fafc" }}>
                {item.done
                  ? <CheckCircle2 style={{ width: 17, height: 17, color: "#16a34a", flexShrink: 0 }} />
                  : <div style={{ width: 17, height: 17, borderRadius: "50%", border: "2px solid #cbd5e1", flexShrink: 0 }} />
                }
                <p style={{ fontSize: "13px", color: item.done ? "#94a3b8" : "#0f172a", fontWeight: item.done ? 400 : 500, textDecoration: item.done ? "line-through" : "none" }}>
                  {item.label}
                </p>
                {!item.done && <ChevronRight style={{ width: 13, height: 13, color: "#cbd5e1", marginLeft: "auto", flexShrink: 0 }} />}
              </div>
            ))}
            <button onClick={() => navigate("/onboarding")} style={{ marginTop: "14px", width: "100%", padding: "10px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "11px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              Complete Setup →
            </button>
          </div>

          {/* Quick actions */}
          <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", animation: "slideUp 0.5s ease both", animationDelay: "540ms" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", marginBottom: "4px" }}>Quick Actions</h2>
            <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "18px" }}>Jump to what you need</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "Add Product", icon: Package, color: "#8b5cf6", bg: "#f3f0ff", path: "/products/new" },
                { label: "View Orders", icon: ShoppingBag, color: "#0ea5e9", bg: "#e0f2fe", path: "/orders" },
                { label: "Customers", icon: Users, color: "#10b981", bg: "#d1fae5", path: "/customers" },
                { label: "Analytics", icon: TrendingUp, color: "#f59e0b", bg: "#fef3c7", path: "/analytics" },
                { label: "Conversations", icon: MessageCircle, color: "#ec4899", bg: "#fce7f3", path: "/conversations" },
                { label: "Hypnate X", icon: Sparkles, color: "#6366f1", bg: "#eef2ff", path: "/hypnate-x" },
              ].map(({ label, icon: Icon, color, bg, path }) => (
                <button key={label} onClick={() => navigate(path)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "13px", borderRadius: "13px", background: bg, border: "none", cursor: "pointer", textAlign: "left", transition: "transform 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 15, height: 15, color }} />
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};