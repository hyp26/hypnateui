import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../stores/useOrderStore';
import {
  ArrowLeft, MapPin, Phone, Mail, Clock, Package,
  Printer, CheckCircle2, Truck, XCircle, CreditCard,
  Clipboard, ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING: { label: 'Pending', color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
  PAYMENT_PENDING: { label: 'Payment Pending', color: '#9a3412', bg: '#fff7ed', dot: '#f97316' },
  PAID: { label: 'Paid', color: '#1e40af', bg: '#dbeafe', dot: '#3b82f6' },
  CONFIRMED: { label: 'Confirmed', color: '#3730a3', bg: '#ede9fe', dot: '#6366f1' },
  SHIPPED: { label: 'Shipped', color: '#065f46', bg: '#d1fae5', dot: '#10b981' },
  DELIVERED: { label: 'Delivered', color: '#166534', bg: '#dcfce7', dot: '#16a34a' },
  CANCELLED: { label: 'Cancelled', color: '#991b1b', bg: '#fee2e2', dot: '#ef4444' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CFG[status?.toUpperCase()] || STATUS_CFG.PENDING;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 14px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 13, fontWeight: 700,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

// ── Timeline steps ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 'PENDING', label: 'Order Placed', icon: Clock },
  { id: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { id: 'SHIPPED', label: 'Shipped', icon: Truck },
  { id: 'DELIVERED', label: 'Delivered', icon: Package },
];

// ── Component ──────────────────────────────────────────────────────────────
export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeOrder: order, fetchOrder, updateOrderStatus, updatePaymentStatus, addTracking, loading } = useOrderStore();

  const [trackingInput, setTrackingInput] = useState('');
  const [showTracking, setShowTracking] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => { if (id) fetchOrder(id); }, [id, fetchOrder]);

  // ── Download invoice with cookie auth ─────────────────────────────────
  const handleInvoice = async () => {
    try {
      setInvoiceLoading(true);
      const res = await api.get(`/api/orders/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch { alert('Failed to generate invoice'); }
    finally { setInvoiceLoading(false); }
  };

  const handleTrackingSubmit = async () => {
    if (!trackingInput.trim() || !order) return;
    await addTracking(order.id, trackingInput.trim());
    setTrackingInput('');
    setShowTracking(false);
  };

  if (loading || !order) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: "'Outfit', sans-serif", color: '#94a3b8', gap: 12 }}>
      <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      Loading order…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // Map products from backend shape
  const items = order.items || [];
  const currentStepIdx = STEPS.findIndex(s => s.id === order.status?.toUpperCase());
  const isCancelled = order.status?.toUpperCase() === 'CANCELLED';

  return (
    <>
      <style>{css}</style>
      <div className="od-root">

        {/* ── HEADER ── */}
        <div className="od-header">
          <button onClick={() => navigate('/orders')} className="od-back">
            <ArrowLeft size={16} />
          </button>
          <div className="od-header-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="od-title">Order #{String(order.id).padStart(4, '0')}</h1>
              <StatusBadge status={order.status} />
              {order.trackingNumber && (
                <span className="od-tracking-chip">
                  <Clipboard size={11} /> {order.trackingNumber}
                </span>
              )}
            </div>
            <p className="od-date">
              Placed on {order.createdAt ? format(new Date(order.createdAt), 'MMMM dd, yyyy @ hh:mm a') : '—'}
            </p>
          </div>

          {/* Action buttons — using primary teal color as requested */}
          <div className="od-actions">
            <button onClick={handleInvoice} disabled={invoiceLoading} className="od-btn-outline">
              <Printer size={14} />
              {invoiceLoading ? 'Generating…' : 'Invoice'}
            </button>

            {order.status?.toUpperCase() === 'PENDING' && (
              <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="od-btn-primary">
                <CheckCircle2 size={14} /> Confirm Order
              </button>
            )}
            {order.status?.toUpperCase() === 'CONFIRMED' && (
              <button onClick={() => setShowTracking(true)} className="od-btn-primary">
                <Truck size={14} /> Ship Order
              </button>
            )}
            {order.status?.toUpperCase() === 'SHIPPED' && (
              <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="od-btn-primary">
                <Package size={14} /> Mark Delivered
              </button>
            )}
            {!isCancelled && order.status?.toUpperCase() !== 'DELIVERED' && (
              <button
                onClick={() => { if (window.confirm('Cancel this order?')) updateOrderStatus(order.id, 'cancelled'); }}
                className="od-btn-danger"
              >
                <XCircle size={14} /> Cancel
              </button>
            )}
          </div>
        </div>

        <div className="od-grid">
          {/* ── LEFT ── */}
          <div className="od-left">

            {/* Progress bar */}
            {!isCancelled && (
              <div className="od-card">
                <h3 className="od-card-title">Order Progress</h3>
                <div className="od-steps">
                  <div className="od-steps-line">
                    <div
                      className="od-steps-fill"
                      style={{ width: currentStepIdx >= 0 ? `${(currentStepIdx / (STEPS.length - 1)) * 100}%` : '0%' }}
                    />
                  </div>
                  {STEPS.map((step, idx) => {
                    const done = idx <= currentStepIdx;
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="od-step">
                        <div className={`od-step-dot ${done ? 'done' : ''}`}>
                          <Icon size={14} />
                        </div>
                        <p className={`od-step-label ${done ? 'done' : ''}`}>{step.label}</p>
                      </div>
                    );
                  })}
                </div>

                {showTracking && (
                  <div className="od-tracking-input">
                    <input
                      value={trackingInput}
                      onChange={e => setTrackingInput(e.target.value)}
                      placeholder="Enter tracking number…"
                      className="od-input"
                      onKeyDown={e => e.key === 'Enter' && handleTrackingSubmit()}
                    />
                    <button onClick={handleTrackingSubmit} className="od-btn-primary" style={{ flexShrink: 0 }}>
                      Save & Ship
                    </button>
                    <button onClick={() => setShowTracking(false)} className="od-btn-outline" style={{ flexShrink: 0 }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Order items */}
            <div className="od-card">
              <h3 className="od-card-title">
                Order Items
                <span className="od-badge">{items.length}</span>
              </h3>
              <div className="od-items">
                {items.map((item: any, i: number) => {
                  // Handle both backend shapes:
                  // shape A: { product: { name, imageUrl }, quantity, priceAtPurchase }
                  // shape B: { name, image, quantity, price }
                  const name = item.product?.name || item.name || 'Unknown';
                  const img = item.product?.imageUrl || item.image || null;
                  const qty = item.quantity || 1;
                  const price = item.priceAtPurchase || item.product?.price || item.price || 0;
                  return (
                    <div key={i} className="od-item">
                      <div className="od-item-img">
                        {img
                          ? <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Package size={20} color="#94a3b8" />}
                      </div>
                      <div className="od-item-info">
                        <p className="od-item-name">{name}</p>
                        <p className="od-item-qty">Qty: {qty} × {fmt(price)}</p>
                      </div>
                      <span className="od-item-total">{fmt(price * qty)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="od-totals">
                <div className="od-total-row">
                  <span>Subtotal</span>
                  <span>{fmt(order.subtotal || 0)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="od-total-row">
                    <span>Tax / GST</span>
                    <span>{fmt(order.tax)}</span>
                  </div>
                )}
                <div className="od-total-row grand">
                  <span>Total</span>
                  <span>{fmt(order.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {Array.isArray(order.timeline) && order.timeline.length > 0 && (
              <div className="od-card">
                <h3 className="od-card-title">Activity Timeline</h3>
                <div className="od-timeline">
                  {(order.timeline as any[]).map((t, i) => (
                    <div key={i} className="od-tl-item">
                      <div className="od-tl-dot" />
                      <div className="od-tl-content">
                        <p className="od-tl-note">{t.note || t.status}</p>
                        <p className="od-tl-time">
                          {t.timestamp ? format(new Date(t.timestamp), 'dd MMM yyyy, hh:mm a') : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT ── */}
          <div className="od-right">

            {/* Payment */}
            <div className="od-card">
              <h3 className="od-card-title"><CreditCard size={14} /> Payment</h3>
              <div className="od-pay-row">
                <span style={{ color: '#64748b', fontSize: 14 }}>Status</span>
                <span style={{
                  fontWeight: 700, fontSize: 13,
                  color: order.paymentStatus?.toUpperCase() === 'PAID' ? '#166534' : '#9a3412',
                  background: order.paymentStatus?.toUpperCase() === 'PAID' ? '#dcfce7' : '#fff7ed',
                  padding: '3px 10px', borderRadius: 20,
                }}>
                  {order.paymentStatus?.toUpperCase() || 'UNPAID'}
                </span>
              </div>
              {order.paymentMethod && (
                <div className="od-pay-row">
                  <span style={{ color: '#64748b', fontSize: 14 }}>Method</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{order.paymentMethod}</span>
                </div>
              )}
              <div className="od-pay-row grand">
                <span style={{ fontWeight: 700 }}>Amount</span>
                <span style={{ fontWeight: 800, fontSize: 18 }}>{fmt(order.total || 0)}</span>
              </div>
              {order.paymentStatus?.toUpperCase() !== 'PAID' && !isCancelled && (
                <button
                  onClick={() => updatePaymentStatus(order.id, 'paid')}
                  className="od-btn-primary"
                  style={{ width: '100%', marginTop: 14 }}
                >
                  <CheckCircle2 size={14} /> Mark as Paid
                </button>
              )}
            </div>

            {/* Customer */}
            <div className="od-card">
              <h3 className="od-card-title">Customer</h3>
              <div className="od-customer-block">
                <div className="od-cust-avatar">
                  {order.customerName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: '0 0 2px' }}>{order.customerName}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Customer</p>
                </div>
              </div>
              <div className="od-contact-list">
                {order.customerEmail && (
                  <div className="od-contact-item">
                    <Mail size={13} color="#94a3b8" />
                    <span>{order.customerEmail}</span>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="od-contact-item">
                    <Phone size={13} color="#94a3b8" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
                {order.shippingAddress && (
                  <div className="od-contact-item">
                    <MapPin size={13} color="#94a3b8" />
                    <span>{order.shippingAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking */}
            {order.trackingNumber && (
              <div className="od-card">
                <h3 className="od-card-title"><Truck size={14} /> Tracking</h3>
                <div className="od-tracking-display">
                  <span>{order.trackingNumber}</span>
                  <button
                    className="od-btn-outline"
                    style={{ padding: '5px 10px', fontSize: 12 }}
                    onClick={() => window.open(`https://www.google.com/search?q=${order.trackingNumber}+tracking`, '_blank')}
                  >
                    <ExternalLink size={11} /> Track
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
@keyframes spin { to { transform:rotate(360deg); } }
@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }

.od-root { font-family:'Outfit',sans-serif; padding:28px 32px; animation:fadeUp 0.4s ease; }

/* Header */
.od-header { display:flex; align-items:flex-start; gap:16px; margin-bottom:28px; flex-wrap:wrap; }
.od-back { width:38px; height:38px; border-radius:10px; border:1.5px solid #e2e8f0; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#374151; flex-shrink:0; transition:background 0.15s; }
.od-back:hover { background:#f1f5f9; }
.od-header-info { flex:1; min-width:0; }
.od-title { font-size:24px; font-weight:800; color:#0f172a; margin:0; letter-spacing:-0.5px; }
.od-date { font-size:13px; color:#94a3b8; margin:5px 0 0; }
.od-tracking-chip { display:inline-flex; align-items:center; gap:5px; background:#f1f5f9; color:#374151; font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; }

.od-actions { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-left:auto; }

/* Buttons — keeping teal as primary color */
.od-btn-primary { display:inline-flex; align-items:center; gap:6px; background:#0d9488; color:#fff; font-size:13px; font-weight:700; padding:9px 16px; border-radius:10px; border:none; cursor:pointer; font-family:'Outfit',sans-serif; transition:background 0.15s; white-space:nowrap; }
.od-btn-primary:hover:not(:disabled) { background:#0f766e; }
.od-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }

.od-btn-outline { display:inline-flex; align-items:center; gap:6px; background:#fff; color:#374151; font-size:13px; font-weight:600; padding:9px 14px; border-radius:10px; border:1.5px solid #e2e8f0; cursor:pointer; font-family:'Outfit',sans-serif; transition:all 0.15s; white-space:nowrap; }
.od-btn-outline:hover { border-color:#0d9488; color:#0d9488; }

.od-btn-danger { display:inline-flex; align-items:center; gap:6px; background:#fef2f2; color:#dc2626; font-size:13px; font-weight:700; padding:9px 14px; border-radius:10px; border:1.5px solid #fecaca; cursor:pointer; font-family:'Outfit',sans-serif; transition:all 0.15s; }
.od-btn-danger:hover { background:#fee2e2; }

/* Grid */
.od-grid { display:grid; grid-template-columns:1fr 320px; gap:20px; align-items:start; }
.od-left { display:flex; flex-direction:column; gap:16px; }
.od-right { display:flex; flex-direction:column; gap:16px; }

/* Card */
.od-card { background:#fff; border-radius:16px; padding:20px; border:1px solid #f1f5f9; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
.od-card-title { display:flex; align-items:center; gap:7px; font-size:14px; font-weight:700; color:#0f172a; margin:0 0 18px; }
.od-badge { background:#f1f5f9; color:#64748b; font-size:11px; font-weight:700; padding:2px 8px; border-radius:20px; margin-left:4px; }

/* Progress */
.od-steps { position:relative; display:flex; justify-content:space-between; padding-top:20px; }
.od-steps-line { position:absolute; top:30px; left:20px; right:20px; height:3px; background:#f1f5f9; border-radius:2px; }
.od-steps-fill { position:absolute; top:0; left:0; height:100%; background:#0d9488; border-radius:2px; transition:width 0.5s ease; }
.od-step { display:flex; flex-direction:column; align-items:center; gap:8px; z-index:1; }
.od-step-dot { width:40px; height:40px; border-radius:50%; border:2px solid #e2e8f0; background:#fff; display:flex; align-items:center; justify-content:center; color:#cbd5e1; transition:all 0.3s; }
.od-step-dot.done { background:#0d9488; border-color:#0d9488; color:#fff; }
.od-step-label { font-size:11px; font-weight:600; color:#cbd5e1; text-align:center; }
.od-step-label.done { color:#0d9488; }

.od-tracking-input { display:flex; gap:8px; margin-top:16px; align-items:center; }
.od-input { flex:1; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; font-family:'Outfit',sans-serif; color:#0f172a; outline:none; }
.od-input:focus { border-color:#0d9488; }

/* Items */
.od-items { display:flex; flex-direction:column; gap:0; }
.od-item { display:flex; align-items:center; gap:14px; padding:12px 0; border-bottom:1px solid #f8fafc; }
.od-item:last-child { border-bottom:none; }
.od-item-img { width:52px; height:52px; border-radius:12px; background:#f1f5f9; flex-shrink:0; overflow:hidden; display:flex; align-items:center; justify-content:center; }
.od-item-info { flex:1; min-width:0; }
.od-item-name { font-size:14px; font-weight:600; color:#0f172a; margin:0 0 3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.od-item-qty { font-size:12px; color:#94a3b8; margin:0; }
.od-item-total { font-size:14px; font-weight:800; color:#0f172a; flex-shrink:0; }

/* Totals */
.od-totals { border-top:1px solid #f1f5f9; margin-top:12px; padding-top:12px; }
.od-total-row { display:flex; justify-content:space-between; align-items:center; padding:5px 0; font-size:13px; color:#64748b; }
.od-total-row.grand { font-size:16px; font-weight:800; color:#0f172a; border-top:1px solid #f1f5f9; margin-top:6px; padding-top:10px; }

/* Timeline */
.od-timeline { display:flex; flex-direction:column; gap:0; }
.od-tl-item { display:flex; gap:12px; align-items:flex-start; padding:10px 0; position:relative; }
.od-tl-item:not(:last-child)::after { content:''; position:absolute; left:7px; top:28px; bottom:-10px; width:2px; background:#f1f5f9; }
.od-tl-dot { width:16px; height:16px; border-radius:50%; background:#0d9488; border:3px solid #f0fdfa; flex-shrink:0; margin-top:2px; }
.od-tl-content {}
.od-tl-note { font-size:13px; font-weight:600; color:#0f172a; margin:0 0 2px; }
.od-tl-time { font-size:11px; color:#94a3b8; margin:0; }

/* Payment */
.od-pay-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid #f8fafc; }
.od-pay-row:last-of-type { border-bottom:none; }
.od-pay-row.grand { border-top:1px solid #f1f5f9; padding-top:12px; margin-top:4px; }

/* Customer */
.od-customer-block { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
.od-cust-avatar { width:44px; height:44px; border-radius:50%; background:#e0f2fe; color:#0284c7; font-size:18px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.od-contact-list { display:flex; flex-direction:column; gap:8px; }
.od-contact-item { display:flex; align-items:flex-start; gap:10px; font-size:13px; color:#374151; }

/* Tracking display */
.od-tracking-display { display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border-radius:10px; padding:10px 14px; font-size:13px; font-weight:600; color:#374151; font-family:monospace; }
`;