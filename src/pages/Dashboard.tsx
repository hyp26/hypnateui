import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, ShoppingBag, MessageCircle, Users,
  ArrowUpRight, ArrowDownRight, ChevronRight,
  Package, Clock, CheckCircle2, AlertCircle,
  Sparkles, Bell, Search, MoreHorizontal,
  IndianRupee, BarChart2, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { useAuthStore } from "../stores/useAuthStore";
import api from "../lib/api";

/* ─── TYPES ─── */
interface DashboardStats {
  todayRevenue: number;
  revenueChange: number;
  ordersToday: number;
  ordersChange: number;
  activeChats: number;
  totalCustomers: number;
  customersChange: number;
}

interface RecentOrder {
  id: number;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  products?: { product: { name: string } }[];
}

interface ChartPoint { day: string; revenue: number; orders: number }

/* ─── MOCK CHART DATA (replace with real API) ─── */
const MOCK_REVENUE: ChartPoint[] = [
  { day: "Mon", revenue: 4200, orders: 18 },
  { day: "Tue", revenue: 3100, orders: 12 },
  { day: "Wed", revenue: 5800, orders: 24 },
  { day: "Thu", revenue: 4700, orders: 19 },
  { day: "Fri", revenue: 6200, orders: 28 },
  { day: "Sat", revenue: 7800, orders: 35 },
  { day: "Sun", revenue: 5400, orders: 22 },
];

/* ─── STATUS CONFIGS ─── */
const ORDER_STATUS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING: { label: "Pending", color: "#92400e", bg: "#fef3c7", dot: "#f59e0b" },
  PROCESSING: { label: "Processing", color: "#1e40af", bg: "#dbeafe", dot: "#3b82f6" },
  SHIPPED: { label: "Shipped", color: "#065f46", bg: "#d1fae5", dot: "#10b981" },
  DELIVERED: { label: "Delivered", color: "#166534", bg: "#dcfce7", dot: "#16a34a" },
  CANCELLED: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2", dot: "#ef4444" },
};

/* ─── CUSTOM TOOLTIP ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px", padding: "12px 16px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
    }}>
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
interface StatCardProps {
  label: string; value: string; change?: number;
  icon: React.ReactNode; accent: string; delay: string;
}
const StatCard: React.FC<StatCardProps> = ({ label, value, change, icon, accent, delay }) => (
  <div style={{
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
    position: "relative",
    overflow: "hidden",
    animation: `slideUp 0.5s ease both`,
    animationDelay: delay,
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
  }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)";
    }}
  >
    {/* Accent blob */}
    <div style={{
      position: "absolute", top: "-20px", right: "-20px",
      width: "80px", height: "80px", borderRadius: "50%",
      background: accent, opacity: 0.12,
    }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
      <div style={{
        width: "42px", height: "42px", borderRadius: "12px",
        background: accent + "15", display: "flex", alignItems: "center",
        justifyContent: "center", color: accent,
      }}>
        {icon}
      </div>
      {change !== undefined && (
        <div style={{
          display: "flex", alignItems: "center", gap: "4px",
          padding: "4px 10px", borderRadius: "999px",
          background: change >= 0 ? "#dcfce7" : "#fee2e2",
          color: change >= 0 ? "#16a34a" : "#dc2626",
          fontSize: "12px", fontWeight: 600,
        }}>
          {change >= 0
            ? <ArrowUpRight style={{ width: 13, height: 13 }} />
            : <ArrowDownRight style={{ width: 13, height: 13 }} />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "6px", fontWeight: 500, letterSpacing: "0.02em" }}>
      {label}
    </p>
    <p style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", fontFamily: "'DM Sans', sans-serif" }}>
      {value}
    </p>
  </div>
);

/* ─── MAIN COMPONENT ─── */
export const Dashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>(MOCK_REVENUE);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [chartType, setChartType] = useState<"revenue" | "orders">("revenue");

  const fetchData = async () => {
    try {
      const [ordersRes, customersRes] = await Promise.all([
        api.get("/api/orders?limit=5&sort=createdAt_desc"),
        api.get("/api/customers"),
      ]);

      const orders: RecentOrder[] = ordersRes.data?.orders || ordersRes.data || [];
      const customers = customersRes.data?.customers || customersRes.data || [];

      setRecentOrders(orders.slice(0, 5));

      const todayRevenue = orders
        .filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString())
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      setStats({
        todayRevenue,
        revenueChange: 12.5,
        ordersToday: orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length,
        ordersChange: 4.2,
        activeChats: 8,
        totalCustomers: customers.length || 0,
        customersChange: -2.1,
      });

      setLastUpdated(new Date());
    } catch {
      // use fallback mock data
      setStats({ todayRevenue: 12450, revenueChange: 12.5, ordersToday: 24, ordersChange: 4.2, activeChats: 8, totalCustomers: 1240, customersChange: -2.1 });
      setRecentOrders([
        { id: 101, customerName: "Rahul Sharma", totalAmount: 1299, status: "DELIVERED", paymentStatus: "PAID", createdAt: new Date().toISOString(), products: [{ product: { name: "Cotton Kurta (Blue)" } }] },
        { id: 102, customerName: "Priya Mehta", totalAmount: 2499, status: "SHIPPED", paymentStatus: "PAID", createdAt: new Date().toISOString(), products: [{ product: { name: "Silk Saree" } }] },
        { id: 103, customerName: "Arjun Kumar", totalAmount: 899, status: "PROCESSING", paymentStatus: "PAID", createdAt: new Date().toISOString(), products: [{ product: { name: "Linen Shirt" } }] },
        { id: 104, customerName: "Sneha Patel", totalAmount: 3200, status: "PENDING", paymentStatus: "UNPAID", createdAt: new Date().toISOString(), products: [{ product: { name: "Embroidered Dupatta" } }] },
        { id: 105, customerName: "Vikram Singh", totalAmount: 1799, status: "DELIVERED", paymentStatus: "PAID", createdAt: new Date().toISOString(), products: [{ product: { name: "Jodhpuri Jacket" } }] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f8fafc" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#0ea5e9", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading dashboard...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .order-row:hover { background: #f8fafc !important; }
        .refresh-btn:hover { background: #f1f5f9 !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 32px" }}>

        {/* ── HEADER ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: "32px", animation: "slideUp 0.4s ease both",
        }}>
          <div>
            <p style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500, marginBottom: "4px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {greeting()},
            </p>
            <h1 style={{
              fontSize: "32px", fontWeight: 700, color: "#0f172a",
              fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.02em", lineHeight: 1.1,
            }}>
              {user?.name?.split(" ")[0] || "Merchant"} <span style={{ fontStyle: "italic", color: "#0ea5e9" }}>👋</span>
            </h1>
            <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "6px" }}>
              Here's what's happening with your store today.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={fetchData}
              className="refresh-btn"
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 14px", borderRadius: "10px", border: "1px solid #e2e8f0",
                background: "#fff", color: "#64748b", fontSize: "13px", fontWeight: 500,
                cursor: "pointer", transition: "background 0.15s",
              }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} />
              Refresh
            </button>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px", marginBottom: "28px",
        }}>
          <StatCard
            label="Today's Revenue" delay="0ms"
            value={`₹${(stats?.todayRevenue || 0).toLocaleString()}`}
            change={stats?.revenueChange}
            accent="#0ea5e9"
            icon={<IndianRupee style={{ width: 20, height: 20 }} />}
          />
          <StatCard
            label="Orders Today" delay="60ms"
            value={String(stats?.ordersToday || 0)}
            change={stats?.ordersChange}
            accent="#8b5cf6"
            icon={<ShoppingBag style={{ width: 20, height: 20 }} />}
          />
          <StatCard
            label="Active Chats" delay="120ms"
            value={String(stats?.activeChats || 0)}
            accent="#f59e0b"
            icon={<MessageCircle style={{ width: 20, height: 20 }} />}
          />
          <StatCard
            label="Total Customers" delay="180ms"
            value={(stats?.totalCustomers || 0).toLocaleString()}
            change={stats?.customersChange}
            accent="#10b981"
            icon={<Users style={{ width: 20, height: 20 }} />}
          />
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", marginBottom: "20px" }}>

          {/* Revenue Chart */}
          <div style={{
            background: "#fff", borderRadius: "20px", padding: "24px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
            animation: "slideUp 0.5s ease both", animationDelay: "200ms",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 600, color: "#0f172a", marginBottom: "2px" }}>Revenue Overview</h2>
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>Last 7 days</p>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(["revenue", "orders"] as const).map((t) => (
                  <button key={t} onClick={() => setChartType(t)} style={{
                    padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
                    border: "none", cursor: "pointer", transition: "all 0.15s", textTransform: "capitalize",
                    background: chartType === t ? "#0f172a" : "#f1f5f9",
                    color: chartType === t ? "#fff" : "#64748b",
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartType === "revenue" ? "#0ea5e9" : "#8b5cf6"} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={chartType === "revenue" ? "#0ea5e9" : "#8b5cf6"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={chartType}
                  stroke={chartType === "revenue" ? "#0ea5e9" : "#8b5cf6"}
                  strokeWidth={2.5}
                  fill="url(#grad1)"
                  dot={false}
                  activeDot={{ r: 5, fill: chartType === "revenue" ? "#0ea5e9" : "#8b5cf6", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Top product */}
            <div style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: "20px", padding: "22px",
              animation: "slideUp 0.5s ease both", animationDelay: "240ms",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <Sparkles style={{ width: 14, height: 14, color: "#f59e0b" }} />
                <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Top product today</p>
              </div>
              <p style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "4px", lineHeight: 1.3 }}>Cotton Kurta (Blue)</p>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>14 units sold</p>
              <div style={{ height: "4px", background: "#1e293b", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "72%", background: "linear-gradient(90deg, #0ea5e9, #8b5cf6)", borderRadius: "2px" }} />
              </div>
              <p style={{ fontSize: "12px", color: "#475569", marginTop: "8px" }}>72% of daily target</p>
            </div>

            {/* Weekly bars */}
            <div style={{
              background: "#fff", borderRadius: "20px", padding: "22px",
              border: "1px solid #f1f5f9",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              animation: "slideUp 0.5s ease both", animationDelay: "280ms",
              flex: 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>Orders by day</h3>
                <BarChart2 style={{ width: 16, height: 16, color: "#94a3b8" }} />
              </div>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }} barSize={14}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} />
                  <Bar dataKey="orders" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── RECENT ORDERS ── */}
        <div style={{
          background: "#fff", borderRadius: "20px",
          border: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
          animation: "slideUp 0.5s ease both", animationDelay: "300ms",
          overflow: "hidden",
        }}>
          {/* Table header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: 600, color: "#0f172a" }}>Recent Orders</h2>
              <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>Latest 5 transactions</p>
            </div>
            <button
              onClick={() => navigate("/orders")}
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                padding: "8px 14px", borderRadius: "10px",
                background: "#f8fafc", border: "1px solid #e2e8f0",
                color: "#0ea5e9", fontSize: "13px", fontWeight: 600,
                cursor: "pointer",
              }}
            >
              View all <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid", gridTemplateColumns: "1.5fr 1.5fr 2fr 1fr 1fr 1fr",
            padding: "12px 24px", background: "#fafafa",
          }}>
            {["Order ID", "Customer", "Product", "Amount", "Payment", "Status"].map((h) => (
              <p key={h} style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          {recentOrders.map((order, i) => {
            const status = ORDER_STATUS[order.status] || ORDER_STATUS.PENDING;
            const productName = order.products?.[0]?.product?.name || "—";
            return (
              <div
                key={order.id}
                className="order-row"
                onClick={() => navigate(`/orders/${order.id}`)}
                style={{
                  display: "grid", gridTemplateColumns: "1.5fr 1.5fr 2fr 1fr 1fr 1fr",
                  padding: "16px 24px",
                  borderBottom: i < recentOrders.length - 1 ? "1px solid #f8fafc" : "none",
                  cursor: "pointer", transition: "background 0.1s", alignItems: "center",
                  animation: "slideUp 0.4s ease both",
                  animationDelay: `${340 + i * 40}ms`,
                }}
              >
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#0ea5e9", fontFamily: "monospace" }}>
                  #{String(order.id).padStart(4, "0")}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "#e0f2fe", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#0284c7",
                    flexShrink: 0,
                  }}>
                    {order.customerName.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>{order.customerName}</p>
                </div>
                <p style={{ fontSize: "13px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {productName}
                </p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                  ₹{order.totalAmount.toLocaleString()}
                </p>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "3px 10px", borderRadius: "999px", width: "fit-content",
                  background: order.paymentStatus === "PAID" ? "#dcfce7" : "#fef3c7",
                  color: order.paymentStatus === "PAID" ? "#166534" : "#92400e",
                  fontSize: "11px", fontWeight: 600,
                }}>
                  <div style={{
                    width: "5px", height: "5px", borderRadius: "50%",
                    background: order.paymentStatus === "PAID" ? "#16a34a" : "#f59e0b",
                  }} />
                  {order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "3px 10px", borderRadius: "999px", width: "fit-content",
                  background: status.bg, color: status.color,
                  fontSize: "11px", fontWeight: 600,
                }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: status.dot }} />
                  {status.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── BOTTOM ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>

          {/* Setup checklist */}
          <div style={{
            background: "#fff", borderRadius: "20px", padding: "24px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            animation: "slideUp 0.5s ease both", animationDelay: "500ms",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 600, color: "#0f172a" }}>Setup Checklist</h2>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>3 of 5 complete</p>
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#0ea5e9" }}>60%</div>
            </div>

            {/* Progress */}
            <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", marginBottom: "20px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg, #0ea5e9, #8b5cf6)", borderRadius: "3px", transition: "width 1s ease" }} />
            </div>

            {[
              { label: "Verify Business Details", done: true },
              { label: "Connect Sales Channels", done: true },
              { label: "Upload Product Catalog", done: true },
              { label: "Setup Payment Gateway", done: false },
              { label: "Configure Auto-replies", done: false },
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 0",
                borderBottom: "1px solid #f8fafc",
              }}>
                {item.done
                  ? <CheckCircle2 style={{ width: 18, height: 18, color: "#16a34a", flexShrink: 0 }} />
                  : <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #cbd5e1", flexShrink: 0 }} />
                }
                <p style={{
                  fontSize: "14px",
                  color: item.done ? "#94a3b8" : "#0f172a",
                  fontWeight: item.done ? 400 : 500,
                  textDecoration: item.done ? "line-through" : "none",
                }}>
                  {item.label}
                </p>
                {!item.done && (
                  <ChevronRight style={{ width: 14, height: 14, color: "#cbd5e1", marginLeft: "auto", flexShrink: 0 }} />
                )}
              </div>
            ))}
            <button
              onClick={() => navigate("/onboarding")}
              style={{
                marginTop: "16px", width: "100%", padding: "11px",
                background: "#0f172a", color: "#fff", border: "none",
                borderRadius: "12px", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1e293b")}
              onMouseLeave={e => (e.currentTarget.style.background = "#0f172a")}
            >
              Complete Setup →
            </button>
          </div>

          {/* Quick actions */}
          <div style={{
            background: "#fff", borderRadius: "20px", padding: "24px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            animation: "slideUp 0.5s ease both", animationDelay: "540ms",
          }}>
            <h2 style={{ fontSize: "17px", fontWeight: 600, color: "#0f172a", marginBottom: "6px" }}>Quick Actions</h2>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px" }}>Jump to what you need</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "Add Product", icon: Package, color: "#8b5cf6", bg: "#f3f0ff", path: "/products/new" },
                { label: "View Orders", icon: ShoppingBag, color: "#0ea5e9", bg: "#e0f2fe", path: "/orders" },
                { label: "Customers", icon: Users, color: "#10b981", bg: "#d1fae5", path: "/customers" },
                { label: "Analytics", icon: TrendingUp, color: "#f59e0b", bg: "#fef3c7", path: "/analytics" },
                { label: "Conversations", icon: MessageCircle, color: "#ec4899", bg: "#fce7f3", path: "/conversations" },
                { label: "Hypnate X", icon: Sparkles, color: "#6366f1", bg: "#eef2ff", path: "/hypnate-x" },
              ].map(({ label, icon: Icon, color, bg, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "14px", borderRadius: "14px",
                    background: bg, border: "none", cursor: "pointer",
                    transition: "transform 0.15s, filter 0.15s", textAlign: "left",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
                    (e.currentTarget as HTMLButtonElement).style.filter = "brightness(0.97)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)";
                  }}
                >
                  <div style={{
                    width: "34px", height: "34px", borderRadius: "10px",
                    background: color + "20",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon style={{ width: 16, height: 16, color }} />
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