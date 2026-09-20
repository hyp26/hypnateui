import React, { useState, useEffect, useCallback } from 'react';
import {
  Download, CreditCard, Search, ArrowUpRight, ArrowDownRight,
  X, Copy, CheckCheck, ExternalLink, IndianRupee, TrendingUp,
  Clock, RefreshCw, Wallet, AlertCircle,
} from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../stores/useAuthStore';
import { hasPlanFeature } from '../config/planEntitlements';

interface Transaction {
  id: string;
  orderId: number;
  customer: string;
  phone?: string;
  email?: string;
  amount: number;
  paymentStatus: string;
  orderStatus: string;
  method: string;
  type: 'credit' | 'debit';
  createdAt: string;
}

interface Stats {
  totalCollected: number;
  totalTransactions: number;
  thisMonthCollected: number;
  monthlyChange: number;
  pendingSettlement: number;
  pendingCount: number;
  totalRefunded: number;
  refundCount: number;
  methodBreakdown: { method: string; total: number; count: number }[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PAID: { label: 'Paid', color: '#166534', bg: '#dcfce7', dot: '#16a34a' },
  UNPAID: { label: 'Unpaid', color: '#9a3412', bg: '#fff7ed', dot: '#f97316' },
  REFUNDED: { label: 'Refunded', color: '#1e40af', bg: '#dbeafe', dot: '#3b82f6' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CFG[status?.toUpperCase()] || STATUS_CFG.UNPAID;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const PaymentLinkModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({ amount: '', customerName: '', customerPhone: '', customerEmail: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ shortUrl: string; amount: number } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.amount || Number(form.amount) <= 0) { setError('Enter a valid amount'); return; }
    try {
      setLoading(true); setError('');
      const res = await api.post('/api/payments/link', {
        amount: Number(form.amount),
        customerName: form.customerName || undefined,
        customerPhone: form.customerPhone || undefined,
        customerEmail: form.customerEmail || undefined,
        description: form.description || undefined,
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create payment link');
    } finally { setLoading(false); }
  };

  const copyLink = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pl-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pl-modal">
        <div className="pl-modal-header">
          <h2 className="pl-modal-title"><CreditCard size={18} /> Create Payment Link</h2>
          <button onClick={onClose} className="pl-close"><X size={16} /></button>
        </div>

        {result ? (
          <div className="pl-success">
            <div className="pl-success-icon">✓</div>
            <h3>Payment link created!</h3>
            <p>Share this link with your customer to collect {fmt(result.amount)}</p>
            <div className="pl-link-box">
              <span className="pl-link-url">{result.shortUrl}</span>
              <button onClick={copyLink} className="pl-copy-btn">
                {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <a href={result.shortUrl} target="_blank" rel="noreferrer" className="pl-open-btn">
                <ExternalLink size={13} /> Open Link
              </a>
              <button onClick={() => { setResult(null); setForm({ amount: '', customerName: '', customerPhone: '', customerEmail: '', description: '' }); }} className="pl-new-btn">
                Create Another
              </button>
            </div>
          </div>
        ) : (
          <div className="pl-form">
            {error && <div className="pl-error"><AlertCircle size={13} /> {error}</div>}

            <div className="pl-field">
              <label className="pl-label">Amount (₹) *</label>
              <div className="pl-input-prefix">
                <span>₹</span>
                <input type="number" min="1" value={form.amount} onChange={e => set('amount', e.target.value)}
                  placeholder="0" className="pl-input pl-prefixed" autoFocus />
              </div>
            </div>

            <div className="pl-field">
              <label className="pl-label">Customer Name</label>
              <input value={form.customerName} onChange={e => set('customerName', e.target.value)}
                placeholder="e.g. Rahul Sharma" className="pl-input" />
            </div>

            <div className="pl-row">
              <div className="pl-field">
                <label className="pl-label">Phone</label>
                <input value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)}
                  placeholder="+91 98765 43210" className="pl-input" />
              </div>
              <div className="pl-field">
                <label className="pl-label">Email</label>
                <input value={form.customerEmail} onChange={e => set('customerEmail', e.target.value)}
                  placeholder="customer@email.com" className="pl-input" />
              </div>
            </div>

            <div className="pl-field">
              <label className="pl-label">Description</label>
              <input value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="e.g. Payment for Order #1023" className="pl-input" />
            </div>

            <div className="pl-modal-footer">
              <button onClick={onClose} className="pl-cancel-btn">Cancel</button>
              <button onClick={handleCreate} disabled={loading} className="pl-create-btn">
                {loading ? <><div className="pl-spinner" /> Creating…</> : <><CreditCard size={14} /> Create Link</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Payments: React.FC = () => {
  const selectedPlan = useAuthStore((state) => state.user?.seller?.selectedPlan);
  const canCreatePaymentLink = hasPlanFeature(selectedPlan, 'paymentLinks');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const [txRes, stRes] = await Promise.allSettled([
        api.get('/api/payments', { params: { search: search || undefined, status: statusFilter !== 'all' ? statusFilter : undefined } }),
        api.get('/api/payments/stats'),
      ]);
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data);
      if (stRes.status === 'fulfilled') setStats(stRes.value.data);
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  }, [search, statusFilter]);

  useEffect(() => { loadData(); const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, [loadData]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await api.get('/api/payments/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'payments-export.csv';
      document.body.appendChild(a); a.click(); a.remove();
    } catch { alert('Export failed'); }
    finally { setExporting(false); }
  };

  const STATUS_TABS = ['all', 'PAID', 'UNPAID', 'REFUNDED'];
  const totalShown = transactions.reduce((s, t) => s + (t.type === 'credit' ? t.amount : -t.amount), 0);

  return (
    <>
      <style>{css}</style>
      {showModal && canCreatePaymentLink && <PaymentLinkModal onClose={() => setShowModal(false)} />}

      <div className={`py-root ${visible ? 'py-visible' : ''}`}>

        <div className="py-header">
          <div>
            <h1 className="py-title">Payments</h1>
            <p className="py-sub">{transactions.length} transactions · {fmt(totalShown)} net</p>
          </div>
          <div className="py-header-actions">
            <button onClick={() => loadData(true)} className="py-icon-btn" title="Refresh">
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
            </button>
            <button onClick={handleExport} disabled={exporting} className="py-outline-btn">
              {exporting ? <><div className="py-spinner" /> <span className="py-btn-label">Exporting…</span></> : <><Download size={14} /> <span className="py-btn-label">Export CSV</span></>}
            </button>
            <button
              onClick={() => { if (canCreatePaymentLink) setShowModal(true); }}
              disabled={!canCreatePaymentLink}
              title={canCreatePaymentLink ? 'Create a payment link' : 'Payment link generation requires Pro or Business'}
              aria-label={canCreatePaymentLink ? 'Create Payment Link' : 'Create Payment Link, requires Pro or Business plan'}
              className="py-primary-btn"
              style={!canCreatePaymentLink ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
            >
              <CreditCard size={14} /> <span className="py-btn-label">{canCreatePaymentLink ? 'Create Payment Link' : 'Payment Link · Pro+'}</span>
            </button>
          </div>
        </div>

        <div className="py-stats">
          <div className="py-stat" style={{ animationDelay: '0ms' }}>
            <div className="py-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><TrendingUp size={18} /></div>
            <div>
              <p className="py-stat-label">Total Collected</p>
              <p className="py-stat-val">{fmt(stats?.totalCollected ?? 0)}</p>
              {stats && (
                <p className={`py-stat-change ${stats.monthlyChange >= 0 ? 'up' : 'down'}`}>
                  {stats.monthlyChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(stats.monthlyChange)}% vs last month
                </p>
              )}
            </div>
          </div>

          <div className="py-stat" style={{ animationDelay: '60ms' }}>
            <div className="py-stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}><Clock size={18} /></div>
            <div>
              <p className="py-stat-label">Pending Collection</p>
              <p className="py-stat-val">{fmt(stats?.pendingSettlement ?? 0)}</p>
              <p className="py-stat-note">{stats?.pendingCount ?? 0} unpaid orders</p>
            </div>
          </div>

          <div className="py-stat" style={{ animationDelay: '120ms' }}>
            <div className="py-stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}><IndianRupee size={18} /></div>
            <div>
              <p className="py-stat-label">This Month</p>
              <p className="py-stat-val">{fmt(stats?.thisMonthCollected ?? 0)}</p>
              <p className="py-stat-note">{stats?.totalTransactions ?? 0} total transactions</p>
            </div>
          </div>

          <div className="py-stat" style={{ animationDelay: '180ms' }}>
            <div className="py-stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><Wallet size={18} /></div>
            <div>
              <p className="py-stat-label">Refunds</p>
              <p className="py-stat-val">{fmt(stats?.totalRefunded ?? 0)}</p>
              <p className="py-stat-note">{stats?.refundCount ?? 0} refunded</p>
            </div>
          </div>
        </div>

        {stats?.methodBreakdown && stats.methodBreakdown.length > 0 && (
          <div className="py-methods">
            <p className="py-methods-label">By Payment Method</p>
            <div className="py-methods-list">
              {stats.methodBreakdown.map((m, i) => (
                <div key={i} className="py-method-chip">
                  <span className="py-method-name">{m.method}</span>
                  <span className="py-method-val">{fmt(m.total)}</span>
                  <span className="py-method-count">{m.count} txn</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="py-toolbar">
          <div className="py-search-wrap">
            <Search size={14} className="py-search-icon" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by customer, phone or email…"
              className="py-search"
            />
          </div>
          <div className="py-tabs">
            {STATUS_TABS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`py-tab ${statusFilter === s ? 'active' : ''}`}>
                {s === 'all' ? 'All' : STATUS_CFG[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        <div className="py-table-wrap">
          {loading ? (
            <div className="py-state">
              <div className="py-spinner-lg" />
              <p>Loading transactions…</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-state">
              <CreditCard size={44} strokeWidth={1.2} color="#cbd5e1" />
              <p style={{ fontWeight: 600, color: '#374151' }}>No transactions yet</p>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Payment records will appear once orders are placed</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <table className="py-table py-desktop-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Order Status</th>
                    <th>Payment</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn, i) => (
                    <tr key={txn.id} className="py-row" style={{ animationDelay: `${i * 20}ms` }}>
                      <td>
                        <span className="py-txn-id">{txn.id}</span>
                        <span className="py-order-id">Order #{txn.orderId}</span>
                      </td>
                      <td>
                        <div className="py-customer">
                          <div className="py-avatar">{txn.customer?.charAt(0)?.toUpperCase()}</div>
                          <div>
                            <p className="py-cname">{txn.customer}</p>
                            {txn.phone && <p className="py-cphone">{txn.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-date">{fmtDate(txn.createdAt)}</td>
                      <td><span className="py-method">{txn.method}</span></td>
                      <td><span className="py-order-status">{txn.orderStatus}</span></td>
                      <td><StatusBadge status={txn.paymentStatus} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`py-amount ${txn.type === 'credit' ? 'credit' : 'debit'}`}>
                          {txn.type === 'credit' ? '+' : '−'} {fmt(txn.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="py-mobile-list">
                {transactions.map((txn, i) => (
                  <div key={txn.id} className="py-mobile-card" style={{ animationDelay: `${i * 20}ms` }}>
                    <div className="py-mobile-top">
                      <div className="py-customer">
                        <div className="py-avatar">{txn.customer?.charAt(0)?.toUpperCase()}</div>
                        <div>
                          <p className="py-cname">{txn.customer}</p>
                          <p className="py-cphone">{fmtDate(txn.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`py-amount ${txn.type === 'credit' ? 'credit' : 'debit'}`}>
                        {txn.type === 'credit' ? '+' : '−'} {fmt(txn.amount)}
                      </span>
                    </div>
                    <div className="py-mobile-bottom">
                      <span className="py-txn-id">{txn.id}</span>
                      <span className="py-method">{txn.method}</span>
                      <StatusBadge status={txn.paymentStatus} />
                    </div>
                  </div>
                ))}
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
@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
@keyframes spin { to{transform:rotate(360deg)} }

.py-root { font-family:'Outfit',sans-serif; padding:28px 32px; opacity:0; transform:translateY(10px); transition:opacity 0.4s ease,transform 0.4s ease; }
.py-visible { opacity:1!important; transform:none!important; }

.py-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; gap:12px; flex-wrap:wrap; }
.py-title { font-size:28px; font-weight:800; color:#0f172a; margin:0; letter-spacing:-0.5px; }
.py-sub { font-size:13px; color:#94a3b8; margin:4px 0 0; }
.py-header-actions { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }

.py-icon-btn { width:38px; height:38px; border:1.5px solid #e2e8f0; border-radius:10px; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#64748b; transition:background 0.15s; flex-shrink:0; }
.py-icon-btn:hover { background:#f1f5f9; }
.py-outline-btn { display:inline-flex; align-items:center; gap:7px; background:#fff; color:#0d9488; border:1.5px solid #0d9488; font-size:13px; font-weight:700; padding:9px 16px; border-radius:10px; cursor:pointer; font-family:'Outfit',sans-serif; transition:all 0.15s; }
.py-outline-btn:hover:not(:disabled) { background:#f0fdfa; }
.py-outline-btn:disabled { opacity:0.6; cursor:not-allowed; }
.py-primary-btn { display:inline-flex; align-items:center; gap:7px; background:#0d9488; color:#fff; font-size:13px; font-weight:700; padding:10px 18px; border-radius:10px; border:none; cursor:pointer; font-family:'Outfit',sans-serif; transition:background 0.15s; }
.py-primary-btn:hover { background:#0f766e; }
.py-spinner { width:14px; height:14px; border:2px solid rgba(13,148,136,0.3); border-top-color:#0d9488; border-radius:50%; animation:spin 0.7s linear infinite; }
.py-spinner-lg { width:28px; height:28px; border:3px solid #e2e8f0; border-top-color:#0d9488; border-radius:50%; animation:spin 0.7s linear infinite; }

.py-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:16px; }
.py-stat { background:#fff; border-radius:16px; padding:20px; border:1px solid #f1f5f9; box-shadow:0 1px 4px rgba(0,0,0,0.04); display:flex; gap:14px; align-items:flex-start; animation:fadeUp 0.4s ease both; }
.py-stat-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.py-stat-label { font-size:12px; color:#94a3b8; font-weight:500; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 4px; }
.py-stat-val { font-size:22px; font-weight:800; color:#0f172a; margin:0 0 3px; letter-spacing:-0.5px; }
.py-stat-change { font-size:12px; font-weight:600; display:flex; align-items:center; gap:3px; margin:0; }
.py-stat-change.up { color:#16a34a; }
.py-stat-change.down { color:#dc2626; }
.py-stat-note { font-size:12px; color:#94a3b8; margin:0; }

.py-methods { background:#fff; border-radius:12px; padding:14px 18px; border:1px solid #f1f5f9; margin-bottom:16px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.py-methods-label { font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap; }
.py-methods-list { display:flex; gap:8px; flex-wrap:wrap; }
.py-method-chip { display:inline-flex; align-items:center; gap:6px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:5px 12px; font-size:12px; }
.py-method-name { font-weight:700; color:#374151; }
.py-method-val { font-weight:700; color:#0d9488; }
.py-method-count { color:#94a3b8; }

.py-toolbar { display:flex; gap:12px; align-items:center; background:#fff; padding:12px 16px; border-radius:14px; border:1px solid #f1f5f9; margin-bottom:16px; flex-wrap:wrap; }
.py-search-wrap { position:relative; flex:1; min-width:220px; }
.py-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; }
.py-search { width:100%; box-sizing:border-box; padding:9px 12px 9px 36px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; font-family:'Outfit',sans-serif; color:#0f172a; background:#f8fafc; outline:none; transition:border-color 0.2s; }
.py-search:focus { border-color:#0d9488; background:#fff; }
.py-tabs { display:flex; gap:6px; flex-wrap:wrap; }
.py-tab { padding:7px 14px; border-radius:8px; font-size:12px; font-weight:600; border:none; cursor:pointer; font-family:'Outfit',sans-serif; background:#f1f5f9; color:#64748b; transition:all 0.15s; }
.py-tab:hover { background:#e2e8f0; }
.py-tab.active { background:#0d9488; color:#fff; }

.py-table-wrap { background:#fff; border-radius:16px; border:1px solid #f1f5f9; box-shadow:0 2px 8px rgba(0,0,0,0.05); overflow:hidden; }
.py-table { width:100%; border-collapse:collapse; font-size:13px; }
.py-table thead tr { background:#fafafa; }
.py-table th { padding:12px 16px; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.6px; border-bottom:1px solid #f1f5f9; text-align:left; }
.py-row { animation:fadeUp 0.35s ease both; }
.py-row:hover td { background:#f8fafc; }
.py-row td { padding:13px 16px; border-bottom:1px solid #f8fafc; vertical-align:middle; }
.py-row:last-child td { border-bottom:none; }
.py-txn-id { display:block; font-family:monospace; font-size:12px; font-weight:700; color:#0d9488; }
.py-order-id { display:block; font-size:11px; color:#94a3b8; margin-top:1px; }
.py-customer { display:flex; align-items:center; gap:10px; }
.py-avatar { width:32px; height:32px; border-radius:50%; background:#e0f2fe; color:#0284c7; font-weight:800; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.py-cname { font-size:13px; font-weight:600; color:#0f172a; margin:0 0 2px; }
.py-cphone { font-size:11px; color:#94a3b8; margin:0; }
.py-date { font-size:12px; color:#94a3b8; white-space:nowrap; }
.py-method { font-size:12px; font-weight:600; color:#374151; background:#f1f5f9; padding:3px 9px; border-radius:6px; }
.py-order-status { font-size:11px; font-weight:600; color:#64748b; text-transform:capitalize; }
.py-amount { font-size:14px; font-weight:800; }
.py-amount.credit { color:#16a34a; }
.py-amount.debit { color:#dc2626; }
.py-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:10px; color:#94a3b8; font-size:14px; text-align:center; }

/* Mobile cards */
.py-mobile-list { display:none; flex-direction:column; gap:0; }
.py-mobile-card { padding:14px 16px; border-bottom:1px solid #f8fafc; animation:fadeUp 0.35s ease both; }
.py-mobile-card:last-child { border-bottom:none; }
.py-mobile-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.py-mobile-bottom { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }

/* ── Payment Link Modal ── */
.pl-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); z-index:1000; display:flex; align-items:center; justify-content:center; animation:fadeUp 0.2s ease; padding:16px; }
.pl-modal { background:#fff; border-radius:20px; width:480px; max-width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 24px 64px rgba(0,0,0,0.2); }
.pl-modal-header { display:flex; justify-content:space-between; align-items:center; padding:20px 24px; border-bottom:1px solid #f1f5f9; }
.pl-modal-title { display:flex; align-items:center; gap:8px; font-size:17px; font-weight:800; color:#0f172a; margin:0; }
.pl-close { width:32px; height:32px; border-radius:8px; background:#f1f5f9; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#64748b; transition:background 0.15s; }
.pl-close:hover { background:#e2e8f0; }
.pl-form { padding:20px 24px; display:flex; flex-direction:column; gap:14px; }
.pl-field { display:flex; flex-direction:column; gap:5px; }
.pl-label { font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.4px; }
.pl-input { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; font-family:'Outfit',sans-serif; color:#0f172a; background:#fafafa; outline:none; width:100%; box-sizing:border-box; transition:border-color 0.2s; }
.pl-input:focus { border-color:#0d9488; background:#fff; }
.pl-input-prefix { position:relative; }
.pl-input-prefix > span { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:14px; font-weight:600; color:#94a3b8; pointer-events:none; }
.pl-prefixed { padding-left:26px!important; }
.pl-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.pl-error { display:flex; align-items:center; gap:8px; background:#fef2f2; border:1px solid #fecaca; color:#dc2626; font-size:13px; padding:10px 14px; border-radius:10px; }
.pl-modal-footer { display:flex; justify-content:flex-end; gap:10px; padding-top:4px; }
.pl-cancel-btn { padding:10px 18px; border-radius:10px; border:1.5px solid #e2e8f0; background:#fff; color:#374151; font-size:13px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:all 0.15s; }
.pl-cancel-btn:hover { border-color:#94a3b8; }
.pl-create-btn { display:inline-flex; align-items:center; gap:7px; background:#0d9488; color:#fff; font-size:13px; font-weight:700; padding:10px 20px; border-radius:10px; border:none; cursor:pointer; font-family:'Outfit',sans-serif; transition:background 0.15s; }
.pl-create-btn:hover:not(:disabled) { background:#0f766e; }
.pl-create-btn:disabled { opacity:0.6; cursor:not-allowed; }
.pl-spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }
.pl-success { padding:32px 24px; text-align:center; }
.pl-success-icon { width:60px; height:60px; border-radius:50%; background:#dcfce7; color:#16a34a; font-size:28px; font-weight:800; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; }
.pl-success h3 { font-size:18px; font-weight:800; color:#0f172a; margin:0 0 6px; }
.pl-success p { font-size:14px; color:#64748b; margin:0 0 20px; }
.pl-link-box { display:flex; gap:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; text-align:left; }
.pl-link-url { flex:1; font-size:13px; color:#0d9488; font-weight:600; word-break:break-all; }
.pl-copy-btn { display:inline-flex; align-items:center; gap:5px; background:#0d9488; color:#fff; font-size:12px; font-weight:700; padding:7px 12px; border-radius:8px; border:none; cursor:pointer; font-family:'Outfit',sans-serif; flex-shrink:0; transition:background 0.15s; }
.pl-copy-btn:hover { background:#0f766e; }
.pl-open-btn { display:inline-flex; align-items:center; gap:5px; background:#0f172a; color:#fff; font-size:13px; font-weight:700; padding:10px 16px; border-radius:10px; text-decoration:none; transition:background 0.15s; }
.pl-open-btn:hover { background:#1e293b; }
.pl-new-btn { background:#f1f5f9; color:#374151; font-size:13px; font-weight:600; padding:10px 16px; border-radius:10px; border:none; cursor:pointer; font-family:'Outfit',sans-serif; transition:background 0.15s; }
.pl-new-btn:hover { background:#e2e8f0; }

@media (max-width: 768px) {
  .py-root { padding:16px; }
  .py-title { font-size:22px; }
  .py-stats { grid-template-columns:repeat(2,1fr); gap:10px; }
  .py-stat { padding:14px; }
  .py-stat-icon { width:36px; height:36px; }
  .py-stat-val { font-size:18px; }
  .py-desktop-table { display:none; }
  .py-mobile-list { display:flex !important; }
  .py-btn-label { display:none; }
  .py-outline-btn, .py-primary-btn { padding:9px 12px; }
  .py-search-wrap { min-width:0; }
}

@media (max-width: 480px) {
  .py-stats { grid-template-columns:repeat(2,1fr); }
  .pl-row { grid-template-columns:1fr; }
}
`;