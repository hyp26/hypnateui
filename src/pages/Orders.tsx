import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../stores/useOrderStore';
import {
  Search, Download, Package, ChevronRight,
  ShoppingBag, Clock, CheckCircle2, Truck, XCircle,
  CreditCard, RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';

type StatusFilter = 'all' | 'PENDING' | 'PAYMENT_PENDING' | 'PAID' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Pending', color: '#92400e', bg: '#fef3c7', dot: '#f59e0b', icon: <Clock size={11} /> },
  PAYMENT_PENDING: { label: 'Payment Pending', color: '#9a3412', bg: '#fff7ed', dot: '#f97316', icon: <CreditCard size={11} /> },
  PAID: { label: 'Paid', color: '#1e40af', bg: '#dbeafe', dot: '#3b82f6', icon: <CheckCircle2 size={11} /> },
  CONFIRMED: { label: 'Confirmed', color: '#3730a3', bg: '#ede9fe', dot: '#6366f1', icon: <CheckCircle2 size={11} /> },
  SHIPPED: { label: 'Shipped', color: '#065f46', bg: '#d1fae5', dot: '#10b981', icon: <Truck size={11} /> },
  DELIVERED: { label: 'Delivered', color: '#166534', bg: '#dcfce7', dot: '#16a34a', icon: <Package size={11} /> },
  CANCELLED: { label: 'Cancelled', color: '#991b1b', bg: '#fee2e2', dot: '#ef4444', icon: <XCircle size={11} /> },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CFG[status?.toUpperCase()] || STATUS_CFG.PENDING;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

const PayBadge = ({ status }: { status: string }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: status?.toUpperCase() === 'PAID' ? '#dcfce7' : '#fff7ed',
    color: status?.toUpperCase() === 'PAID' ? '#166534' : '#9a3412',
  }}>
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: status?.toUpperCase() === 'PAID' ? '#16a34a' : '#f97316' }} />
    {status?.toUpperCase() === 'PAID' ? 'Paid' : 'Unpaid'}
  </span>
);

export const Orders: React.FC = () => {
  const { orders, fetchOrders, loading, error } = useOrderStore();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exporting, setExporting] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchOrders();
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [fetchOrders]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await api.get('/api/orders/export/all', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders-export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch { alert('Export failed'); }
    finally { setExporting(false); }
  };

  const filtered = orders.filter(order => {
    const matchStatus = filterStatus === 'all' || order.status?.toUpperCase() === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || String(order.id).includes(q) || order.customerName?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalRevenue = filtered.reduce((s, o) => s + (o.total || 0), 0);
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const STATUS_TABS: StatusFilter[] = ['all', 'PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <>
      <style>{css}</style>
      <div className={`or-root ${visible ? 'or-visible' : ''}`}>

        <div className="or-header">
          <div>
            <h1 className="or-title">Orders</h1>
            <p className="or-sub">{orders.length} total · {fmt(totalRevenue)} revenue shown</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => fetchOrders()} className="or-refresh-btn" title="Refresh">
              <RefreshCw size={14} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
            </button>
            <button onClick={handleExport} disabled={exporting} className="or-export-btn">
              {exporting
                ? <><div className="or-btn-spinner" /> Exporting…</>
                : <><Download size={14} /> <span className="or-export-label">Export CSV</span></>}
            </button>
          </div>
        </div>

        <div className="or-stats">
          {[
            { label: 'Total Orders', value: orders.length, color: '#0ea5e9' },
            { label: 'Pending', value: orders.filter(o => o.status?.toUpperCase() === 'PENDING').length, color: '#f59e0b' },
            { label: 'Shipped', value: orders.filter(o => o.status?.toUpperCase() === 'SHIPPED').length, color: '#10b981' },
            { label: 'Delivered', value: orders.filter(o => o.status?.toUpperCase() === 'DELIVERED').length, color: '#16a34a' },
          ].map((s, i) => (
            <div key={i} className="or-stat" style={{ animationDelay: `${i * 50}ms` }}>
              <span className="or-stat-val" style={{ color: s.color }}>{s.value}</span>
              <span className="or-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="or-toolbar">
          <div className="or-search-wrap">
            <Search size={14} className="or-search-icon" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by order ID or customer…"
              className="or-search"
            />
          </div>
          <div className="or-tabs">
            {STATUS_TABS.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`or-tab ${filterStatus === s ? 'active' : ''}`}
              >
                {s === 'all' ? 'All' : STATUS_CFG[s]?.label || s}
                {s !== 'all' && (
                  <span className="or-tab-count">
                    {orders.filter(o => o.status?.toUpperCase() === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="or-table-wrap">
          {loading ? (
            <div className="or-state">
              <div className="or-spinner" />
              <p>Loading orders…</p>
            </div>
          ) : error ? (
            <div className="or-state" style={{ color: '#dc2626' }}>
              <XCircle size={36} strokeWidth={1.5} />
              <p>{error}</p>
              <button onClick={() => fetchOrders()} className="or-export-btn" style={{ marginTop: 8 }}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="or-state">
              <ShoppingBag size={44} strokeWidth={1.2} color="#cbd5e1" />
              <p style={{ fontWeight: 600, color: '#374151' }}>No orders found</p>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                {filterStatus !== 'all' ? 'Try a different status filter' : 'Orders will appear here once customers start buying'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <table className="or-table or-desktop-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, i) => {
                    const items = order.items || [];
                    const total = order.total || 0;
                    return (
                      <tr key={order.id} className="or-row" onClick={() => navigate(`/orders/${order.id}`)} style={{ animationDelay: `${i * 25}ms` }}>
                        <td><span className="or-id">#{String(order.id).padStart(4, '0')}</span></td>
                        <td className="or-date">{order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : '—'}</td>
                        <td>
                          <div className="or-customer">
                            <div className="or-avatar">{order.customerName?.charAt(0)?.toUpperCase() || '?'}</div>
                            <div>
                              <p className="or-cname">{order.customerName}</p>
                              {order.customerPhone && <p className="or-cphone">{order.customerPhone}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="or-items-count">{items.length} item{items.length !== 1 ? 's' : ''}</td>
                        <td><PayBadge status={order.paymentStatus} /></td>
                        <td><StatusBadge status={order.status} /></td>
                        <td style={{ textAlign: 'right' }}><span className="or-total">{fmt(total)}</span></td>
                        <td><ChevronRight size={16} color="#94a3b8" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="or-mobile-list">
                {filtered.map((order, i) => {
                  const items = order.items || [];
                  return (
                    <div key={order.id} className="or-mobile-card" onClick={() => navigate(`/orders/${order.id}`)} style={{ animationDelay: `${i * 25}ms` }}>
                      <div className="or-mobile-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="or-avatar">{order.customerName?.charAt(0)?.toUpperCase() || '?'}</div>
                          <div>
                            <p className="or-cname">{order.customerName}</p>
                            <p className="or-cphone">{order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : '—'}</p>
                          </div>
                        </div>
                        <span className="or-total">{fmt(order.total || 0)}</span>
                      </div>
                      <div className="or-mobile-bottom">
                        <span className="or-id">#{String(order.id).padStart(4, '0')}</span>
                        <span className="or-items-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                        <PayBadge status={order.paymentStatus} />
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
@keyframes spin { to { transform:rotate(360deg); } }

.or-root { font-family:'Outfit',sans-serif; padding:28px 32px; opacity:0; transform:translateY(10px); transition:opacity 0.4s ease, transform 0.4s ease; }
.or-visible { opacity:1 !important; transform:none !important; }

.or-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; gap:12px; flex-wrap:wrap; }
.or-title { font-size:28px; font-weight:800; color:#0f172a; margin:0; letter-spacing:-0.5px; }
.or-sub { font-size:13px; color:#94a3b8; margin:4px 0 0; }

.or-refresh-btn { display:flex; align-items:center; justify-content:center; width:38px; height:38px; border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; color:#64748b; transition:background 0.15s; flex-shrink:0; }
.or-refresh-btn:hover { background:#f1f5f9; }

.or-export-btn { display:inline-flex; align-items:center; gap:7px; background:#0d9488; color:#fff; font-size:13px; font-weight:700; padding:10px 18px; border-radius:10px; border:none; cursor:pointer; font-family:'Outfit',sans-serif; transition:background 0.15s; }
.or-export-btn:hover:not(:disabled) { background:#0f766e; }
.or-export-btn:disabled { opacity:0.6; cursor:not-allowed; }
.or-btn-spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }

.or-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
.or-stat { background:#fff; border-radius:14px; padding:18px 20px; border:1px solid #f1f5f9; box-shadow:0 1px 4px rgba(0,0,0,0.04); animation:fadeUp 0.4s ease both; }
.or-stat-val { display:block; font-size:28px; font-weight:800; letter-spacing:-1px; margin-bottom:4px; }
.or-stat-label { font-size:12px; color:#94a3b8; font-weight:500; text-transform:uppercase; letter-spacing:0.5px; }

.or-toolbar { display:flex; flex-direction:column; gap:12px; background:#fff; padding:14px 16px; border-radius:14px; border:1px solid #f1f5f9; box-shadow:0 1px 4px rgba(0,0,0,0.04); margin-bottom:20px; }
.or-search-wrap { position:relative; }
.or-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; }
.or-search { width:100%; box-sizing:border-box; padding:9px 12px 9px 36px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; font-family:'Outfit',sans-serif; color:#0f172a; background:#f8fafc; outline:none; transition:border-color 0.2s; }
.or-search:focus { border-color:#0d9488; background:#fff; }

.or-tabs { display:flex; gap:6px; flex-wrap:wrap; }
.or-tab { display:inline-flex; align-items:center; gap:5px; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600; border:none; cursor:pointer; font-family:'Outfit',sans-serif; background:#f1f5f9; color:#64748b; transition:all 0.15s; white-space:nowrap; }
.or-tab:hover { background:#e2e8f0; }
.or-tab.active { background:#0d9488; color:#fff; }
.or-tab-count { background:rgba(255,255,255,0.25); padding:1px 6px; border-radius:20px; font-size:10px; }
.or-tab:not(.active) .or-tab-count { background:#e2e8f0; color:#64748b; }

.or-table-wrap { background:#fff; border-radius:16px; border:1px solid #f1f5f9; box-shadow:0 2px 8px rgba(0,0,0,0.05); overflow:hidden; }
.or-table { width:100%; border-collapse:collapse; font-size:13px; }
.or-table thead tr { background:#fafafa; }
.or-table th { padding:13px 16px; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.6px; border-bottom:1px solid #f1f5f9; text-align:left; }
.or-row { cursor:pointer; transition:background 0.1s; animation:fadeUp 0.35s ease both; }
.or-row:hover { background:#f8fafc; }
.or-row td { padding:14px 16px; border-bottom:1px solid #f8fafc; vertical-align:middle; }
.or-row:last-child td { border-bottom:none; }

.or-id { font-family:monospace; font-size:13px; font-weight:700; color:#0d9488; }
.or-date { font-size:12px; color:#94a3b8; white-space:nowrap; }
.or-customer { display:flex; align-items:center; gap:10px; }
.or-avatar { width:32px; height:32px; border-radius:50%; background:#e0f2fe; color:#0284c7; font-weight:800; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.or-cname { font-size:13px; font-weight:600; color:#0f172a; margin:0 0 2px; }
.or-cphone { font-size:11px; color:#94a3b8; margin:0; }
.or-items-count { font-size:12px; color:#64748b; }
.or-total { font-size:14px; font-weight:800; color:#0f172a; }

.or-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:10px; color:#94a3b8; font-size:14px; text-align:center; }
.or-spinner { width:28px; height:28px; border:3px solid #e2e8f0; border-top-color:#0d9488; border-radius:50%; animation:spin 0.7s linear infinite; }

/* Mobile cards */
.or-mobile-list { display:none; flex-direction:column; gap:0; }
.or-mobile-card { padding:14px 16px; border-bottom:1px solid #f8fafc; cursor:pointer; transition:background 0.1s; animation:fadeUp 0.35s ease both; }
.or-mobile-card:last-child { border-bottom:none; }
.or-mobile-card:hover { background:#f8fafc; }
.or-mobile-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.or-mobile-bottom { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }

@media (max-width: 768px) {
  .or-root { padding:16px; }
  .or-title { font-size:22px; }
  .or-stats { grid-template-columns:repeat(2,1fr); gap:10px; }
  .or-stat { padding:14px 16px; }
  .or-stat-val { font-size:22px; }
  .or-desktop-table { display:none; }
  .or-mobile-list { display:flex !important; }
  .or-export-label { display:none; }
  .or-export-btn { padding:10px 12px; }
}

@media (max-width: 480px) {
  .or-stats { grid-template-columns:repeat(2,1fr); }
  .or-tab { font-size:11px; padding:5px 8px; }
}
`;