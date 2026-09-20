import React, { useEffect, useRef, useState } from 'react';
import { Users, Heart, Zap, Shield, Linkedin, Twitter } from 'lucide-react';

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

const TEAM = [
  {
    id: 1,
    name: 'Hamim Quazi Syed Frahuddin',
    role: 'Founder & CEO',
    image: '/assets/Hamim.jpeg',
    bio: 'Building Hypnate to give every Indian SMB the power of an enterprise commerce stack — right inside their chat window.',
    linkedin: 'https://www.linkedin.com/in/hamim-quazi-syed-frahuddin/',
    initial: 'H',
  },
  {
    id: 2,
    name: 'Syed Md Farhat Ali Nizami',
    role: 'Co-Founder & CFO',
    image: '/assets/farhat.jpeg',
    bio: 'Leading Hypnate\'s financial strategy and operations, ensuring every rupee invested in our platform delivers measurable value.',
    linkedin: 'https://www.linkedin.com/in/smfan/',
    initial: 'F',
  },
];

const VALUES = [
  { icon: Zap, color: '#f59e0b', bg: '#fef3c7', title: 'Innovation', desc: 'We constantly push the boundaries of what AI can do for social commerce in India.' },
  { icon: Shield, color: '#0ea5e9', bg: '#e0f2fe', title: 'Trust', desc: 'We treat every merchant\'s data and business with the highest level of security and respect.' },
  { icon: Heart, color: '#e1306c', bg: '#fce7f3', title: 'Simplicity', desc: 'We build deeply complex technology so you can have the simplest possible experience.' },
  { icon: Users, color: '#0d9488', bg: '#f0fdfa', title: 'Impact', desc: 'We measure our success by the growth of the businesses and merchants we serve.' },
];

const MILESTONES = [
  { year: 'Sep 2025', label: 'The idea', desc: 'The idea for Hypnate began in Patna. We started researching the problem, speaking with businesses, and validating whether chat-first commerce was a real need.' },
  { year: 'Oct 2025', label: 'Building begins', desc: 'After the initial research, we started building the first version of Hypnate and turning the idea into a working product.' },
  { year: 'Feb 2026', label: 'Company & co-founder', desc: 'Hypnate Solutions Pvt Ltd was registered, and our co-founder joined the journey to build the company together.' },
  // { year: 'Sep 2026', label: 'Beta testing', desc: 'We are preparing the product for beta testing with early merchants, gathering feedback and validating the workflows before a wider launch.' },
  // { year: 'Oct 2026', label: 'Public launch', desc: 'Our planned public launch — opening Hypnate to businesses beyond the initial beta group.' },
];

export const About = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVis, setHeroVis] = useState(false);
  const storySection = useInView();
  const valuesSection = useInView();
  const teamSection = useInView();
  const timelineSection = useInView();

  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{ background: '#fff', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdfa 50%, #e0f2fe 100%)',
        padding: 'clamp(80px,12vw,140px) clamp(16px,4vw,24px) clamp(60px,8vw,100px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative rings */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(13,148,136,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -40, right: -40, width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(13,148,136,0.1)', pointerEvents: 'none' }} />

        <div ref={heroRef} style={{
          maxWidth: 760, margin: '0 auto', position: 'relative',
          opacity: heroVis ? 1 : 0, transform: heroVis ? 'none' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#f0fdfa', border: '1px solid #ccfbf1',
            color: '#0d9488', padding: '5px 16px', borderRadius: 100,
            fontSize: 12, fontWeight: 700, marginBottom: 24,
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            Our Story
          </div>

          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 'clamp(28px, 5vw, 54px)', fontWeight: 900,
            color: '#0f172a', lineHeight: 1.15, marginBottom: 20,
            letterSpacing: '-1px',
          }}>
            Empowering the next generation of{' '}
            <span style={{ color: '#0d9488' }}>social entrepreneurs</span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2.2vw, 19px)', color: '#64748b',
            lineHeight: 1.75, maxWidth: 600, margin: '0 auto',
          }}>
            At Hypnate, we believe that commerce should be conversational, personal, and accessible to every Indian business — regardless of size.
          </p>
        </div>
      </section>

      {/* ── STORY ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,24px)' }}>
        <div ref={storySection.ref} style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
          gap: 'clamp(32px,5vw,60px)', alignItems: 'center',
          opacity: storySection.inView ? 1 : 0, transform: storySection.inView ? 'none' : 'translateY(28px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          {/* Image */}
          <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
              alt="Hypnate team working"
              style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(13,148,136,0.9), transparent)',
              padding: '24px 20px 20px',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Started in Patna, Bihar</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>The journey began in September 2025</div>
            </div>
          </div>

          {/* Text */}
          <div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 800, color: '#0f172a', marginBottom: 20, letterSpacing: '-0.5px' }}>
              Why we started Hypnate
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                'The idea for Hypnate started in September 2025. Before writing the product, we spent time researching the problem and talking to businesses to understand whether this was a real need.',
                'In October 2025, we started building. The goal was simple: create commerce infrastructure around the conversations where Indian businesses already interact with customers.',
                'In February 2026, we registered Hypnate Solutions Pvt Ltd and brought our co-founder into the journey. Since then, we have been turning the early idea into a product we can test with real merchants.',
              ].map((text, i) => (
                <p key={i} style={{ fontSize: 16, color: '#64748b', lineHeight: 1.75, margin: 0 }}>{text}</p>
              ))}
            </div>

            {/* Founder quote */}
            <div style={{
              marginTop: 28, padding: '16px 20px',
              background: '#f0fdfa', borderLeft: '4px solid #0d9488',
              borderRadius: '0 12px 12px 0',
            }}>
              <p style={{ fontSize: 15, fontStyle: 'italic', color: '#0f172a', lineHeight: 1.65, margin: '0 0 8px' }}>
                "Commerce in India is personal. It happens over chai, over DMs, over WhatsApp voice notes. We built Hypnate to meet merchants where they already are."
              </p>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0d9488' }}>— Hamim Quazi, Founder & CEO</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ background: '#0f172a', padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,24px)' }}>
        <div ref={valuesSection.ref} style={{
          maxWidth: 1100, margin: '0 auto',
          opacity: valuesSection.inView ? 1 : 0, transform: valuesSection.inView ? 'none' : 'translateY(28px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,60px)' }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              Our Core Values
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>The principles that guide every product decision we make.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 20 }}>
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: 'clamp(20px,2.5vw,28px)',
                  transition: 'transform 0.2s, background 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)'; }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: v.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Icon size={22} color={v.color} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>{v.title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0 }}>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,24px)' }}>
        <div ref={teamSection.ref} style={{
          maxWidth: 900, margin: '0 auto', textAlign: 'center',
          opacity: teamSection.inView ? 1 : 0, transform: teamSection.inView ? 'none' : 'translateY(28px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
            Meet the Founders
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 'clamp(40px,6vw,60px)' }}>
            Two builders from Patna with one mission: democratize commerce for Indian SMBs.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px,100%),1fr))', gap: 'clamp(24px,4vw,48px)', justifyItems: 'center' }}>
            {TEAM.map(member => (
              <div key={member.id} style={{ textAlign: 'center', maxWidth: 360 }}
                onMouseEnter={e => {
                  const img = (e.currentTarget as HTMLDivElement).querySelector('img, .member-avatar') as HTMLElement;
                  if (img) img.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={e => {
                  const img = (e.currentTarget as HTMLDivElement).querySelector('img, .member-avatar') as HTMLElement;
                  if (img) img.style.transform = 'scale(1)';
                }}>
                {/* Avatar / image */}
                <div style={{
                  width: 'min(280px, 100%)', aspectRatio: '1',
                  borderRadius: 20, overflow: 'hidden',
                  margin: '0 auto 20px',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  position: 'relative',
                }}>
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block', transition: 'transform 0.4s', filter: 'grayscale(10%)' }}
                      onError={e => {
                        // Fallback if image fails to load
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement as HTMLDivElement;
                        if (parent) {
                          parent.style.background = `linear-gradient(135deg, #0d9488, #0ea5e9)`;
                          parent.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-size:72px;font-weight:900;color:rgba(255,255,255,0.9);">${member.initial}</div>`;
                        }
                      }}
                    />
                  ) : (
                    // Farhat — show an elegant placeholder since image was corrupted
                    <div className="member-avatar" style={{
                      width: '100%', height: '100%',
                      background: 'linear-gradient(135deg, #1e293b 0%, #0d9488 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'transform 0.4s',
                    }}>
                      <div>
                        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(56px, 12vw, 80px)', fontWeight: 900, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 1 }}>
                          {member.initial}
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8 }}>
                          Photo coming soon
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                  {member.name}
                </h3>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0d9488', marginBottom: 10 }}>{member.role}</p>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, marginBottom: 16, maxWidth: 280, margin: '0 auto 16px' }}>
                  {member.bio}
                </p>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a66c2', textDecoration: 'none', transition: 'transform 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.1)'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'}>
                    <Linkedin size={15} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'clamp(48px,6vw,72px)', padding: '28px 24px', background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: 18, color: '#64748b', marginBottom: 14 }}>Want to build the future of social commerce with us?</p>
            <a href="/careers" style={{ color: '#0d9488', fontWeight: 700, fontSize: 16, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              See what's coming at Hypnate Careers →
            </a>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ background: '#f8fafc', padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,24px)' }}>
        <div ref={timelineSection.ref} style={{
          maxWidth: 700, margin: '0 auto',
          opacity: timelineSection.inView ? 1 : 0, transform: timelineSection.inView ? 'none' : 'translateY(28px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 800, color: '#0f172a', marginBottom: 8, textAlign: 'center' }}>
            Our Journey
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 48 }}>From an idea in Patna to a platform for chat-first commerce.</p>

          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 'clamp(40px,8vw,60px)', top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, #0d9488, #0ea5e9)', borderRadius: 2 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {MILESTONES.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 'clamp(20px,4vw,40px)', alignItems: 'flex-start', paddingLeft: 'clamp(20px,4vw,28px)' }}>
                  {/* Year bubble */}
                  <div style={{ flexShrink: 0, width: 'clamp(64px,12vw,88px)', textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-block', background: '#0d9488', color: '#fff',
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                      position: 'relative', zIndex: 1,
                    }}>
                      {m.year}
                    </div>
                  </div>
                  {/* Dot */}
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#0d9488', border: '3px solid #fff', boxShadow: '0 0 0 2px #0d9488', flexShrink: 0, marginTop: 2, position: 'relative', zIndex: 1 }} />
                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};