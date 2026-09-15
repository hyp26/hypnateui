import React, { useEffect, useRef, useState } from 'react';
import { Rocket, Heart, Globe, Coffee, Bell, ArrowRight, Linkedin } from 'lucide-react';

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

const BENEFITS = [
  { icon: Rocket, color: '#f59e0b', bg: '#fef3c7', title: 'High Impact', desc: 'Your work will directly contribute to the tools Indian merchants use to manage social commerce. No bureaucracy, no waiting.' },
  { icon: Heart, color: '#e1306c', bg: '#fce7f3', title: 'Health First', desc: 'Comprehensive health insurance for you and your immediate family from day one.' },
  { icon: Globe, color: '#0ea5e9', bg: '#e0f2fe', title: 'Remote Friendly', desc: 'Work from anywhere in India. We trust you to deliver great results, not just log hours.' },
  { icon: Coffee, color: '#0d9488', bg: '#f0fdfa', title: 'Learning Budget', desc: 'Annual stipend for courses, books, and conferences. We invest in your growth.' },
];

const UPCOMING_ROLES = [
  { title: 'Full-Stack Engineer', dept: 'Engineering', type: 'Full-time · Remote' },
  { title: 'AI/ML Engineer', dept: 'Engineering', type: 'Full-time · Remote' },
  { title: 'Growth & Marketing Lead', dept: 'Marketing', type: 'Full-time · Hybrid' },
  { title: 'Customer Success Manager', dept: 'Operations', type: 'Full-time · Remote' },
  { title: 'WhatsApp Commerce Specialist', dept: 'Product', type: 'Full-time · Remote' },
];

export const Careers = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVis, setHeroVis] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const benefitsSection = useInView();
  const rolesSection = useInView();

  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 80); return () => clearTimeout(t); }, []);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotifySubmitted(true);
    setNotifyEmail('');
  };

  return (
    <div style={{ background: '#fff', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0d2e2a 100%)',
        padding: 'clamp(80px,12vw,140px) clamp(16px,4vw,24px) clamp(60px,8vw,100px)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background elements */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(13,148,136,0.15) 0%, transparent 65%)', pointerEvents: 'none', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />

        <div ref={heroRef} style={{
          maxWidth: 1100, margin: '0 auto',
          opacity: heroVis ? 1 : 0, transform: heroVis ? 'none' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          {/* "Coming soon" chip — NOT "we are hiring" */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
            color: '#fbbf24', padding: '6px 16px', borderRadius: 100,
            fontSize: 13, fontWeight: 600, marginBottom: 28,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b' }} />
            Hiring opens very soon — stay tuned
          </div>

          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 'clamp(32px, 6vw, 68px)', fontWeight: 900,
            color: '#fff', lineHeight: 1.1, marginBottom: 24,
            letterSpacing: '-1.5px', maxWidth: 700,
          }}>
            Join the future of<br />
            <span style={{
              background: 'linear-gradient(135deg, #0d9488, #34d399)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              AI Commerce
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2.2vw, 19px)', color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.75, maxWidth: 560, marginBottom: 0,
          }}>
            We're building the operating system for social commerce in India. When we open roles, we'll be looking for builders who care deeply about impact, craft, and the merchants they serve.
          </p>
        </div>
      </section>

      {/* ── NOTIFY BANNER ── */}
      <section style={{ background: '#0d9488', padding: 'clamp(24px,4vw,36px) clamp(16px,4vw,24px)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
              Be first to know when we hire
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Drop your email and we'll notify you the moment roles open up.</p>
          </div>
          {notifySubmitted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 14 }}>
              ✅ You're on the list! We'll reach out when positions open.
            </div>
          ) : (
            <form onSubmit={handleNotify} style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 440, flexWrap: 'wrap' }}>
              <input
                type="email" required
                value={notifyEmail}
                onChange={e => setNotifyEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  flex: 1, minWidth: 180, padding: '11px 16px',
                  borderRadius: 10, border: 'none', outline: 'none',
                  fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: '#0f172a',
                }}
              />
              <button type="submit" style={{
                background: '#0f172a', color: '#fff', border: 'none',
                padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
              }}>
                <Bell size={15} /> Notify Me
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── WHY HYPNATE ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,24px)' }}>
        <div ref={benefitsSection.ref} style={{
          maxWidth: 1100, margin: '0 auto',
          opacity: benefitsSection.inView ? 1 : 0, transform: benefitsSection.inView ? 'none' : 'translateY(28px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(36px,5vw,56px)' }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
              Why work at Hypnate?
            </h2>
            <p style={{ fontSize: 16, color: '#64748b' }}>More than just a job. It's a mission.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 20 }}>
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} style={{
                  background: '#fff', borderRadius: 18, padding: 'clamp(20px,2.5vw,28px)',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.09)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Icon size={24} color={b.color} />
                  </div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{b.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65, margin: 0 }}>{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── UPCOMING ROLES ── */}
      <section style={{ background: '#f8fafc', padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,24px)' }}>
        <div ref={rolesSection.ref} style={{
          maxWidth: 760, margin: '0 auto', textAlign: 'center',
          opacity: rolesSection.inView ? 1 : 0, transform: rolesSection.inView ? 'none' : 'translateY(28px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
            Roles we're planning to open
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 40 }}>
            No positions are open right now — but these are the roles we anticipate opening soon. If you're a fit, get on our notify list above.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
            {UPCOMING_ROLES.map((role, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 14, padding: '18px 20px',
                border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 12, flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginBottom: 4 }}>{role.title}</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0d9488', background: '#f0fdfa', padding: '2px 9px', borderRadius: 100 }}>{role.dept}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{role.type}</span>
                  </div>
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: '#f59e0b',
                  background: '#fffbeb', border: '1px solid #fde68a',
                  padding: '4px 12px', borderRadius: 100, whiteSpace: 'nowrap',
                }}>
                  Coming soon
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://www.linkedin.com/company/hypnate/"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#0a66c2', color: '#fff',
                padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                textDecoration: 'none', transition: 'opacity 0.15s', fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
            >
              <Linkedin size={16} /> Follow us on LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ background: '#0f172a', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,24px)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
          Build something that matters
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
          When we're ready to grow our team, we'll be looking for people who are genuinely excited about commerce, AI, and India's creator economy.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#0d9488', color: '#fff', padding: '13px 26px', borderRadius: 12,
            fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#0f766e'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = '#0d9488'}>
            Get in Touch <ArrowRight size={16} />
          </a>
          <a href="https://www.linkedin.com/company/hypnate/" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.08)', color: '#fff',
            border: '1.5px solid rgba(255,255,255,0.2)',
            padding: '13px 22px', borderRadius: 12,
            fontSize: 15, fontWeight: 600, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
          }}>
            <Linkedin size={16} /> Follow our journey
          </a>
        </div>
      </section>
    </div>
  );
};