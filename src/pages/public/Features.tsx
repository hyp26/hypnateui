import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  MessageCircle, ShoppingBag, CreditCard, BarChart3,
  Bot, Instagram, ArrowRight, Check, Zap, Package,
  Bell, Users, RefreshCw, Globe, Star
} from 'lucide-react';

// Simple intersection observer hook for scroll animations
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const FEATURES = [
  {
    id: 'whatsapp',
    icon: MessageCircle,
    color: '#25d366',
    bg: '#dcfce7',
    label: 'WhatsApp Commerce',
    headline: 'Your entire store lives inside the chat',
    body: 'Turn your WhatsApp Business number into a fully automated storefront. Customers browse your catalog, place orders, and get updates — all without leaving the app. Hypnate connects your product catalog directly to WhatsApp, so every "Price please?" becomes a confirmed sale.',
    points: [
      'Interactive product catalogs with images & pricing',
      'Automated cart recovery messages',
      'Order confirmation & shipping updates via WhatsApp',
      'Broadcast campaigns to segmented contact lists',
      'Handles COD confirmation and payment link dispatch',
    ],
    stat: { value: '3×', label: 'Higher conversion vs website links' },
    dark: false,
  },
  {
    id: 'instagram',
    icon: Instagram,
    color: '#e1306c',
    bg: '#fce7f3',
    label: 'Instagram & Facebook DM Sales',
    headline: 'Convert followers into buyers automatically',
    body: 'When someone comments "Price?" or DMs you on Instagram, Hypnate\'s AI instantly responds with product info, handles objections, and closes the sale. No more missed DMs. No more manual replies at midnight.',
    points: [
      'Auto-reply to DMs, comments and story replies',
      'Unified inbox for Instagram, Facebook & Telegram',
      'AI that matches your brand\'s tone and language',
      'Smart handoff to human agent when needed',
    ],
    stat: { value: '80%', label: 'Of DMs handled without human touch' },
    dark: true,
  },
  {
    id: 'orders',
    icon: ShoppingBag,
    color: '#2563eb',
    bg: '#dbeafe',
    label: 'Order Management',
    headline: 'From chat to confirmed order in seconds',
    body: 'Every conversation that leads to a sale is automatically converted into a structured order card in your dashboard. Track status, assign to team members, export CSV reports, and send WhatsApp shipping alerts — all from one place.',
    points: [
      'Automatic order creation from chat conversations',
      'Real-time status tracking (Pending → Delivered)',
      'Bulk export to CSV for accounting & logistics',
      'COD verification flow via WhatsApp',
      'Custom order statuses for your workflow',
    ],
    stat: { value: '0', label: 'Orders lost due to manual tracking errors' },
    dark: false,
  },
  {
    id: 'payments',
    icon: CreditCard,
    color: '#7c3aed',
    bg: '#ede9fe',
    label: 'Instant Payments',
    headline: 'Payment links sent before the customer can think twice',
    body: 'As soon as an order is confirmed, Hypnate auto-generates a Razorpay payment link and sends it directly in the chat. Customers pay via UPI, card, or netbanking without leaving WhatsApp. Payments are tracked and reconciled in your dashboard live.',
    points: [
      'Razorpay & UPI integration out of the box',
      'Auto-send payment link on order confirmation',
      'Real-time paid vs pending dashboard',
      'Automatic payment failure follow-up',
      'Invoices generated and sent automatically',
    ],
    stat: { value: '94%', label: 'Payment completion rate in-chat' },
    dark: false,
  },
  {
    id: 'ai',
    icon: Bot,
    color: '#f59e0b',
    bg: '#fef3c7',
    label: 'AI Sales Agent',
    headline: 'A sales rep that never sleeps, never misses',
    body: 'Hypnate\'s AI agent is trained on your product catalog, pricing, FAQs, and brand tone. It handles size queries, stock checks, upselling, discount negotiations, and post-purchase support — 24 hours a day, in English and Hindi.',
    points: [
      'Trained on your exact catalog & FAQs',
      'Responds in Hindi, English, or Hinglish',
      'Handles objections and negotiates smartly',
      'Upsells related products contextually',
      'Smart escalation to human agents',
    ],
    stat: { value: '24/7', label: 'Always-on without extra staff cost' },
    dark: true,
  },
  {
    id: 'analytics',
    icon: BarChart3,
    color: '#0d9488',
    bg: '#f0fdfa',
    label: 'Real-time Analytics',
    headline: 'Know exactly what\'s working and what isn\'t',
    body: 'Your Hypnate dashboard shows live revenue, order volumes, top-selling products, and channel performance — updated every minute. Stop guessing which Instagram post drove sales. Start knowing.',
    points: [
      'Revenue by channel (WhatsApp, Instagram, Facebook)',
      'Top products by units sold and revenue',
      'Conversion funnel from chat to payment',
      'Customer repeat rate and LTV tracking',
      'Team performance and response time metrics',
    ],
    stat: { value: 'Live', label: 'Data updated every 60 seconds' },
    dark: false,
  },
];

const MINI_FEATURES = [
  { icon: Bell, label: 'Abandoned Cart Recovery', desc: 'Auto-send reminders to customers who didn\'t complete checkout.' },
  { icon: Users, label: 'Team Inbox', desc: 'Assign conversations to team members with role-based access.' },
  { icon: Package, label: 'Inventory Alerts', desc: 'Get WhatsApp alerts when any product goes below your stock threshold.' },
  { icon: RefreshCw, label: 'Auto Catalog Sync', desc: 'Product updates in Hypnate reflect instantly across all channels.' },
  { icon: Globe, label: 'Multi-language AI', desc: 'AI replies in Hindi, English, or Hinglish based on customer preference.' },
  { icon: Star, label: 'CSAT Surveys', desc: 'Post-purchase satisfaction surveys sent automatically via WhatsApp.' },
];

function FeatureSection({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const { ref, inView } = useInView();
  const isEven = index % 2 === 0;
  const Icon = feature.icon;

  return (
    <section
      ref={ref}
      style={{
        background: feature.dark ? '#0f172a' : '#fff',
        padding: '80px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background accent */}
      {feature.dark && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 600, height: 600,
          background: `radial-gradient(ellipse, ${feature.color}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      <div style={{
        maxWidth: 1160, margin: '0 auto', padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '60px',
        alignItems: 'center',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}>
        {/* Text — alternates sides on desktop */}
        <div style={{ order: isEven ? 1 : 2 }}>
          {/* Label pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: feature.bg, color: feature.color,
            padding: '6px 14px', borderRadius: 100,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.5px',
            textTransform: 'uppercase', marginBottom: 20,
          }}>
            <Icon size={14} />
            {feature.label}
          </div>

          <h2 style={{
            fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800,
            color: feature.dark ? '#fff' : '#0f172a',
            lineHeight: 1.15, marginBottom: 18, letterSpacing: '-0.5px',
            fontFamily: "'Sora', sans-serif",
          }}>
            {feature.headline}
          </h2>

          <p style={{
            fontSize: 16, lineHeight: 1.75,
            color: feature.dark ? 'rgba(255,255,255,0.6)' : '#64748b',
            marginBottom: 28,
          }}>
            {feature.body}
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {feature.points.map((pt, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: feature.color + '22', color: feature.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                }}>
                  <Check size={11} strokeWidth={3} />
                </span>
                <span style={{ color: feature.dark ? 'rgba(255,255,255,0.8)' : '#374151' }}>{pt}</span>
              </li>
            ))}
          </ul>

          {/* Stat */}
          <div style={{
            display: 'inline-block',
            background: feature.dark ? 'rgba(255,255,255,0.07)' : feature.bg,
            border: `1px solid ${feature.color}33`,
            borderRadius: 14, padding: '14px 22px',
          }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: feature.color, lineHeight: 1, fontFamily: "'Sora', sans-serif" }}>
              {feature.stat.value}
            </div>
            <div style={{ fontSize: 13, color: feature.dark ? 'rgba(255,255,255,0.5)' : '#64748b', marginTop: 4 }}>
              {feature.stat.label}
            </div>
          </div>
        </div>

        {/* Visual panel */}
        <div style={{
          order: isEven ? 2 : 1,
          background: feature.dark ? 'rgba(255,255,255,0.04)' : feature.bg,
          border: `1px solid ${feature.color}22`,
          borderRadius: 24,
          padding: '48px 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: 320,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Large icon watermark */}
          <div style={{
            position: 'absolute', bottom: -20, right: -20,
            opacity: 0.06,
          }}>
            <Icon size={180} color={feature.color} />
          </div>

          {/* Center icon display */}
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 96, height: 96, borderRadius: 28,
              background: feature.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: `0 20px 60px ${feature.color}40`,
            }}>
              <Icon size={44} color="#fff" />
            </div>
            <div style={{
              fontSize: 15, fontWeight: 700,
              color: feature.dark ? '#fff' : '#0f172a',
              marginBottom: 8,
            }}>
              {feature.label}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#16a34a22', color: '#16a34a',
              fontSize: 12, fontWeight: 600,
              padding: '4px 12px', borderRadius: 100,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
              Active & Running
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const Features = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0d1f2d 60%, #0d2e2a 100%)',
        padding: 'clamp(80px, 12vw, 140px) 24px clamp(60px, 8vw, 100px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow rings */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(13,148,136,0.25) 0%, transparent 65%)', borderRadius: '50%' }} />
        </div>

        <div ref={heroRef} style={{
          maxWidth: 720, margin: '0 auto', position: 'relative',
          opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.35)',
            color: '#34d399', padding: '6px 16px', borderRadius: 100,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.8px',
            textTransform: 'uppercase', marginBottom: 28,
          }}>
            <Zap size={13} />
            Built for Indian D2C Brands
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 900,
            color: '#fff', lineHeight: 1.1, marginBottom: 20,
            letterSpacing: '-1px', fontFamily: "'Sora', sans-serif",
          }}>
            Every feature your brand needs{' '}
            <span style={{
              background: 'linear-gradient(135deg, #0d9488, #34d399)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              to sell on chat
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2.5vw, 19px)', color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px',
          }}>
            Hypnate replaces your manual order tracking, missed DMs, and payment follow-ups with one fully automated platform — purpose-built for WhatsApp, Instagram & Facebook commerce.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup">
              <button style={{
                background: '#0d9488', color: '#fff', border: 'none',
                padding: '14px 32px', borderRadius: 100,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 32px rgba(13,148,136,0.4)',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Start Free Trial <ArrowRight size={16} />
              </button>
            </Link>
            <Link to="/pricing">
              <button style={{
                background: 'rgba(255,255,255,0.08)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '14px 28px', borderRadius: 100,
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                View Pricing
              </button>
            </Link>
          </div>
        </div>

        {/* Channel badges */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 12,
          marginTop: 60, flexWrap: 'wrap',
          opacity: heroVisible ? 1 : 0,
          transition: 'opacity 0.9s ease 0.3s',
        }}>
          {[
            { label: 'WhatsApp', color: '#25d366', bg: 'rgba(37,211,102,0.12)', border: 'rgba(37,211,102,0.3)' },
            { label: 'Instagram', color: '#e1306c', bg: 'rgba(225,48,108,0.12)', border: 'rgba(225,48,108,0.3)' },
            { label: 'Facebook', color: '#1877f2', bg: 'rgba(24,119,242,0.12)', border: 'rgba(24,119,242,0.3)' },
            { label: 'Telegram', color: '#26a5e4', bg: 'rgba(38,165,228,0.12)', border: 'rgba(38,165,228,0.3)' },
          ].map(ch => (
            <div key={ch.label} style={{
              background: ch.bg, border: `1px solid ${ch.border}`,
              color: ch.color, padding: '7px 18px', borderRadius: 100,
              fontSize: 13, fontWeight: 600,
            }}>
              {ch.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE SECTIONS ── */}
      {FEATURES.map((feature, i) => (
        <FeatureSection key={feature.id} feature={feature} index={i} />
      ))}

      {/* ── MINI FEATURES GRID ── */}
      <section style={{ background: '#f8fafc', padding: 'clamp(60px, 8vw, 100px) 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{
              fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800,
              color: '#0f172a', marginBottom: 12, letterSpacing: '-0.5px',
              fontFamily: "'Sora', sans-serif",
            }}>
              And much more built in
            </h2>
            <p style={{ fontSize: 16, color: '#64748b' }}>
              Every feature you need, none you don't.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {MINI_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{
                  background: '#fff', borderRadius: 16, padding: '24px',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: '#f0fdfa', color: '#0d9488',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                  }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{f.label}</h3>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        padding: 'clamp(60px, 8vw, 100px) 24px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800,
          color: '#fff', marginBottom: 16, letterSpacing: '-0.5px',
          fontFamily: "'Sora', sans-serif",
        }}>
          Ready to see it in action?
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', marginBottom: 36 }}>
          14-day free trial. No credit card required.
        </p>
        <Link to="/signup">
          <button style={{
            background: '#fff', color: '#0d9488',
            border: 'none', padding: '15px 36px', borderRadius: 100,
            fontSize: 16, fontWeight: 800, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}>
            Get Started for Free <ArrowRight size={17} />
          </button>
        </Link>
      </section>
    </div>
  );
};