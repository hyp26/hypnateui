import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, X, Zap, ChevronDown, ChevronUp, ArrowRight,
  Star, Users, Headphones,
  Shield, Rocket, Gift
} from 'lucide-react';

type BillingCycle = 'monthly' | 'yearly';

interface Plan {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  desc: string;
  monthlyPrice: number;
  highlight: boolean;
  cta: string;
  ctaLink: string;
  color: string;
  accentBg: string;
  icon: React.ReactNode;
  features: { category: string; items: string[] }[];
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For solo sellers & new D2C founders.',
    desc: 'Everything you need to start selling on WhatsApp and Instagram — conversations, orders, and a real website.',
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
        items: ['1 store — hosted on Hypnate servers', 'yourstore.hypnate.in subdomain', '6 starter themes', '10GB storage · 5,000 visitors/mo', 'SSL included'],
      },
      {
        category: 'Support',
        items: ['Email support (48hr)', 'Help center access'],
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: '⭐ Most Popular',
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
        items: ['1 WhatsApp number', 'Instagram + Facebook + Telegram', 'Unlimited AI conversations', '3 team members', 'Broadcast to 5,000 contacts/mo', '5 chatbot automation flows', 'Abandoned cart recovery'],
      },
      {
        category: 'Commerce',
        items: ['Unlimited products', 'Advanced order management', 'Unlimited customer profiles', '90-day analytics (all channels)', 'Bulk order CSV export', 'COD confirmation via WhatsApp'],
      },
      {
        category: 'HypnateX Store',
        items: ['1 store on Hypnate servers', 'Custom domain (yourbrand.com)', 'All 12 themes', 'Auto-sync catalog', 'Remove "Powered by Hypnate"', 'AI-generated SEO meta tags', '25GB storage · 25,000 visitors/mo'],
      },
      {
        category: 'Support',
        items: ['Priority email (12hr)', 'WhatsApp support chat', 'Monthly strategy call (30 min)'],
      },
    ],
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
        items: ['3 WhatsApp numbers', 'All 4 platforms (WA + IG + FB + TG)', 'Unlimited AI conversations', '5 team members + role permissions', 'Unlimited chatbot flows', 'Broadcast to unlimited contacts', 'Sentiment analysis on chats'],
      },
      {
        category: 'Commerce',
        items: ['Everything in Pro', 'Multi-location inventory', 'Custom order statuses & pipeline', 'Revenue forecasting dashboard', 'Customer lifetime value tracking', 'API webhooks for custom integrations'],
      },
      {
        category: 'HypnateX Store',
        items: ['3 store websites (multi-brand)', 'Custom domain on all 3 stores', 'All themes + early access', 'Auto-sync on all 3 stores', '100GB storage · 100,000 visitors/mo', 'Unlimited store rebuilds'],
      },
      {
        category: 'Support',
        items: ['Dedicated account manager', '4hr response SLA', 'Onboarding call included', 'Quarterly business review call'],
      },
    ],
  },
];

const compareRows = [
  { feature: 'WhatsApp Numbers', starter: '1', pro: '1', business: '3' },
  { feature: 'Platforms', starter: 'WA + IG', pro: 'WA+IG+FB+TG', business: 'All 4' },
  { feature: 'AI Conversations/mo', starter: '800', pro: 'Unlimited', business: 'Unlimited' },
  { feature: 'Team Members', starter: '1', pro: '3', business: '5' },
  { feature: 'Products', starter: '100', pro: 'Unlimited', business: 'Unlimited' },
  { feature: 'HypnateX Stores', starter: '1', pro: '1', business: '3' },
  { feature: 'Store Hosting', starter: true, pro: true, business: true },
  { feature: 'Custom Domain', starter: false, pro: true, business: true },
  { feature: 'Auto-sync Catalog', starter: false, pro: true, business: true },
  { feature: 'Remove Branding', starter: false, pro: true, business: true },
  { feature: 'Broadcast Messages', starter: false, pro: '5,000/mo', business: 'Unlimited' },
  { feature: 'API Access', starter: false, pro: false, business: true },
  { feature: 'Support', starter: 'Email', pro: 'Priority + WA', business: 'Dedicated' },
];

const faqs = [
  { q: 'What is the 50% launch offer?', a: 'We’re celebrating Hypnate’s launch with 50% off all plans. This is a time-limited offer for early adopters — available on both monthly and annual billing. Discounted pricing is valid for your first 12 months.' },
  { q: 'How does HypnateX store hosting work?', a: 'When you build a store through HypnateX, it lives on Hypnate\'s servers — no need for Hostinger, Shopify, or any separate hosting. We handle SSL, CDN, and uptime across all paid plans.' },
  { q: 'What happens if I exceed my conversation limit?', a: 'We never cut you off. Each extra conversation costs ₹0.50. You\'ll see real-time usage in your dashboard so you\'re always in the know.' },
  { q: 'Do I need the WhatsApp Business API separately?', a: 'We guide you through the Meta API setup from your dashboard. It takes about 2–3 business days for Meta to approve, and there\'s no setup fee from our side.' },
  { q: 'Can I use my own domain on Starter?', a: 'Custom domains are available on Pro and Business. On Starter, your store lives at yourstore.hypnate.in — a real, shareable link your customers can bookmark.' },
  { q: 'Is there a setup fee or contract?', a: 'No setup fees, no contracts. Monthly plans can be cancelled anytime. Annual plans come with a 14-day money-back guarantee.' },
  { q: 'Can agencies use Business for multiple clients?', a: 'Yes — Business includes 3 separate HypnateX stores, each with its own custom domain and catalog. For unlimited stores, contact us about our Enterprise plan.' },
];

const LAUNCH_DISCOUNT = 0.5; // 50% off

export const Pricing: React.FC = () => {
  const [billing, setBilling] = useState<BillingCycle>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const getOriginal = (monthly: number) => billing === 'yearly' ? Math.round(monthly * 0.8) : monthly;
  const getLaunch = (monthly: number) => Math.round(getOriginal(monthly) * (1 - LAUNCH_DISCOUNT));

  return (
    <>
      <style>{css}</style>
      <div className="pr-root">

        {/* HERO */}
        <section className="pr-hero">
          <div className="pr-hero-glow" />
          <div className={`pr-hero-content ${visible ? 'visible' : ''}`}>
            {/* Launch banner */}
            <div className="pr-launch-banner">
              <Rocket size={16} />
              <span>🚀 Launch Offer — <strong>50% OFF all plans</strong> for early adopters</span>
            </div>

            <h1 className="pr-hero-title">
              Pricing that scales<br />
              <span className="pr-hero-accent">with your growth</span>
            </h1>
            <p className="pr-hero-sub">
              WhatsApp, Instagram, Facebook & Telegram commerce — plus your own hosted store. All in one platform.
            </p>

            {/* Billing toggle */}
            <div className="pr-billing-toggle">
              <span className={`pr-bill-label ${billing === 'monthly' ? 'active' : ''}`} onClick={() => setBilling('monthly')}>Monthly</span>
              <button className="pr-toggle-track" onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}>
                <div className={`pr-toggle-thumb ${billing === 'yearly' ? 'yearly' : ''}`} />
              </button>
              <span className={`pr-bill-label ${billing === 'yearly' ? 'active' : ''}`} onClick={() => setBilling('yearly')}>
                Yearly <span className="pr-save-badge">SAVE 20%</span>
              </span>
            </div>
          </div>
        </section>

        {/* PLAN CARDS */}
        <section className="pr-cards-section">
          <div className="pr-cards-grid">
            {plans.map((plan, i) => {
              const original = getOriginal(plan.monthlyPrice);
              const launch = getLaunch(plan.monthlyPrice);
              return (
                <div
                  key={plan.id}
                  className={`pr-card ${plan.highlight ? 'pr-highlight' : ''} ${visible ? 'pr-card-visible' : ''}`}
                  style={{ animationDelay: `${i * 100 + 200}ms`, '--cc': plan.color } as any}
                >
                  {plan.badge && (
                    <div className="pr-badge" style={{ background: plan.highlight ? 'rgba(255,255,255,0.2)' : '#e6fffa', color: plan.highlight ? '#fff' : '#0d9488' }}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="pr-card-header">
                    <div className="pr-card-icon" style={{ background: plan.highlight ? 'rgba(255,255,255,0.15)' : plan.accentBg, color: plan.highlight ? '#fff' : plan.color }}>
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="pr-card-name" style={{ color: plan.highlight ? '#fff' : '#0f172a' }}>{plan.name}</h3>
                      <p className="pr-card-tagline" style={{ color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#64748b' }}>{plan.tagline}</p>
                    </div>
                  </div>

                  {/* Price with strikethrough */}
                  <div className="pr-price-wrap">
                    <div className="pr-original-price" style={{ color: plan.highlight ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}>
                      ₹{original.toLocaleString()}/mo
                    </div>
                    <div className="pr-price-row">
                      <span className="pr-currency" style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>₹</span>
                      <span className="pr-amount" style={{ color: plan.highlight ? '#fff' : '#0f172a' }}>{launch.toLocaleString()}</span>
                      <span className="pr-period" style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>/mo</span>
                      <span className="pr-discount-pill">50% OFF</span>
                    </div>
                    {billing === 'yearly' && (
                      <p className="pr-annual" style={{ color: plan.highlight ? 'rgba(255,255,255,0.55)' : '#94a3b8' }}>
                        ₹{(launch * 12).toLocaleString()} billed annually
                      </p>
                    )}
                  </div>

                  <Link to={plan.ctaLink} className={`pr-cta ${plan.highlight ? 'pr-cta-white' : 'pr-cta-outline'}`}>
                    {plan.cta} <ArrowRight size={14} />
                  </Link>

                  <p className="pr-card-desc" style={{ color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#64748b' }}>{plan.desc}</p>

                  <div className="pr-features">
                    {plan.features.map((cat, ci) => (
                      <div key={ci} className="pr-feature-cat">
                        <div className="pr-cat-label" style={{ color: plan.highlight ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{cat.category}</div>
                        {cat.items.map((item, ii) => (
                          <div key={ii} className="pr-feature-item">
                            <Check size={12} style={{ color: plan.highlight ? '#6ee7b7' : plan.color, flexShrink: 0 }} />
                            <span style={{ color: plan.highlight ? 'rgba(255,255,255,0.85)' : '#374151' }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Launch offer note */}
          <div className="pr-launch-note">
            <Gift size={16} />
            <span>Founding users get exclusive pricing for the first 12 months. Offer ends on 31st May 2026.</span>
          </div>
        </section>

        {/* COMPARE TABLE */}
        <section className="pr-compare">
          <h2 className="pr-section-title">Compare every feature</h2>
          <p className="pr-section-sub">See exactly what's in each plan before you commit.</p>
          <div className="pr-table-wrap">
            <table className="pr-table">
              <thead>
                <tr>
                  <th className="pr-th-feature">Feature</th>
                  <th>Starter</th>
                  <th className="pr-th-pro">Pro ⭐</th>
                  <th>Business</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, i) => (
                  <tr key={i}>
                    <td className="pr-td-feature">{row.feature}</td>
                    {(['starter', 'pro', 'business'] as const).map(col => {
                      const val = row[col];
                      return (
                        <td key={col} className={col === 'pro' ? 'pr-td-pro' : ''}>
                          {typeof val === 'boolean'
                            ? val ? <Check size={15} className="pr-check" /> : <X size={15} className="pr-x" />
                            : <span>{val}</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="pr-faq">
          <h2 className="pr-section-title">Frequently asked questions</h2>
          <p className="pr-section-sub">Everything you need to know before you sign up.</p>
          <div className="pr-faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`pr-faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="pr-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === i && <p className="pr-faq-a">{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="pr-bottom-cta">
          <div className="pr-bottom-inner">
            <h2 className="pr-bottom-title">Still not sure? Start free.</h2>
            <p className="pr-bottom-sub">14-day trial, no credit card required. Cancel anytime.</p>
            <div className="pr-bottom-btns">
              <Link to="/signup" className="pr-btn-primary">Get started free <ArrowRight size={16} /></Link>
              <Link to="/contact" className="pr-btn-secondary">Talk to our team</Link>
            </div>
            <div className="pr-trust-row">
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

const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

.pr-root { font-family: 'DM Sans', sans-serif; color: #0f172a; background: #fff; overflow-x: hidden; }

/* HERO */
.pr-hero { position: relative; background: #0f172a; padding: clamp(80px,10vw,120px) 24px clamp(60px,8vw,90px); text-align: center; overflow: hidden; }
.pr-hero-glow { position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 700px; height: 400px; background: radial-gradient(ellipse, rgba(13,148,136,0.3) 0%, transparent 70%); pointer-events: none; }
.pr-hero-content { position: relative; max-width: 660px; margin: 0 auto; opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
.pr-hero-content.visible { opacity: 1; transform: none; }

.pr-launch-banner { display: inline-flex; align-items: center; gap: 8px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.35); color: #fbbf24; font-size: 13px; font-weight: 600; padding: 7px 16px; border-radius: 100px; margin-bottom: 28px; }

.pr-hero-title { font-family: 'Sora', sans-serif; font-size: clamp(32px,5vw,54px); font-weight: 800; color: #fff; line-height: 1.1; margin: 0 0 16px; letter-spacing: -1px; }
.pr-hero-accent { background: linear-gradient(135deg, #0d9488, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.pr-hero-sub { font-size: clamp(14px,2vw,17px); color: rgba(255,255,255,0.55); margin: 0 0 36px; line-height: 1.65; }

.pr-billing-toggle { display: inline-flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.07); padding: 10px 20px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; }
.pr-bill-label { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.4); transition: color 0.2s; cursor: pointer; user-select: none; }
.pr-bill-label.active { color: #fff; }
.pr-save-badge { background: #0d9488; color: #fff; font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 100px; margin-left: 6px; }
.pr-toggle-track { width: 44px; height: 22px; background: #0d9488; border-radius: 100px; border: none; cursor: pointer; position: relative; }
.pr-toggle-thumb { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: transform 0.25s; }
.pr-toggle-thumb.yearly { transform: translateX(22px); }

/* CARDS */
.pr-cards-section { padding: clamp(40px,6vw,72px) 24px 40px; background: #f8fafc; }
.pr-cards-grid { max-width: 1200px; margin: 0 auto 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(290px,1fr)); gap: 20px; align-items: start; }

.pr-card { background: #fff; border-radius: 20px; padding: clamp(20px,3vw,28px); border: 1.5px solid #e2e8f0; position: relative; opacity: 0; transform: translateY(16px); animation: none; transition: box-shadow 0.2s, border-color 0.2s; }
.pr-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.09); border-color: var(--cc, #e2e8f0); }
.pr-card-visible { animation: slideUp 0.5s ease both; }
@keyframes slideUp { to { opacity: 1; transform: none; } }

.pr-highlight { background: linear-gradient(145deg, #0d9488, #0f766e); border-color: #0d9488; box-shadow: 0 20px 60px rgba(13,148,136,0.28); }
.pr-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 100px; margin-bottom: 14px; }

.pr-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
.pr-card-icon { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pr-card-name { font-family: 'Sora', sans-serif; font-size: 19px; font-weight: 700; margin: 0 0 2px; }
.pr-card-tagline { font-size: 12px; margin: 0; }

.pr-price-wrap { margin-bottom: 18px; }
.pr-original-price { font-size: 13px; text-decoration: line-through; margin-bottom: 2px; }
.pr-price-row { display: flex; align-items: baseline; gap: 2px; flex-wrap: wrap; }
.pr-currency { font-size: 18px; font-weight: 600; }
.pr-amount { font-family: 'Sora', sans-serif; font-size: 42px; font-weight: 800; line-height: 1; }
.pr-period { font-size: 14px; margin-left: 2px; }
.pr-discount-pill { background: #f59e0b; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 100px; margin-left: 8px; align-self: center; }
.pr-annual { font-size: 12px; margin: 4px 0 0; }

.pr-cta { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; margin-bottom: 18px; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
.pr-cta-white { background: #fff; color: #0d9488; }
.pr-cta-white:hover { background: #f0fdfa; }
.pr-cta-outline { border: 2px solid #e2e8f0; color: #0f172a; background: transparent; }
.pr-cta-outline:hover { border-color: var(--cc); color: var(--cc); }

.pr-card-desc { font-size: 13px; line-height: 1.6; margin: 0 0 18px; }
.pr-features { display: flex; flex-direction: column; gap: 14px; }
.pr-feature-cat {}
.pr-cat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 7px; }
.pr-feature-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 5px; font-size: 13px; line-height: 1.4; }

.pr-launch-note { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 10px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25); color: #92400e; padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; }

/* COMPARE */
.pr-compare { padding: clamp(60px,8vw,90px) 24px; background: #fff; }
.pr-section-title { font-family: 'Sora', sans-serif; font-size: clamp(24px,3vw,36px); font-weight: 800; text-align: center; margin: 0 0 8px; color: #0f172a; }
.pr-section-sub { text-align: center; color: #64748b; font-size: 15px; margin: 0 0 40px; }
.pr-table-wrap { max-width: 900px; margin: 0 auto; overflow-x: auto; border-radius: 16px; border: 1px solid #e2e8f0; }
.pr-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 500px; }
.pr-table thead tr { background: #f8fafc; }
.pr-table th { padding: 14px 12px; font-weight: 700; color: #374151; text-align: center; border-bottom: 1px solid #e2e8f0; }
.pr-th-feature { text-align: left; width: 35%; }
.pr-th-pro { color: #0d9488; }
.pr-table td { padding: 12px; text-align: center; border-bottom: 1px solid #f1f5f9; color: #374151; }
.pr-table tr:last-child td { border-bottom: none; }
.pr-table tr:hover td { background: #f8fafc; }
.pr-td-feature { text-align: left; font-weight: 500; }
.pr-td-pro { background: #f0fdfa; }
.pr-check { color: #0d9488; margin: 0 auto; display: block; }
.pr-x { color: #cbd5e1; margin: 0 auto; display: block; }

/* FAQ */
.pr-faq { padding: clamp(60px,8vw,90px) 24px; background: #f8fafc; }
.pr-faq-list { max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }
.pr-faq-item { background: #fff; border-radius: 14px; border: 1.5px solid #e2e8f0; overflow: hidden; transition: border-color 0.2s; }
.pr-faq-item.open { border-color: #0d9488; }
.pr-faq-q { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; background: none; border: none; cursor: pointer; font-size: 15px; font-weight: 600; color: #0f172a; text-align: left; font-family: 'DM Sans', sans-serif; gap: 12px; }
.pr-faq-q svg { flex-shrink: 0; color: #94a3b8; }
.pr-faq-a { padding: 12px 18px 16px; font-size: 14px; color: #475569; line-height: 1.7; margin: 0; border-top: 1px solid #f1f5f9; }

/* BOTTOM CTA */
.pr-bottom-cta { padding: clamp(60px,8vw,90px) 24px; background: linear-gradient(135deg, #0f172a 0%, #0d9488 100%); text-align: center; }
.pr-bottom-inner { max-width: 540px; margin: 0 auto; }
.pr-bottom-title { font-family: 'Sora', sans-serif; font-size: clamp(28px,4vw,42px); font-weight: 800; color: #fff; margin: 0 0 12px; }
.pr-bottom-sub { font-size: 16px; color: rgba(255,255,255,0.6); margin: 0 0 30px; }
.pr-bottom-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
.pr-btn-primary { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #0d9488; font-weight: 700; padding: 13px 26px; border-radius: 12px; font-size: 15px; text-decoration: none; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
.pr-btn-primary:hover { background: #f0fdfa; transform: translateY(-1px); }
.pr-btn-secondary { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); color: #fff; font-weight: 600; padding: 13px 22px; border-radius: 12px; font-size: 15px; text-decoration: none; border: 1.5px solid rgba(255,255,255,0.25); transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
.pr-btn-secondary:hover { background: rgba(255,255,255,0.18); }
.pr-trust-row { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; font-size: 13px; color: rgba(255,255,255,0.5); }
.pr-trust-row span { display: flex; align-items: center; gap: 5px; }

@media(max-width:640px){
  .pr-cards-grid { grid-template-columns: 1fr; }
  .pr-bottom-btns { flex-direction: column; align-items: stretch; }
}
`;

export default Pricing;