import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Zap, Gift, ChevronDown, ChevronUp, ArrowRight, Star, Users, MessageCircle, Store, BarChart3, Headphones, Shield } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
type BillingCycle = 'monthly' | 'yearly';

interface Plan {
  id: string;
  name: string;
  badge?: string;
  badgeColor?: string;
  tagline: string;
  desc: string;
  monthlyPrice: number | null;
  highlight: boolean;
  cta: string;
  ctaLink: string;
  color: string;
  accentBg: string;
  icon: React.ReactNode;
  features: { category: string; items: string[] }[];
  limits: string[];
}

// ── Data ───────────────────────────────────────────────────────────────────
const plans: Plan[] = [
  {
    id: 'founding',
    name: 'Founding Member',
    badge: '🎁 First 50 Only',
    badgeColor: '#f59e0b',
    tagline: 'A gift from us to you.',
    desc: 'Exclusive lifetime free access for our first 50 believers. Your store, hosted on us — forever.',
    monthlyPrice: 0,
    highlight: false,
    cta: 'Claim Your Spot',
    ctaLink: '/signup?plan=founding',
    color: '#f59e0b',
    accentBg: '#fffbeb',
    icon: <Gift size={22} />,
    features: [
      {
        category: 'Inbox',
        items: ['1 WhatsApp number (test mode)', '1 Instagram DM', '800 AI conversations/mo', 'Unified inbox'],
      },
      {
        category: 'Commerce',
        items: ['Up to 50 products', 'Basic order management', '500 customer profiles', '7-day analytics'],
      },
      {
        category: 'HypnateX Store',
        items: ['1 store — hosted FREE on Hypnate forever', 'yourstore.hypnate.in subdomain', '6 starter themes', 'Manual catalog sync', '5GB storage · 1,000 visitors/mo', 'SSL included'],
      },
      {
        category: 'Perks',
        items: ['Founding Member #badge in dashboard', '30% off Pro forever when you upgrade', 'Featured on Hypnate website', 'Private WhatsApp group with founders'],
      },
    ],
    limits: ['"Powered by Hypnate" footer badge', 'Hypnate.in subdomain only', 'Test-mode WhatsApp (5 recipients)'],
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For solo sellers & new D2C founders.',
    desc: 'Everything you need to start selling — conversations, orders, and a real website.',
    monthlyPrice: 799,
    highlight: false,
    cta: 'Start Free Trial',
    ctaLink: '/signup?plan=starter',
    color: '#0d9488',
    accentBg: '#f0fdfa',
    icon: <Zap size={22} />,
    features: [
      {
        category: 'Inbox',
        items: ['1 WhatsApp number', '1 Instagram DM', '800 AI conversations/mo', 'Unified inbox (WA + IG)', '5 quick reply templates', 'Mobile app access'],
      },
      {
        category: 'Commerce',
        items: ['Up to 100 products', 'Manual order management', '500 customer profiles', 'Payment link in chat', '7-day analytics'],
      },
      {
        category: 'HypnateX Store',
        items: ['1 store — hosted on Hypnate servers', 'yourstore.hypnate.in subdomain', '6 starter themes', 'Manual catalog sync', '10GB storage · 5,000 visitors/mo', 'SSL included'],
      },
      {
        category: 'Support',
        items: ['Email support (48hr)', 'Help center access'],
      },
    ],
    limits: ['"Powered by Hypnate" footer badge', 'Hypnate.in subdomain only'],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: '⭐ Most Popular',
    badgeColor: '#0d9488',
    tagline: 'For growing D2C brands.',
    desc: 'Unlock all 4 platforms, automation, custom domain, and auto-syncing store.',
    monthlyPrice: 2199,
    highlight: true,
    cta: 'Start Free Trial',
    ctaLink: '/signup?plan=pro',
    color: '#0d9488',
    accentBg: '#0d9488',
    icon: <Star size={22} />,
    features: [
      {
        category: 'Inbox',
        items: ['1 WhatsApp number', 'Instagram + Facebook + Telegram', 'Unlimited AI conversations', '3 team members (shared inbox)', 'Saved replies (unlimited)', 'Broadcast to 5,000 contacts/mo', '5 chatbot automation flows', 'Auto-replies & away messages', 'WhatsApp order status notifications', 'Abandoned cart recovery'],
      },
      {
        category: 'Commerce',
        items: ['Unlimited products', 'Advanced order management', 'Unlimited customer profiles', 'Customer tags & segments', '90-day analytics (all channels)', 'Bulk order CSV export', 'COD confirmation via WhatsApp'],
      },
      {
        category: 'HypnateX Store',
        items: ['1 store — hosted on Hypnate servers', 'Custom domain (yourbrand.com)', 'All 12 themes', 'Auto-sync catalog (instant updates)', 'Remove "Powered by Hypnate"', 'AI-generated SEO meta tags', 'Google Analytics integration', '25GB storage · 25,000 visitors/mo', '3 store rebuilds/mo'],
      },
      {
        category: 'Support',
        items: ['Priority email (12hr)', 'WhatsApp support chat', 'Monthly strategy call (30 min)'],
      },
    ],
    limits: [],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For established brands & agencies.',
    desc: 'Multi-number, multi-store, multi-team. The full stack for serious sellers.',
    monthlyPrice: 5499,
    highlight: false,
    cta: 'Start Free Trial',
    ctaLink: '/signup?plan=business',
    color: '#1e293b',
    accentBg: '#f8fafc',
    icon: <Users size={22} />,
    features: [
      {
        category: 'Inbox',
        items: ['3 WhatsApp numbers', 'All 4 platforms (WA + IG + FB + TG)', 'Unlimited AI conversations', '5 team members + role permissions', 'Unlimited chatbot flows', 'Broadcast to unlimited contacts', 'WhatsApp catalog in-chat shopping', 'Sentiment analysis on chats', 'CSAT surveys post-conversation'],
      },
      {
        category: 'Commerce',
        items: ['Everything in Pro', 'Multi-location inventory', 'Custom order statuses & pipeline', 'Revenue forecasting dashboard', 'Customer lifetime value tracking', 'Razorpay / PayU deep integration', 'API webhooks for custom integrations'],
      },
      {
        category: 'HypnateX Store',
        items: ['3 store websites (multi-brand / agency)', 'Custom domain on all 3 stores', 'All themes + early access to new ones', 'AI brand voice training per store', 'Auto-sync on all 3 stores', '100GB storage · 100,000 visitors/mo', 'Google Search Console integration', 'Unlimited store rebuilds', 'Priority build queue (<5 min builds)', '"Shop Now" WhatsApp button → store'],
      },
      {
        category: 'Support',
        items: ['Dedicated account manager', '4hr response SLA', 'Onboarding call included', 'Quarterly business review call'],
      },
    ],
    limits: [],
  },
];

const compareRows = [
  { feature: 'WhatsApp Numbers', founding: '1 (test)', starter: '1', pro: '1', business: '3' },
  { feature: 'Platforms', founding: 'WA + IG', starter: 'WA + IG', pro: 'WA+IG+FB+TG', business: 'All 4' },
  { feature: 'AI Conversations/mo', founding: '800', starter: '800', pro: 'Unlimited', business: 'Unlimited' },
  { feature: 'Team Members', founding: '1', starter: '1', pro: '3', business: '5' },
  { feature: 'Products', founding: '50', starter: '100', pro: 'Unlimited', business: 'Unlimited' },
  { feature: 'HypnateX Stores', founding: '1', starter: '1', pro: '1', business: '3' },
  { feature: 'Store Hosting', founding: true, starter: true, pro: true, business: true },
  { feature: 'Custom Domain', founding: false, starter: false, pro: true, business: true },
  { feature: 'Auto-sync Catalog', founding: false, starter: false, pro: true, business: true },
  { feature: 'Remove Branding', founding: false, starter: false, pro: true, business: true },
  { feature: 'Broadcast Messages', founding: false, starter: false, pro: '5,000/mo', business: 'Unlimited' },
  { feature: 'Store Rebuilds/mo', founding: '1', starter: '1', pro: '3', business: 'Unlimited' },
  { feature: 'Support', founding: 'Email', starter: 'Email', pro: 'Priority + WA', business: 'Dedicated' },
  { feature: 'API Access', founding: false, starter: false, pro: false, business: true },
];

const overages = [
  { icon: <MessageCircle size={16} />, label: 'Extra conversations', price: '₹0.50 each', note: 'Never get cut off' },
  { icon: <Store size={16} />, label: 'Extra 5,000 store visitors', price: '₹99', note: 'Scale without limits' },
  { icon: <Users size={16} />, label: 'Extra team member', price: '₹299/mo', note: 'Add when you hire' },
  { icon: <BarChart3 size={16} />, label: 'Extra store rebuild', price: '₹199', note: 'Redesign anytime' },
];

const faqs = [
  { q: 'What is HypnateX hosting?', a: 'When you build a store through HypnateX, it lives on Hypnate\'s servers — no need for Hostinger, Shopify, or any separate hosting. We handle SSL, CDN, and uptime. Founding members get this free forever; all paid plans include it.' },
  { q: 'What happens if I exceed my conversation limit?', a: 'We never cut you off. Each extra conversation costs ₹0.50. You\'ll see real-time usage in your dashboard. WhatsApp charges us ~₹0.30 per conversation so this is sustainable for both sides.' },
  { q: 'How does the Founding Member plan work?', a: 'The first 50 sellers who sign up get a permanent free Starter plan. Your HypnateX store is hosted on our servers for life, at no cost. When you\'re ready to grow, you upgrade at a permanent 30% discount on Pro — locked in forever.' },
  { q: 'Do I need the WhatsApp Business API separately?', a: 'We guide you through the Meta API setup directly from your dashboard. It takes about 2–3 business days for Meta to approve, and there\'s no setup fee. You just need a Meta Business Account.' },
  { q: 'Can I use my own domain on Starter?', a: 'Custom domains are available on Pro and Business plans. On Starter and Founding Member, your store lives at yourstore.hypnate.in — which is still a real, shareable link your customers can bookmark.' },
  { q: 'Is there a setup fee or contract?', a: 'No setup fees, no contracts. Monthly plans can be cancelled anytime. Annual plans come with a 14-day money-back guarantee if you\'re not satisfied.' },
  { q: 'Can agencies use Business for multiple clients?', a: 'Yes — the Business plan includes 3 separate HypnateX stores, each with its own custom domain and catalog. Agencies building for multiple clients should look at our Enterprise plan for unlimited stores and white-labelling.' },
];

// ── Component ──────────────────────────────────────────────────────────────
export const Pricing: React.FC = () => {
  const [billing, setBilling] = useState<BillingCycle>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [foundingLeft] = useState(23); // simulate spots left

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const getPrice = (monthly: number | null) => {
    if (monthly === null || monthly === 0) return 0;
    return billing === 'yearly' ? Math.round(monthly * 0.8) : monthly;
  };

  return (
    <>
      <style>{css}</style>
      <div className="pricing-root">

        {/* ── HERO ── */}
        <section className="pricing-hero">
          <div className="hero-glow" />
          <div className={`hero-content ${visible ? 'visible' : ''}`}>
            <div className="founding-ticker">
              <span className="ticker-dot" />
              <span>🎁 Founding Member spots: <strong>{foundingLeft} of 50 remaining</strong></span>
              <a href="/signup?plan=founding" className="ticker-link">Claim yours →</a>
            </div>
            <h1 className="hero-title">
              Pricing that grows<br />
              <span className="hero-accent">with your business</span>
            </h1>
            <p className="hero-sub">
              One platform for WhatsApp, Instagram, Facebook &amp; Telegram — plus your own store, hosted on us.
            </p>

            {/* Billing toggle */}
            <div className="billing-toggle">
              <span className={`billing-label ${billing === 'monthly' ? 'active' : ''}`}>Monthly</span>
              <button
                className="toggle-track"
                onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
                aria-label="Toggle billing cycle"
              >
                <div className={`toggle-thumb ${billing === 'yearly' ? 'yearly' : ''}`} />
              </button>
              <span className={`billing-label ${billing === 'yearly' ? 'active' : ''}`}>
                Yearly
                <span className="save-badge">SAVE 20%</span>
              </span>
            </div>
          </div>
        </section>

        {/* ── PLAN CARDS ── */}
        <section className="cards-section">
          <div className="cards-grid">
            {plans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} billing={billing} getPrice={getPrice} delay={i * 80} />
            ))}
          </div>
        </section>

        {/* ── OVERAGE SECTION ── */}
        <section className="overage-section">
          <div className="overage-inner">
            <div className="overage-header">
              <div className="overage-icon-wrap"><Zap size={20} /></div>
              <div>
                <h2 className="overage-title">Never get cut off — pay only for what you use</h2>
                <p className="overage-sub">When you exceed your plan limits, we don't shut you down. We just charge a small overage so your business keeps moving.</p>
              </div>
            </div>
            <div className="overage-grid">
              {overages.map((o, i) => (
                <div key={i} className="overage-card">
                  <div className="overage-card-icon">{o.icon}</div>
                  <div className="overage-label">{o.label}</div>
                  <div className="overage-price">{o.price}</div>
                  <div className="overage-note">{o.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPARE TABLE ── */}
        <section className="compare-section">
          <h2 className="section-title">Compare every feature</h2>
          <p className="section-sub">See exactly what's included in each plan before you commit.</p>
          <div className="table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="table-feature-col">Feature</th>
                  <th><span className="th-founding">Founding</span></th>
                  <th>Starter</th>
                  <th className="th-pro">Pro ⭐</th>
                  <th>Business</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, i) => (
                  <tr key={i}>
                    <td className="feature-name">{row.feature}</td>
                    {(['founding', 'starter', 'pro', 'business'] as const).map(col => {
                      const val = row[col];
                      return (
                        <td key={col} className={col === 'pro' ? 'td-pro' : ''}>
                          {typeof val === 'boolean'
                            ? val
                              ? <Check size={16} className="check-icon" />
                              : <X size={16} className="x-icon" />
                            : <span className="td-text">{val}</span>
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="faq-section">
          <h2 className="section-title">Frequently asked questions</h2>
          <p className="section-sub">Everything you need to know before you sign up.</p>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === i && <p className="faq-a">{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="bottom-cta">
          <div className="bottom-cta-inner">
            <h2 className="bottom-cta-title">Still not sure? Start free.</h2>
            <p className="bottom-cta-sub">14-day trial, no credit card required. Cancel anytime.</p>
            <div className="bottom-cta-btns">
              <Link to="/signup" className="cta-btn-primary">
                Get started free <ArrowRight size={16} />
              </Link>
              <Link to="/signup?plan=founding" className="cta-btn-secondary">
                🎁 Claim Founding Member spot
              </Link>
            </div>
            <div className="trust-row">
              <span><Shield size={13} /> No setup fees</span>
              <span><Check size={13} /> 14-day money-back</span>
              <span><Headphones size={13} /> WhatsApp support</span>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

// ── Plan Card ──────────────────────────────────────────────────────────────
const PlanCard: React.FC<{
  plan: Plan;
  billing: BillingCycle;
  getPrice: (m: number | null) => number;
  delay: number;
}> = ({ plan, billing, getPrice, delay }) => {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay + 200); return () => clearTimeout(t); }, [delay]);

  const price = getPrice(plan.monthlyPrice);
  const isFoundingFree = plan.monthlyPrice === 0;

  return (
    <div
      className={`plan-card ${plan.highlight ? 'plan-highlight' : ''} ${plan.id === 'founding' ? 'plan-founding' : ''} ${show ? 'card-visible' : ''}`}
      style={{ '--card-color': plan.color } as any}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="plan-badge" style={{ background: plan.id === 'founding' ? '#fef3c7' : '#e6fffa', color: plan.id === 'founding' ? '#92400e' : '#0d9488' }}>
          {plan.badge}
        </div>
      )}

      {/* Header */}
      <div className={`card-header ${plan.highlight ? 'card-header-highlight' : ''}`}>
        <div className="card-icon" style={{ background: plan.highlight ? 'rgba(255,255,255,0.15)' : plan.accentBg, color: plan.highlight ? '#fff' : plan.color }}>
          {plan.icon}
        </div>
        <div>
          <h3 className="card-name" style={{ color: plan.highlight ? '#fff' : '#0f172a' }}>{plan.name}</h3>
          <p className="card-tagline" style={{ color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#64748b' }}>{plan.tagline}</p>
        </div>
      </div>

      {/* Price */}
      <div className={`card-price-wrap ${plan.highlight ? 'price-highlight' : ''}`}>
        {isFoundingFree ? (
          <div className="price-free">FREE <span className="price-free-tag">forever</span></div>
        ) : (
          <div className="price-row">
            <span className="price-currency" style={{ color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>₹</span>
            <span className="price-amount" style={{ color: plan.highlight ? '#fff' : '#0f172a' }}>{price.toLocaleString()}</span>
            <span className="price-period" style={{ color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>/mo</span>
          </div>
        )}
        {!isFoundingFree && billing === 'yearly' && (
          <p className="price-annual" style={{ color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
            ₹{(price * 12).toLocaleString()} billed annually
          </p>
        )}
      </div>

      {/* CTA */}
      <Link
        to={plan.ctaLink}
        className={`card-cta ${plan.highlight ? 'cta-white' : plan.id === 'founding' ? 'cta-founding' : 'cta-outline'}`}
      >
        {plan.cta}
        <ArrowRight size={14} />
      </Link>

      {/* Desc */}
      <p className="card-desc" style={{ color: plan.highlight ? 'rgba(255,255,255,0.75)' : '#64748b' }}>{plan.desc}</p>

      {/* Features */}
      <div className="card-features">
        {plan.features.map((cat, ci) => (
          <div key={ci} className="feature-cat">
            <div className="feature-cat-label" style={{ color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>{cat.category}</div>
            {cat.items.map((item, ii) => (
              <div key={ii} className="feature-item">
                <Check size={13} className="feature-check" style={{ color: plan.highlight ? '#6ee7b7' : plan.color }} />
                <span style={{ color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#374151' }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Limits */}
      {plan.limits.length > 0 && (
        <div className="card-limits">
          <div className="limits-label" style={{ color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>Limitations</div>
          {plan.limits.map((l, li) => (
            <div key={li} className="limit-item">
              <X size={12} style={{ color: plan.highlight ? 'rgba(255,255,255,0.4)' : '#cbd5e1', flexShrink: 0 }} />
              <span style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>{l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── CSS ────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

.pricing-root {
  font-family: 'DM Sans', sans-serif;
  color: #0f172a;
  background: #fff;
  overflow-x: hidden;
}

/* ── HERO ── */
.pricing-hero {
  position: relative;
  background: #0f172a;
  padding: 100px 24px 80px;
  text-align: center;
  overflow: hidden;
}
.hero-glow {
  position: absolute;
  top: -120px; left: 50%; transform: translateX(-50%);
  width: 700px; height: 400px;
  background: radial-gradient(ellipse, rgba(13,148,136,0.35) 0%, transparent 70%);
  pointer-events: none;
}
.hero-content {
  position: relative;
  max-width: 680px;
  margin: 0 auto;
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.hero-content.visible { opacity: 1; transform: none; }

.founding-ticker {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3);
  color: #fbbf24; font-size: 13px; font-weight: 500;
  padding: 6px 14px; border-radius: 100px; margin-bottom: 28px;
}
.ticker-dot {
  width: 7px; height: 7px; background: #f59e0b; border-radius: 50%;
  animation: pulse-dot 1.5s ease-in-out infinite;
}
@keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
.ticker-link { color: #fbbf24; text-decoration: none; font-weight: 700; }

.hero-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 800; color: #fff; line-height: 1.1;
  margin: 0 0 16px; letter-spacing: -1px;
}
.hero-accent {
  background: linear-gradient(135deg, #0d9488, #34d399);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.hero-sub {
  font-size: 17px; color: rgba(255,255,255,0.6);
  margin: 0 0 36px; line-height: 1.6;
}

/* Toggle */
.billing-toggle {
  display: inline-flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.07); padding: 10px 20px;
  border-radius: 100px; border: 1px solid rgba(255,255,255,0.1);
}
.billing-label { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.4); transition: color 0.2s; }
.billing-label.active { color: #fff; }
.save-badge {
  background: #0d9488; color: #fff; font-size: 9px; font-weight: 700;
  padding: 2px 8px; border-radius: 100px; margin-left: 6px; letter-spacing: 0.5px;
}
.toggle-track {
  width: 46px; height: 24px; background: #0d9488; border-radius: 100px;
  border: none; cursor: pointer; position: relative; transition: background 0.2s;
}
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; background: #fff; border-radius: 50%;
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
}
.toggle-thumb.yearly { transform: translateX(22px); }

/* ── CARDS ── */
.cards-section { padding: 60px 24px 40px; background: #f8fafc; }
.cards-grid {
  max-width: 1340px; margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  align-items: start;
}

.plan-card {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  border: 1.5px solid #e2e8f0;
  position: relative;
  opacity: 0; transform: translateY(16px);
  transition: opacity 0.45s ease, transform 0.45s ease, box-shadow 0.2s, border-color 0.2s;
}
.plan-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.09); border-color: var(--card-color, #e2e8f0); }
.card-visible { opacity: 1 !important; transform: none !important; }

.plan-highlight {
  background: linear-gradient(145deg, #0d9488, #0f766e);
  border-color: #0d9488;
  box-shadow: 0 20px 60px rgba(13,148,136,0.3);
}
.plan-founding { border-color: #f59e0b; border-style: dashed; border-width: 2px; }

.plan-badge {
  display: inline-block; font-size: 11px; font-weight: 700;
  padding: 4px 12px; border-radius: 100px; margin-bottom: 16px;
  letter-spacing: 0.2px;
}

.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.card-icon {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.card-name { font-family: 'Bricolage Grotesque', sans-serif; font-size: 20px; font-weight: 700; margin: 0 0 2px; }
.card-tagline { font-size: 12px; margin: 0; }

.card-price-wrap { margin-bottom: 20px; }
.price-row { display: flex; align-items: baseline; gap: 2px; }
.price-currency { font-size: 20px; font-weight: 600; }
.price-amount { font-family: 'Bricolage Grotesque', sans-serif; font-size: 44px; font-weight: 800; line-height: 1; }
.price-period { font-size: 15px; margin-left: 2px; }
.price-annual { font-size: 12px; margin: 4px 0 0; }
.price-free {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 40px; font-weight: 800; color: #f59e0b;
  display: flex; align-items: center; gap: 10px;
}
.price-free-tag {
  font-size: 13px; font-weight: 600; background: #fef3c7;
  color: #92400e; padding: 3px 10px; border-radius: 100px;
}

.card-cta {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 12px; border-radius: 12px;
  font-size: 14px; font-weight: 700; text-decoration: none;
  margin-bottom: 20px; transition: all 0.15s; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}
.cta-white { background: #fff; color: #0d9488; }
.cta-white:hover { background: #f0fdfa; }
.cta-founding { background: #f59e0b; color: #fff; box-shadow: 0 4px 14px rgba(245,158,11,0.35); }
.cta-founding:hover { background: #d97706; }
.cta-outline { border: 2px solid #e2e8f0; color: #0f172a; background: transparent; }
.cta-outline:hover { border-color: var(--card-color); color: var(--card-color); }

.card-desc { font-size: 13px; line-height: 1.6; margin: 0 0 20px; }

.card-features { display: flex; flex-direction: column; gap: 16px; }
.feature-cat {}
.feature-cat-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.8px; margin-bottom: 8px;
}
.feature-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; font-size: 13px; line-height: 1.4; }
.feature-check { flex-shrink: 0; margin-top: 1px; }

.card-limits { margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.06); }
.limits-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
.limit-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; font-size: 12px; }

/* ── OVERAGE ── */
.overage-section { padding: 60px 24px; background: #0f172a; }
.overage-inner { max-width: 900px; margin: 0 auto; }
.overage-header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 32px; }
.overage-icon-wrap {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(13,148,136,0.2); color: #34d399;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.overage-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 22px; font-weight: 700; color: #fff; margin: 0 0 6px;
}
.overage-sub { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0; line-height: 1.6; }
.overage-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.overage-card {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 18px;
}
.overage-card-icon { color: #34d399; margin-bottom: 10px; }
.overage-label { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
.overage-price { font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.overage-note { font-size: 11px; color: rgba(255,255,255,0.35); }

/* ── COMPARE ── */
.compare-section { padding: 80px 24px; background: #fff; }
.section-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(26px, 3vw, 36px); font-weight: 800;
  text-align: center; margin: 0 0 8px; color: #0f172a;
}
.section-sub { text-align: center; color: #64748b; font-size: 16px; margin: 0 0 40px; }

.table-wrap { max-width: 960px; margin: 0 auto; overflow-x: auto; border-radius: 16px; border: 1px solid #e2e8f0; }
.compare-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.compare-table thead tr { background: #f8fafc; }
.compare-table th {
  padding: 16px 14px; font-weight: 700; color: #374151;
  text-align: center; font-size: 13px; border-bottom: 1px solid #e2e8f0;
}
.table-feature-col { text-align: left; width: 28%; }
.th-founding { color: #92400e; }
.th-pro { color: #0d9488; }
.compare-table td { padding: 13px 14px; text-align: center; border-bottom: 1px solid #f1f5f9; color: #374151; }
.compare-table tr:last-child td { border-bottom: none; }
.compare-table tr:hover td { background: #f8fafc; }
.feature-name { text-align: left; font-weight: 500; color: #374151; }
.td-pro { background: #f0fdfa; }
.td-text { }
.check-icon { color: #0d9488; margin: 0 auto; display: block; }
.x-icon { color: #cbd5e1; margin: 0 auto; display: block; }

/* ── FAQ ── */
.faq-section { padding: 80px 24px; background: #f8fafc; }
.faq-list { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }
.faq-item {
  background: #fff; border-radius: 14px;
  border: 1.5px solid #e2e8f0; overflow: hidden;
  transition: border-color 0.2s;
}
.faq-item.open { border-color: #0d9488; }
.faq-q {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  padding: 18px 20px; background: none; border: none; cursor: pointer;
  font-size: 15px; font-weight: 600; color: #0f172a; text-align: left;
  font-family: 'DM Sans', sans-serif; gap: 12px;
}
.faq-q svg { flex-shrink: 0; color: #94a3b8; }
.faq-a {
  padding: 0 20px 18px; font-size: 14px; color: #475569; line-height: 1.7; margin: 0;
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
}

/* ── BOTTOM CTA ── */
.bottom-cta { padding: 80px 24px; background: linear-gradient(135deg, #0f172a 0%, #0d9488 100%); text-align: center; }
.bottom-cta-inner { max-width: 560px; margin: 0 auto; }
.bottom-cta-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(30px, 4vw, 44px); font-weight: 800; color: #fff; margin: 0 0 12px;
}
.bottom-cta-sub { font-size: 16px; color: rgba(255,255,255,0.65); margin: 0 0 32px; }
.bottom-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }

.cta-btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: #fff; color: #0d9488; font-weight: 700;
  padding: 14px 28px; border-radius: 12px; font-size: 15px;
  text-decoration: none; transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
}
.cta-btn-primary:hover { background: #f0fdfa; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

.cta-btn-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.1); color: #fff; font-weight: 600;
  padding: 14px 24px; border-radius: 12px; font-size: 15px;
  text-decoration: none; border: 1.5px solid rgba(255,255,255,0.25);
  transition: all 0.15s; font-family: 'DM Sans', sans-serif;
}
.cta-btn-secondary:hover { background: rgba(255,255,255,0.18); }

.trust-row {
  display: flex; gap: 24px; justify-content: center; flex-wrap: wrap;
  font-size: 13px; color: rgba(255,255,255,0.5);
}
.trust-row span { display: flex; align-items: center; gap: 5px; }

@media (max-width: 640px) {
  .cards-grid { grid-template-columns: 1fr; }
  .overage-grid { grid-template-columns: 1fr 1fr; }
  .bottom-cta-btns { flex-direction: column; align-items: stretch; }
}
`;

export default Pricing;