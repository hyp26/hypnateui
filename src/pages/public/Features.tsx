import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, ShoppingBag, CreditCard, BarChart3,
  Bot, Instagram, Facebook, Send, ArrowRight, Check, Zap, Package
} from 'lucide-react';
import { PUBLIC_CHANNEL_SUMMARY } from '../../data/publicChannels';

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
    headline: 'Bring your store into the chat workflow',
    body: 'Use your WhatsApp Business channel as a commerce workflow. Customers can browse supported catalog content, ask questions, and place orders through chat. Hypnate connects supported catalog data to your conversation workflow.',
    points: [
      'Interactive catalog content with images and pricing',
      'Supported follow-up messages for incomplete purchases',
      'Order confirmation and shipping updates via WhatsApp',
      'Supported messaging workflows across connected channels',
      'Supports COD and payment-link workflows where configured',
    ],
    stat: { value: 'Conversational', label: 'Commerce workflow' },
    dark: false,
  },
  {
    id: 'instagram',
    icon: Instagram,
    color: '#e1306c',
    bg: '#fce7f3',
    label: 'Instagram & Facebook Commerce',
    headline: 'Turn conversations into assisted sales workflows',
    body: 'Bring Instagram and Facebook customer conversations into the same commerce workspace used for supported product, order and payment workflows.',
    points: [
      'Support for connected Instagram and Facebook conversation workflows',
      'Unified commerce workspace across all four launch channels',
      'Product and customer context alongside conversations',
      'Human review remains available in the workflow',
    ],
    stat: { value: 'Connected', label: 'Conversation workflows' },
    dark: true,
  },
  {
    id: 'telegram',
    icon: Send,
    color: '#26a5e4',
    bg: '#e0f2fe',
    label: 'Telegram Commerce',
    headline: 'Keep Telegram conversations in your commerce workflow',
    body: 'Connect Telegram conversations with the same product, customer and order workspace used across the other supported launch channels.',
    points: [
      'Telegram conversation workflow support',
      'Customer context alongside commerce records',
      'Product information available in the shared workspace',
      'Order and payment workflows where configured',
    ],
    stat: { value: 'Connected', label: 'Commerce workflow' },
    dark: false,
  },
  {
    id: 'orders',
    icon: ShoppingBag,
    color: '#2563eb',
    bg: '#dbeafe',
    label: 'Order Management',
    headline: 'From conversation to structured order',
    body: 'Manage structured order records in your dashboard. Track status, manage customer details, export reports, and keep commerce activity in one place.',
    points: [
      'Structured order creation from the dashboard',
      'Order status tracking (Pending → Delivered)',
      'Bulk export to CSV for accounting & logistics',
      'COD workflows on supported configurations',
      'Custom order statuses for your workflow',
    ],
    stat: { value: 'Structured', label: 'Order workflow support' },
    dark: false,
  },
  {
    id: 'payments',
    icon: CreditCard,
    color: '#7c3aed',
    bg: '#ede9fe',
    label: 'Payment Links',
    headline: 'Create and share payment links from your commerce workflow',
    body: 'For supported payment workflows, Hypnate can create and share Razorpay payment links from the order flow. Payment status can be tracked in the dashboard, subject to the connected payment provider and channel setup.',
    points: [
      'Razorpay payment-link workflow for supported accounts',
      'Payment-link dispatch from supported order workflows',
      'Paid and pending payment status in the dashboard',
      'Invoice workflows on supported configurations',
    ],
    stat: { value: 'Integrated', label: 'Payment-link workflow' },
    dark: false,
  },
  {
    id: 'ai',
    icon: Bot,
    color: '#f59e0b',
    bg: '#fef3c7',
    label: 'AI Catalog Assistance',
    headline: 'Turn catalog documents into structured product data',
    body: 'When AI catalog extraction is configured, Hypnate can read supported catalog documents and extract product fields into structured product rows during onboarding.',
    points: [
      'Extracts product name, price, description and category where available',
      'Uses uploaded catalog text as the source document',
      'Returns structured rows for product onboarding',
      'Available when the required AI configuration is enabled',
    ],
    stat: { value: 'AI-assisted', label: 'Catalog extraction' },
    dark: true,
  },
  {
    id: 'analytics',
    icon: BarChart3,
    color: '#0d9488',
    bg: '#f0fdfa',
    label: 'Commerce Analytics',
    headline: 'Understand your commerce performance',
    body: 'Your Hypnate dashboard brings revenue, order volumes, top-selling products, and channel performance into one place. Use the available analytics to understand channel and product performance.',
    points: [
      'Revenue and order activity by connected channel',
      'Top products by available sales data',
      'Order and payment activity where available',
      'Customer and sales insights where available',
      'Available commerce and customer insights',
    ],
    stat: { value: 'Centralized', label: 'Commerce analytics dashboard' },
    dark: false,
  },
];

const MINI_FEATURES = [
  { icon: Package, label: 'Catalog Management', desc: 'Keep products, pricing and inventory information organized in one workspace.' },
  { icon: ShoppingBag, label: 'Customer Management', desc: 'Keep customer information and commerce history together where supported.' },
  { icon: CreditCard, label: 'Payment Tracking', desc: 'View available payment status information alongside commerce activity.' },
  { icon: MessageCircle, label: 'Channel Workflows', desc: 'Bring supported messaging channels into one commerce workflow.' },
  { icon: BarChart3, label: 'Commerce Reports', desc: 'Review available sales and order information from the dashboard.' },
  { icon: ArrowRight, label: 'CSV Export', desc: 'Export supported commerce data for accounting or operational workflows.' },
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
            <Icon size={14} aria-hidden="true" />
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
                  <Check size={11} strokeWidth={3} aria-hidden="true" />
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
              background: feature.dark ? 'rgba(255,255,255,0.08)' : '#f8fafc',
              color: feature.dark ? 'rgba(255,255,255,0.72)' : '#64748b',
              fontSize: 12, fontWeight: 600,
              padding: '4px 12px', borderRadius: 100,
            }}>
              Hypnate workflow
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
            <Zap size={13} aria-hidden="true" />
            Built for Indian D2C Brands
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 900,
            color: '#fff', lineHeight: 1.1, marginBottom: 20,
            letterSpacing: '-1px', fontFamily: "'Sora', sans-serif",
          }}>
            Features for chat-first commerce{' '}
            <span style={{
              background: 'linear-gradient(135deg, #0d9488, #34d399)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              workflows
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2.5vw, 19px)', color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px',
          }}>
            Hypnate brings order tracking, conversation management, and payment workflows into one platform for supported {PUBLIC_CHANNEL_SUMMARY} commerce use cases.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              background: '#0d9488', color: '#fff', border: 'none',
              padding: '14px 32px', borderRadius: 100,
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 32px rgba(13,148,136,0.4)',
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: 'none',
            }}>
              Get Started <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/pricing" style={{
              background: 'rgba(255,255,255,0.08)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '14px 28px', borderRadius: 100,
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: 'none',
            }}>
              View Pricing
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
                    <Icon size={20} aria-hidden="true" />
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
          Current trial terms are shown at signup and checkout.
        </p>
        <Link to="/signup" style={{
          background: '#fff', color: '#0d9488',
          border: 'none', padding: '15px 36px', borderRadius: 100,
          fontSize: 16, fontWeight: 800, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          textDecoration: 'none',
        }}>
          Get Started <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
};