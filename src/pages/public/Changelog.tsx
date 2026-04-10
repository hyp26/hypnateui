import React, { useState } from 'react';
import { Sparkles, Wrench, Bug, Rocket, Zap, Shield, LayoutDashboard, MessageSquare, Package, ShoppingCart, CreditCard, BarChart3, Users, Bot, Globe } from 'lucide-react';

const CHANGES = [
  {
    version: 'v1.0.0',
    date: 'April 16, 2026',
    title: 'Official Launch — Hypnate is Live',
    type: 'launch',
    emoji: '🚀',
    items: [
      { type: 'feature', text: 'Public launch of Hypnate — the all-in-one WhatsApp & Instagram commerce platform for Indian D2C brands.' },
      { type: 'feature', text: 'Full merchant onboarding flow: business info → catalog upload → payment gateway → social channel connection → AI setup.' },
      { type: 'feature', text: 'Zara AI chatbot live on hypnate.in — guides visitors through qualification, onboarding, and conversion automatically.' },
      { type: 'feature', text: 'Staging environment fully separated from production. Coming soon page live at hypnate.in during pre-launch.' },
    ]
  },
  {
    version: 'v0.9.0',
    date: 'March 28, 2026',
    title: 'Analytics, Payments & Demo Player',
    type: 'major',
    emoji: '📊',
    items: [
      { type: 'feature', text: 'Analytics module rebuilt with real backend data — revenue, orders, AOV, channel breakdown, top products and conversion rates.' },
      { type: 'feature', text: 'Period selector on Analytics: switch between Last 7, 30 and 90 days. All charts and KPIs update live.' },
      { type: 'feature', text: 'Payments module overhauled — transaction list derived from real orders, CSV export, and Razorpay payment link generation.' },
      { type: 'feature', text: 'Interactive HypnateDemoPlayer built — 5-scene animated walkthrough of the merchant dashboard for the marketing site.' },
      { type: 'improvement', text: 'Export buttons across Orders, Payments and Analytics now use cookie-based auth instead of localStorage tokens.' },
    ]
  },
  {
    version: 'v0.8.0',
    date: 'March 14, 2026',
    title: 'Orders, Order Detail & Home Page Redesign',
    type: 'major',
    emoji: '📦',
    items: [
      { type: 'feature', text: 'Orders page redesigned — stat cards, status tabs with live counts, customer avatars and animated row entries.' },
      { type: 'feature', text: 'Order Detail page rebuilt — two-column layout, animated progress bar, activity timeline, tracking chip and invoice download.' },
      { type: 'feature', text: 'Home.tsx (marketing landing page) fully redesigned for production — scroll-reveal animations, real pricing tiers, honest copy replacing mock claims.' },
      { type: 'fix', text: 'Fixed invoice generation using cookie auth (was broken with Bearer token approach).' },
      { type: 'fix', text: 'Fixed backend order status strings to match frontend — PENDING, CONFIRMED, SHIPPED, DELIVERED casing unified.' },
    ]
  },
  {
    version: 'v0.7.0',
    date: 'February 28, 2026',
    title: 'Merchant Onboarding Flow',
    type: 'major',
    emoji: '🧭',
    items: [
      { type: 'feature', text: 'Full 5-step merchant onboarding: Business Info → Catalog → Payments → Channels → AI Setup.' },
      { type: 'feature', text: 'Catalog step accepts any file format (PDF, DOCX, XLS, CSV) — Hypnate AI converts it automatically.' },
      { type: 'feature', text: 'Skip buttons on steps 2–4 with confirmation popup if any steps were skipped at launch.' },
      { type: 'feature', text: 'Step 5 shows a summary with ✅ Completed / ❌ Skipped status for each step before dashboard redirect.' },
      { type: 'feature', text: 'Multi-gateway payment setup: Razorpay, PayU, Cashfree, Skydo and Cash on Delivery — each with step-by-step API key guide.' },
      { type: 'improvement', text: 'Onboarding now renders inside the global app shell — sidebar and header remain visible throughout.' },
    ]
  },
  {
    version: 'v0.6.0',
    date: 'February 10, 2026',
    title: 'Dashboard, Conversations & Zara AI Chatbot',
    type: 'major',
    emoji: '💬',
    items: [
      { type: 'feature', text: 'Dashboard rebuilt with real API — live revenue, orders, active conversations, 30s polling, and skeleton loading.' },
      { type: 'feature', text: 'Conversations page with 3-second polling, optimistic message send, and multi-platform inbox (WhatsApp, Instagram, Facebook, Telegram).' },
      { type: 'feature', text: 'Zara AI chatbot widget built for the marketing site — full 7-step guided flow: platform → order method → pain → value prop → setup/demo/support.' },
      { type: 'feature', text: 'Zara includes idle re-engagement (25s), persistent quick actions, context-aware messages and unread badge.' },
      { type: 'improvement', text: 'Header global search now searches across orders, customers and products with debounced dropdown.' },
    ]
  },
  {
    version: 'v0.5.0',
    date: 'January 20, 2026',
    title: 'Products, Customers & Notification System',
    type: 'minor',
    emoji: '🛍️',
    items: [
      { type: 'feature', text: 'Products page with grid/list toggle, MRP + selling price, discount badges and size chips.' },
      { type: 'feature', text: 'Add Product and Edit Product pages with drag-drop image upload, grouped size selector and live discount preview.' },
      { type: 'feature', text: 'Customers page with real API using Promise.allSettled so stats failure does not break the list.' },
      { type: 'feature', text: 'Notification system built end-to-end — backend controller, routes, bell icon with 15s polling, mark-all-read.' },
      { type: 'fix', text: 'Fixed Promise.all bug in Customers — single failing endpoint was crashing the entire page.' },
      { type: 'fix', text: 'Fixed duplicate custumerRoutes import in app.ts that caused 500 errors.' },
    ]
  },
  {
    version: 'v0.4.0',
    date: 'January 5, 2026',
    title: 'Backend API Foundation',
    type: 'minor',
    emoji: '⚙️',
    items: [
      { type: 'feature', text: 'Full backend built with Express, Prisma and PostgreSQL (Neon DB) — orders, customers, products, analytics, payments, conversations, notifications and onboarding.' },
      { type: 'feature', text: 'All routes use httpOnly cookie auth (withCredentials: true) — no localStorage tokens anywhere.' },
      { type: 'feature', text: 'Dashboard single-endpoint controller computing all stats in parallel with Promise.all.' },
      { type: 'feature', text: 'Conversation webhook handlers for WhatsApp Cloud API, Instagram, Facebook and Telegram.' },
      { type: 'improvement', text: 'Schema additions: Conversation, Message, Notification models; MRP + sizes on Product; onboarding fields on Seller.' },
      { type: 'fix', text: 'Fixed createNotification floating at module level in product.controller — moved inside updateStock function.' },
    ]
  },
  {
    version: 'v0.3.0',
    date: 'December 15, 2025',
    title: 'Pricing Page & Pre-launch Setup',
    type: 'minor',
    emoji: '💳',
    items: [
      { type: 'feature', text: 'Pricing page with Founding Member at 50% off (as a lauching offer), Starter ₹799/mo, Pro ₹2,199/mo, Business ₹5,499/mo, Enterprise ₹13,999/mo.' },
      { type: 'feature', text: 'Overage model: ₹0.50 per extra conversation, ₹99 per 5k extra visitors, ₹299 per extra team member.' },
      { type: 'feature', text: 'Coming Soon production page, email capture, animated grid background and feature pills.' },
      { type: 'improvement', text: 'Production and staging environments separated — hypnate.in shows coming soon, staging.hypnate.in runs the full app.' },
    ]
  },
  {
    version: 'v0.1.0',
    date: 'November 25, 2025',
    title: 'Project Kickoff',
    type: 'minor',
    emoji: '🌱',
    items: [
      { type: 'feature', text: 'Initial project setup — React + TypeScript frontend, Express + Prisma backend, Neon PostgreSQL database.' },
      { type: 'feature', text: 'Global sidebar, header, and routing architecture established.' },
      { type: 'feature', text: 'Auth flow with JWT httpOnly cookies, protected routes and seller account resolution.' },
      { type: 'feature', text: 'Deployed frontend on Render static site, backend on Render free tier with Docker.' },
    ]
  },
];

const TYPE_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  launch: { label: 'Launch', bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
  major: { label: 'Major Update', bg: '#f0fdfa', color: '#065f46', border: '#0d9488' },
  minor: { label: 'Update', bg: '#eff6ff', color: '#1e40af', border: '#3b82f6' },
};

const ITEM_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  feature: { icon: <Sparkles size={13} />, color: '#166534', bg: '#dcfce7', label: 'New' },
  improvement: { icon: <Wrench size={13} />, color: '#1e40af', bg: '#dbeafe', label: 'Improved' },
  fix: { icon: <Bug size={13} />, color: '#991b1b', bg: '#fee2e2', label: 'Fixed' },
};

const FILTER_ICONS: Record<string, React.ReactNode> = {
  all: <LayoutDashboard size={13} />,
  feature: <Sparkles size={13} />,
  improvement: <Wrench size={13} />,
  fix: <Bug size={13} />,
};

export const Changelog = () => {
  const [filter, setFilter] = useState<'all' | 'feature' | 'improvement' | 'fix'>('all');

  return (
    <>
      <style>{css}</style>
      <div className="cl-root">

        {/* ── Hero ── */}
        <div className="cl-hero">
          <div className="cl-hero-badge"><Zap size={12} /> What's new</div>
          <h1 className="cl-hero-h1">Product Changelog</h1>
          <p className="cl-hero-sub">Every update, improvement and fix — documented as we build Hypnate in public.</p>

          {/* Filter tabs */}
          <div className="cl-filters">
            {(['all', 'feature', 'improvement', 'fix'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`cl-filter-btn ${filter === f ? 'active' : ''}`}
              >
                {FILTER_ICONS[f]}
                {f === 'all' ? 'All changes' : f === 'feature' ? 'New features' : f === 'improvement' ? 'Improvements' : 'Bug fixes'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="cl-timeline-wrap">
          <div className="cl-timeline-line" />
          {CHANGES.map((release, idx) => {
            const filtered = filter === 'all' ? release.items : release.items.filter(i => i.type === filter);
            if (filtered.length === 0) return null;
            const tcfg = TYPE_CONFIG[release.type] || TYPE_CONFIG.minor;
            return (
              <div key={idx} className="cl-entry">
                {/* Timeline dot */}
                <div className="cl-dot-wrap">
                  <div className="cl-dot" style={{ borderColor: tcfg.border, background: '#fff' }}>
                    <span style={{ fontSize: 16 }}>{release.emoji}</span>
                  </div>
                </div>

                {/* Card */}
                <div className="cl-card">
                  {/* Card header */}
                  <div className="cl-card-header">
                    <div className="cl-card-meta">
                      <div className="cl-card-version">{release.version}</div>
                      <div className="cl-card-date">{release.date}</div>
                    </div>
                    <span className="cl-type-badge" style={{ background: tcfg.bg, color: tcfg.color, borderColor: tcfg.border }}>
                      {tcfg.label}
                    </span>
                  </div>
                  <h2 className="cl-card-title">{release.title}</h2>

                  {/* Items */}
                  <ul className="cl-items">
                    {filtered.map((item, i) => {
                      const icfg = ITEM_CONFIG[item.type] || ITEM_CONFIG.feature;
                      return (
                        <li key={i} className="cl-item">
                          <span className="cl-item-badge" style={{ background: icfg.bg, color: icfg.color }}>
                            {icfg.icon}
                            {icfg.label}
                          </span>
                          <span className="cl-item-text">{item.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom note ── */}
        <div className="cl-footer-note">
          <Shield size={14} />
          Hypnate is built transparently. Every change is logged here as we ship.
        </div>
      </div>
    </>
  );
};

const css = `
.cl-root { background:#fff; min-height:100vh; }

/* Hero */
.cl-hero { background:linear-gradient(180deg,#f0fdfa 0%,#fff 100%); padding:80px 24px 48px; text-align:center; border-bottom:1px solid #f1f5f9; }
.cl-hero-badge { display:inline-flex; align-items:center; gap:6px; background:#0d9488; color:#fff; font-size:11px; font-weight:700; padding:5px 14px; border-radius:100px; margin-bottom:20px; text-transform:uppercase; letter-spacing:.7px; }
.cl-hero-h1 { font-size:clamp(32px,5vw,52px); font-weight:800; color:#0f172a; margin:0 0 14px; letter-spacing:-1.5px; }
.cl-hero-sub { font-size:17px; color:#64748b; max-width:480px; margin:0 auto 32px; line-height:1.6; }

/* Filters */
.cl-filters { display:inline-flex; background:#f1f5f9; border-radius:12px; padding:4px; gap:3px; }
.cl-filter-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:9px; border:none; cursor:pointer; font-size:13px; font-weight:600; background:transparent; color:#64748b; transition:all .15s; }
.cl-filter-btn:hover { color:#0f172a; }
.cl-filter-btn.active { background:#fff; color:#0d9488; box-shadow:0 1px 4px rgba(0,0,0,0.08); }

/* Timeline */
.cl-timeline-wrap { max-width:760px; margin:0 auto; padding:60px 24px 40px; position:relative; }
.cl-timeline-line { position:absolute; left:24px; top:60px; bottom:40px; width:2px; background:linear-gradient(to bottom,#0d9488,#e2e8f0); }

@media (min-width:640px) {
  .cl-timeline-line { left:calc(50% - 1px); }
}

.cl-entry { position:relative; display:flex; gap:24px; margin-bottom:48px; padding-left:52px; }

@media (min-width:640px) {
  .cl-entry { padding-left:0; justify-content:flex-end; }
  .cl-entry:nth-child(even) { justify-content:flex-start; }
  .cl-entry:nth-child(even) .cl-card { margin-left:auto; }
}

/* Dot */
.cl-dot-wrap { position:absolute; left:0; top:0; z-index:2; }

@media (min-width:640px) {
  .cl-dot-wrap { left:50%; transform:translateX(-50%); }
}

.cl-dot { width:48px; height:48px; border-radius:50%; border:3px solid; display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 4px #fff, 0 2px 8px rgba(0,0,0,0.1); transition:transform .2s; }
.cl-entry:hover .cl-dot { transform:scale(1.1); }

/* Card */
.cl-card { background:#fff; border:1.5px solid #f1f5f9; border-radius:18px; padding:22px 24px; width:100%; max-width:340px; box-shadow:0 2px 12px rgba(0,0,0,0.05); transition:box-shadow .2s, transform .2s; }
.cl-card:hover { box-shadow:0 8px 32px rgba(0,0,0,0.1); transform:translateY(-2px); }

@media (max-width:639px) {
  .cl-card { max-width:100%; }
}

.cl-card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; }
.cl-card-meta {}
.cl-card-version { font-size:16px; font-weight:800; color:#0f172a; }
.cl-card-date { font-size:11px; color:#94a3b8; margin-top:2px; font-weight:500; }
.cl-type-badge { font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px; border:1px solid; text-transform:uppercase; letter-spacing:.4px; }
.cl-card-title { font-size:16px; font-weight:700; color:#0f172a; margin:0 0 16px; line-height:1.4; }

/* Items */
.cl-items { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
.cl-item { display:flex; align-items:flex-start; gap:10px; }
.cl-item-badge { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:700; padding:2px 8px; border-radius:6px; white-space:nowrap; flex-shrink:0; margin-top:2px; text-transform:uppercase; letter-spacing:.3px; }
.cl-item-text { font-size:13px; color:#374151; line-height:1.6; }

/* Footer note */
.cl-footer-note { display:flex; align-items:center; justify-content:center; gap:8px; font-size:13px; color:#94a3b8; padding:32px 24px 64px; }
`;