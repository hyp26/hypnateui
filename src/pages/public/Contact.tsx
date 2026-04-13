import React, { useState } from 'react';
import { Mail, MapPin, MessageSquare, CheckCircle, Send } from 'lucide-react';

interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  sentAt: string;
}

// Store messages locally in memory (no backend)
const messageStore: ContactMessage[] = [];

export const Contact = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', subject: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Save to local in-memory store (simulating DB without backend)
    setTimeout(() => {
      const entry: ContactMessage = {
        id: Date.now().toString(),
        ...form,
        sentAt: new Date().toISOString(),
      };
      messageStore.push(entry);
      console.log('Message saved locally:', entry); // Dev visibility
      setSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <div style={{ background: '#fff', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .contact-input { width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f172a; outline: none; transition: border-color 0.2s, background 0.2s; background: #fafafa; }
        .contact-input:focus { border-color: #0d9488; background: #fff; box-shadow: 0 0 0 3px rgba(13,148,136,0.08); }
        .contact-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
      `}</style>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0d2e2a 100%)',
        padding: 'clamp(72px,10vw,120px) clamp(16px,4vw,24px) clamp(48px,7vw,80px)',
        textAlign: 'center',
      }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(28px,5vw,50px)', fontWeight: 900, color: '#fff', marginBottom: 14, letterSpacing: '-0.5px' }}>
          Get in touch
        </h1>
        <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.55)', maxWidth: 500, margin: '0 auto' }}>
          Whether you're a merchant with questions or a partner with ideas — our team is ready to chat.
        </p>
      </section>

      <section style={{ padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,24px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 'clamp(32px,5vw,56px)' }}>

          {/* LEFT — contact info + map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Contact info card */}
            <div style={{ background: '#f0fdfa', borderRadius: 20, padding: 'clamp(20px,3vw,28px)', border: '1px solid #ccfbf1' }}>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>Contact Information</h3>

              {[
                {
                  icon: <Mail size={20} />,
                  label: 'Email Us',
                  lines: ['hypnate.2026@gmail.com'],
                  sub: 'We reply within 24 hours on business days',
                },
                {
                  icon: <MessageSquare size={20} />,
                  label: 'WhatsApp Support',
                  lines: ['+91 7970959155'],
                  sub: 'Available Mon–Sat, 9am – 7pm IST',
                },
                {
                  icon: <MapPin size={20} />,
                  label: 'Office',
                  lines: ['Hypnate Solutions Pvt Ltd', 'Bait-ul-Faizan, S.M. Reza Street', 'Kangahia Tola, Patna, Bihar 800008', 'India'],
                  sub: null,
                },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: i < 2 ? 24 : 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#0d9488', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginBottom: 4 }}>{item.label}</p>
                    {item.lines.map((line, li) => (
                      <p key={li} style={{ color: '#64748b', fontSize: 14, margin: '0 0 1px', lineHeight: 1.5 }}>{line}</p>
                    ))}
                    {item.sub && <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{item.sub}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Patna Map — OpenStreetMap embed (no API key needed) */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <iframe
                title="Hypnate Office Location - Patna, Bihar"
                src="https://www.openstreetmap.org/export/embed.html?bbox=85.12%2C25.58%2C85.16%2C25.62&layer=mapnik&marker=25.5941%2C85.1376"
                style={{ width: '100%', height: 240, border: 'none', display: 'block' }}
                loading="lazy"
              />
              <div style={{ padding: '10px 14px', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748b' }}>
                <MapPin size={14} color="#ef4444" />
                <span style={{ fontWeight: 500 }}>Patna, Bihar — Hypnate HQ</span>
                <a
                  href="https://www.openstreetmap.org/?mlat=25.5941&mlon=85.1376#map=15/25.5941/85.1376"
                  target="_blank" rel="noopener noreferrer"
                  style={{ marginLeft: 'auto', color: '#0d9488', fontWeight: 600, fontSize: 12, textDecoration: 'none' }}
                >
                  Open in Maps →
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT — form */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 'clamp(20px,3vw,32px)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CheckCircle size={52} color="#16a34a" style={{ margin: '0 auto 18px' }} />
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                  Message received!
                </h3>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.65, maxWidth: 340, margin: '0 auto 24px' }}>
                  Thanks for reaching out. We'll get back to you within 24 hours. You can also WhatsApp us for a faster response.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' }); }}
                  style={{ background: '#0d9488', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>
                  Send us a message
                </h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 14 }}>
                    <div>
                      <label className="contact-label">First Name *</label>
                      <input required value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Rahul" className="contact-input" />
                    </div>
                    <div>
                      <label className="contact-label">Last Name *</label>
                      <input required value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Sharma" className="contact-input" />
                    </div>
                  </div>

                  <div>
                    <label className="contact-label">Email Address *</label>
                    <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="rahul@yourbrand.com" className="contact-input" />
                  </div>

                  <div>
                    <label className="contact-label">Phone Number</label>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className="contact-input" />
                  </div>

                  <div>
                    <label className="contact-label">Subject *</label>
                    <select required value={form.subject} onChange={e => set('subject', e.target.value)} className="contact-input">
                      <option value="">Select a topic...</option>
                      <option>General Inquiry</option>
                      <option>Sales & Pricing</option>
                      <option>Technical Support</option>
                      <option>Partnership</option>
                      <option>Billing</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="contact-label">Message *</label>
                    <textarea
                      required rows={5}
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                      placeholder="Tell us how we can help you..."
                      className="contact-input"
                      style={{ resize: 'vertical', minHeight: 120 }}
                    />
                  </div>

                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#94a3b8', lineHeight: 1.55 }}>
                    💬 For faster support, you can also reach us directly on WhatsApp: <strong style={{ color: '#0f172a' }}>+91 7970959155</strong>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%', padding: '13px', background: '#0d9488', color: '#fff',
                      border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                      cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = '#0f766e'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#0d9488'; }}
                  >
                    {submitting ? 'Sending…' : <><Send size={16} /> Send Message</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};