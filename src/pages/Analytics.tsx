import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Calendar, Download, TrendingUp, ShoppingBag,
  Users, IndianRupee, ArrowUpRight, ArrowDownRight,
  RefreshCw, Package, MessageCircle,
} from 'lucide-react';
import api from '../lib/api';

interface KPIs {
  revenue: number; revenueChange: number;
  orders: number; ordersChange: number;
  aov: number; aovChange: number;
  customers: number; newCustomers: number; newCustomersChange: number;
  convToOrderRate: number; returnRate: number;
}
interface AnalyticsData {
  period: { days: number };
  kpis: KPIs;
  chartData: { day: string; revenue: number; orders: number }[];
  channelData: { name: string; value: number; count: number; color: string }[];
  topProducts: { name: string; category: string; imageUrl: string | null; revenue: number; unitsSold: number }[];
  paymentMethods: { method: string; revenue: number; count: number }[];
  orderStatuses: { status: string; count: number }[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtCompact = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
      <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 700, margin: 0 }}>
          {p.name === 'revenue' ? fmtCompact(p.value) : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

const ChangeBadge = ({ change }: { change: number }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 3,
    fontSize: 12, fontWeight: 700,
    color: change >= 0 ? '#16a34a' : '#dc2626',
  }}>
    {change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
    {Math.abs(change)}%
  </span>
);

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#6366f1', SHIPPED: '#10b981',
  DELIVERED: '#16a34a', CANCELLED: '#ef4444', PAID: '#3b82f6',
};

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(7);
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [visible, setVisible] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const res = await api.get('/api/analytics/overview', { params: { days } });
      setData(res.data);
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  }, [days]);

  useEffect(() => {
    loadData();
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [loadData]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await api.get('/api/analytics/export', { params: { days }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `analytics-${days}days.csv`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch { alert('Export failed'); }
    finally { setExporting(false); }
  };

  const PERIOD_OPTS = [
    { label: '7 days', value: 7 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 },
  ];

  const kpis = data?.kpis;
  const totalPieValue = data?.channelData.reduce((s, c) => s + c.value, 0) || 100;

  return (
    <>
      <style>{css}</style>
      <div className={`an-root ${visible ? 'an-visible' : ''}`}>

        <div className="an-header">
          <div>
            <h1 className="an-title">Analytics</h1>
            <p className="an-sub">Track your business performance over time</p>
          </div>
          <div className="an-header-actions">
            <button onClick={() => loadData(true)} className="an-icon-btn" title="Refresh">
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
            </button>

            <div className="an-period-tabs">
              {PERIOD_OPTS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setDays(o.value)}
                  className={`an-period-btn ${days === o.value ? 'active' : ''}`}
                >
                  <Calendar size={12} />
                  {o.label}
                </button>
              ))}
            </div>

            <button onClick={handleExport} disabled={exporting} className="an-export-btn">
              {exporting
                ? <><div className="an-spinner" /> <span className="an-btn-label">Exporting…</span></>
                : <><Download size={14} /> <span className="an-btn-label">Export CSV</span></>}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="an-loading">
            <div className="an-spinner-lg" />
            <p>Loading analytics…</p>
          </div>
        ) : (
          <>
            <div className="an-kpis">
              {[
                { label: 'Revenue', value: fmt(kpis?.revenue ?? 0), change: kpis?.revenueChange, icon: <IndianRupee size={18} />, color: '#0ea5e9', bg: '#e0f2fe' },
                { label: 'Orders', value: String(kpis?.orders ?? 0), change: kpis?.ordersChange, icon: <ShoppingBag size={18} />, color: '#8b5cf6', bg: '#ede9fe' },
                { label: 'Avg Order Value', value: fmt(kpis?.aov ?? 0), change: kpis?.aovChange, icon: <TrendingUp size={18} />, color: '#f59e0b', bg: '#fef3c7' },
                { label: 'New Customers', value: String(kpis?.newCustomers ?? 0), change: kpis?.newCustomersChange, icon: <Users size={18} />, color: '#10b981', bg: '#d1fae5', sub: `${kpis?.customers ?? 0} total` },
              ].map((k, i) => (
                <div key={i} className="an-kpi" style={{ animationDelay: `${i * 50}ms` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {k.icon}
                    </div>
                    {k.change !== undefined && <ChangeBadge change={k.change} />}
                  </div>
                  <p className="an-kpi-label">{k.label}</p>
                  <p className="an-kpi-val" style={{ color: k.color }}>{k.value}</p>
                  {k.sub && <p className="an-kpi-sub">{k.sub}</p>}
                </div>
              ))}
            </div>

            <div className="an-chart-row">
              <div className="an-card an-chart-main">
                <div className="an-card-header">
                  <div>
                    <h3 className="an-card-title">
                      {chartMetric === 'revenue' ? 'Revenue' : 'Orders'} — Last {days} days
                    </h3>
                    <p className="an-card-sub">
                      {chartMetric === 'revenue' ? `Total: ${fmt(kpis?.revenue ?? 0)}` : `Total: ${kpis?.orders ?? 0} orders`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['revenue', 'orders'] as const).map(m => (
                      <button key={m} onClick={() => setChartMetric(m)} className={`an-metric-btn ${chartMetric === m ? 'active' : ''}`}>
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data?.chartData || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartMetric === 'revenue' ? '#0ea5e9' : '#8b5cf6'} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={chartMetric === 'revenue' ? '#0ea5e9' : '#8b5cf6'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                      tickFormatter={v => chartMetric === 'revenue' ? fmtCompact(v).replace('₹', '') : String(v)} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey={chartMetric}
                      stroke={chartMetric === 'revenue' ? '#0ea5e9' : '#8b5cf6'}
                      strokeWidth={2.5} fill="url(#chartGrad)" dot={false}
                      activeDot={{ r: 5, strokeWidth: 0, fill: chartMetric === 'revenue' ? '#0ea5e9' : '#8b5cf6' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="an-card an-chart-side">
                <div className="an-card-header">
                  <div>
                    <h3 className="an-card-title">Sales by Channel</h3>
                    <p className="an-card-sub">Conversation sources</p>
                  </div>
                  <MessageCircle size={16} color="#94a3b8" />
                </div>
                {(!data?.channelData || data.channelData.length === 0 || !data.channelData.some(c => c.count > 0)) ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '40px 0' }}>No chats or sales yet</p>
                ) : (
                  <>
                    <div style={{ position: 'relative', height: 180 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data?.channelData || []} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={0}>
                            {(data?.channelData || []).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={(v: any) => [`${v}%`, '']} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>{totalPieValue}%</p>
                          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Coverage</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      {(data?.channelData || []).map(c => (
                        <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color }} />
                            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{c.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.count} chats</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{c.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="an-chart-row an-chart-row-2">
              <div className="an-card an-products-card">
                <div className="an-card-header">
                  <div>
                    <h3 className="an-card-title">Top Products</h3>
                    <p className="an-card-sub">By revenue in selected period</p>
                  </div>
                  <Package size={16} color="#94a3b8" />
                </div>
                {(data?.topProducts || []).length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '20px 0' }}>No product sales yet</p>
                ) : (
                  <div className="an-top-products">
                    {(data?.topProducts || []).map((p, i) => {
                      const maxRev = data!.topProducts[0].revenue || 1;
                      const pct = Math.round((p.revenue / maxRev) * 100);
                      return (
                        <div key={i} className="an-product-row">
                          <div className="an-product-rank">#{i + 1}</div>
                          <div className="an-product-img">
                            {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={16} color="#94a3b8" />}
                          </div>
                          <div className="an-product-info">
                            <p className="an-product-name">{p.name}</p>
                            <div className="an-product-bar-wrap">
                              <div className="an-product-bar" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <div className="an-product-stats">
                            <p className="an-product-rev">{fmt(p.revenue)}</p>
                            <p className="an-product-units">{p.unitsSold} sold</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="an-side-col">
                <div className="an-mini-kpis">
                  <div className="an-mini-kpi">
                    <p className="an-mini-label">Conv → Order Rate</p>
                    <p className="an-mini-val" style={{ color: '#0ea5e9' }}>{kpis?.convToOrderRate ?? 0}%</p>
                    <p className="an-mini-sub">of chats convert</p>
                  </div>
                  <div className="an-mini-kpi">
                    <p className="an-mini-label">Return Rate</p>
                    <p className="an-mini-val" style={{ color: (kpis?.returnRate ?? 0) < 5 ? '#16a34a' : '#dc2626' }}>
                      {kpis?.returnRate ?? 0}%
                    </p>
                    <p className="an-mini-sub">{(kpis?.returnRate ?? 0) < 5 ? '✓ Healthy' : '⚠ Review needed'}</p>
                  </div>
                </div>

                <div className="an-card" style={{ flex: 1 }}>
                  <h3 className="an-card-title" style={{ marginBottom: 14 }}>Order Status</h3>
                  {(data?.orderStatuses || []).length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No orders yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={data?.orderStatuses || []} margin={{ top: 0, right: 0, left: -30, bottom: 0 }} barSize={18}>
                        <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                          tickFormatter={s => s.charAt(0) + s.slice(1).toLowerCase()} />
                        <Tooltip formatter={(v: any, n: any, p: any) => [v, p.payload.status]} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {(data?.orderStatuses || []).map((s, i) => <Cell key={i} fill={STATUS_COLOR[s.status] || '#94a3b8'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {(data?.paymentMethods || []).length > 0 && (
                  <div className="an-card">
                    <h3 className="an-card-title" style={{ marginBottom: 12 }}>Payment Methods</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(data?.paymentMethods || []).map((m, i) => {
                        const maxRev = data!.paymentMethods[0].revenue || 1;
                        const pct = Math.round((m.revenue / maxRev) * 100);
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{m.method || 'Unknown'}</span>
                              <span style={{ fontSize: 12, color: '#94a3b8' }}>{fmt(m.revenue)} · {m.count} txn</span>
                            </div>
                            <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3 }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: '#0d9488', borderRadius: 3, transition: 'width 0.5s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
@keyframes spin { to{transform:rotate(360deg)} }

.an-root { font-family:'Outfit',sans-serif; padding:28px 32px; opacity:0; transform:translateY(10px); transition:opacity 0.4s ease,transform 0.4s ease; }
.an-visible { opacity:1!important; transform:none!important; }

.an-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
.an-header-actions { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.an-title { font-size:28px; font-weight:800; color:#0f172a; margin:0; letter-spacing:-0.5px; }
.an-sub { font-size:13px; color:#94a3b8; margin:4px 0 0; }

.an-icon-btn { width:38px; height:38px; border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#64748b; transition:background 0.15s; flex-shrink:0; }
.an-icon-btn:hover { background:#f1f5f9; }

.an-period-tabs { display:flex; background:#f1f5f9; border-radius:10px; padding:3px; gap:2px; }
.an-period-btn { display:inline-flex; align-items:center; gap:5px; padding:6px 10px; border-radius:8px; font-size:12px; font-weight:600; border:none; cursor:pointer; font-family:'Outfit',sans-serif; background:transparent; color:#64748b; transition:all 0.15s; white-space:nowrap; }
.an-period-btn.active { background:#fff; color:#0f172a; box-shadow:0 1px 4px rgba(0,0,0,0.08); }

.an-export-btn { display:inline-flex; align-items:center; gap:7px; background:#0d9488; color:#fff; font-size:13px; font-weight:700; padding:9px 16px; border-radius:10px; border:none; cursor:pointer; font-family:'Outfit',sans-serif; transition:background 0.15s; }
.an-export-btn:hover:not(:disabled) { background:#0f766e; }
.an-export-btn:disabled { opacity:0.6; cursor:not-allowed; }
.an-spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }
.an-spinner-lg { width:32px; height:32px; border:3px solid #e2e8f0; border-top-color:#0d9488; border-radius:50%; animation:spin 0.7s linear infinite; }
.an-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:80px 20px; color:#94a3b8; font-size:14px; }

.an-kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px; }
.an-kpi { background:#fff; border-radius:16px; padding:20px; border:1px solid #f1f5f9; box-shadow:0 1px 4px rgba(0,0,0,0.04); animation:fadeUp 0.4s ease both; }
.an-kpi-label { font-size:12px; color:#94a3b8; font-weight:500; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 4px; }
.an-kpi-val { font-size:24px; font-weight:800; margin:0; letter-spacing:-0.5px; }
.an-kpi-sub { font-size:12px; color:#94a3b8; margin:4px 0 0; }

.an-chart-row { display:flex; gap:16px; margin-bottom:16px; }
.an-chart-row-2 { align-items:start; }
.an-card { background:#fff; border-radius:16px; padding:20px; border:1px solid #f1f5f9; box-shadow:0 1px 4px rgba(0,0,0,0.04); animation:fadeUp 0.4s ease both; }
.an-chart-main { flex:2; min-width:0; }
.an-chart-side { flex:1; min-width:0; }
.an-products-card { flex:1.5; min-width:0; }
.an-side-col { display:flex; flex-direction:column; gap:16px; flex:1; min-width:0; }
.an-card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
.an-card-title { font-size:15px; font-weight:700; color:#0f172a; margin:0 0 3px; }
.an-card-sub { font-size:12px; color:#94a3b8; margin:0; }

.an-metric-btn { padding:5px 12px; border-radius:8px; font-size:12px; font-weight:600; border:none; cursor:pointer; font-family:'Outfit',sans-serif; background:#f1f5f9; color:#64748b; transition:all 0.15s; }
.an-metric-btn.active { background:#0f172a; color:#fff; }

.an-top-products { display:flex; flex-direction:column; gap:10px; }
.an-product-row { display:flex; align-items:center; gap:12px; }
.an-product-rank { font-size:12px; font-weight:700; color:#94a3b8; width:20px; text-align:center; flex-shrink:0; }
.an-product-img { width:38px; height:38px; border-radius:10px; background:#f1f5f9; overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.an-product-info { flex:1; min-width:0; }
.an-product-name { font-size:13px; font-weight:600; color:#0f172a; margin:0 0 5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.an-product-bar-wrap { height:5px; background:#f1f5f9; border-radius:3px; overflow:hidden; }
.an-product-bar { height:100%; background:linear-gradient(90deg,#0d9488,#0ea5e9); border-radius:3px; transition:width 0.6s ease; }
.an-product-stats { text-align:right; flex-shrink:0; }
.an-product-rev { font-size:13px; font-weight:800; color:#0f172a; margin:0 0 2px; }
.an-product-units { font-size:11px; color:#94a3b8; margin:0; }

.an-mini-kpis { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.an-mini-kpi { background:#fff; border-radius:14px; padding:16px; border:1px solid #f1f5f9; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
.an-mini-label { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 6px; }
.an-mini-val { font-size:26px; font-weight:800; margin:0 0 3px; letter-spacing:-0.5px; }
.an-mini-sub { font-size:11px; color:#94a3b8; margin:0; }

@media (max-width: 1024px) {
  .an-chart-row { flex-direction:column; }
  .an-chart-main, .an-chart-side { flex:none; width:100%; }
  .an-chart-row-2 { flex-direction:column; }
  .an-products-card { flex:none; width:100%; }
  .an-side-col { flex:none; width:100%; }
}

@media (max-width: 768px) {
  .an-root { padding:16px; }
  .an-title { font-size:22px; }
  .an-kpis { grid-template-columns:repeat(2,1fr); gap:10px; }
  .an-kpi { padding:14px; }
  .an-kpi-val { font-size:20px; }
  .an-btn-label { display:none; }
  .an-export-btn { padding:9px 12px; }
  .an-period-btn { padding:5px 8px; font-size:11px; }
}

@media (max-width: 480px) {
  .an-kpis { grid-template-columns:1fr 1fr; }
  .an-mini-kpis { grid-template-columns:1fr 1fr; }
}
`;