import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, ArrowRight, Send, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

const AUTHORS = {
  hamim: { name: 'Hamim Quazi Syed Frahuddin', role: 'Founder & CEO, Hypnate', initials: 'HQ' },
  farhat: { name: 'Syed Md Farhat Ali Nizami', role: 'Co-Founder & CFO, Hypnate', initials: 'SF' },
};

const BLOG_POSTS = [
  {
    id: 1,
    slug: 'whatsapp-commerce-guide-2026',
    title: 'The Complete Guide to WhatsApp Commerce in 2026',
    excerpt: 'Discover how Indian D2C brands are shifting from websites to conversational commerce and increasing conversion rates by 3x on WhatsApp Business API.',
    category: 'Commerce',
    author: AUTHORS.hamim,
    date: 'Jan 15, 2026',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
    readTime: '8 min read',
  },
  {
    id: 2,
    slug: 'ai-customer-support-automation',
    title: 'Automating Customer Support without Losing the Human Touch',
    excerpt: 'Learn how to train AI agents to handle 80% of your queries while keeping your brand voice authentic and your customers happy.',
    category: 'AI Technology',
    author: AUTHORS.farhat,
    date: 'Jan 28, 2026',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    readTime: '6 min read',
  },
  {
    id: 3,
    slug: 'instagram-dm-sales-strategies',
    title: '5 Instagram DM Strategies to Close More Sales in 2026',
    excerpt: 'Stop sending links. Start having conversations. Here are the exact scripts top Indian D2C brands use to turn DMs into revenue.',
    category: 'Marketing',
    author: AUTHORS.hamim,
    date: 'Feb 5, 2026',
    image: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&q=80',
    readTime: '5 min read',
  },
  {
    id: 4,
    slug: 'festive-season-sales-tips',
    title: 'Preparing Your Inventory for the Festive Season Rush',
    excerpt: 'Eid and Diwali are coming. Is your supply chain ready? A complete checklist to ensure you never run out of stock during peak demand.',
    category: 'Operations',
    author: AUTHORS.farhat,
    date: 'Feb 18, 2026',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80',
    readTime: '7 min read',
  },
  {
    id: 5,
    slug: 'upi-payments-whatsapp',
    title: 'Why UPI on WhatsApp is a Game Changer for Indian SMBs',
    excerpt: 'Seamless in-chat payments mean fewer drop-offs. Understand the new UPI and Razorpay flows available inside WhatsApp conversations.',
    category: 'Payments',
    author: AUTHORS.hamim,
    date: 'Mar 2, 2026',
    image: 'https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=800&q=80',
    readTime: '4 min read',
  },
  {
    id: 6,
    slug: 'scaling-d2c-brand',
    title: 'Scaling a D2C Brand from Zero to ₹1 Crore Revenue',
    excerpt: 'Case study: How a small Patna-based fashion brand used Hypnate to scale their WhatsApp and Instagram sales with a team of just two people.',
    category: 'Case Study',
    author: AUTHORS.farhat,
    date: 'Mar 14, 2026',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    readTime: '10 min read',
  },
];

const CATEGORIES = ['All', 'Commerce', 'AI Technology', 'Marketing', 'Operations', 'Payments', 'Case Study'];

const ALLOWED_TOPICS = [
  'WhatsApp commerce & marketing',
  'Instagram & Facebook selling strategies',
  'AI in customer support & sales',
  'D2C brand growth & operations',
  'Payment collection & reconciliation',
  'Inventory management for social sellers',
  'Case studies of Indian SMBs',
];

export const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Public submission form state
  const [form, setForm] = useState({ name: '', email: '', title: '', topic: '', summary: '', content: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission (no backend)
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <section className="bg-gray-50 pt-16 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#f0fdfa', border: '1px solid #ccfbf1',
            color: '#0d9488', padding: '5px 14px', borderRadius: 100,
            fontSize: 12, fontWeight: 700, marginBottom: 20,
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            Hypnate Blog
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: '#0f172a', marginBottom: 14, letterSpacing: '-0.5px' }}>
            Insights for social sellers
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 mb-8 px-2">
            Strategies, case studies, and product updates for Indian D2C brands selling on chat.
          </p>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm sm:text-base"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-gray-100 sticky top-16 bg-white/95 backdrop-blur-sm z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto py-3 sm:py-4">
          <div className="flex items-center gap-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors",
                  activeCategory === cat ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPosts.map((post) => (
                <article key={post.id} className="flex flex-col group">
                  <Link to={`/blog/${post.slug}`} className="block overflow-hidden rounded-xl sm:rounded-2xl mb-4">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full aspect-[16/10] object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wide">
                      {post.category}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {post.date}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors leading-snug">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                        {post.author.initials}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-800 leading-tight">{post.author.name}</div>
                        <div className="text-xs text-gray-400 leading-tight">{post.author.role}</div>
                      </div>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all shrink-0 ml-2">
                      Read <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No articles found matching your search.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── PUBLIC SUBMISSION SECTION ── */}
      <section style={{ background: '#f8fafc', padding: 'clamp(60px,8vw,90px) 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: '#fffbeb', border: '1px solid #fde68a',
              color: '#92400e', padding: '5px 14px', borderRadius: 100,
              fontSize: 12, fontWeight: 700, marginBottom: 16,
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              ✍️ Write for Hypnate
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 800, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.5px' }}>
              Share your expertise with our community
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>
              Are you a D2C seller, marketer, or commerce expert? Write for the Hypnate blog and reach thousands of Indian social sellers.
            </p>
          </div>

          {/* Review process notice */}
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
            padding: '18px 20px', marginBottom: 28,
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginBottom: 6 }}>Editorial Review Process</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>
                All submitted articles are reviewed by the Hypnate editorial team before going live. We typically review within <strong>5–7 business days</strong>. Articles must be original, relevant to social commerce or D2C business in India, and not promotional in nature. Once approved, you'll be notified by email and credited as the author.
              </div>
            </div>
          </div>

          {/* Allowed topics */}
          <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 14, padding: '16px 20px', marginBottom: 28 }}>
            <div style={{ fontWeight: 700, color: '#0d9488', fontSize: 13, marginBottom: 10 }}>✅ Accepted Topics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '6px 16px' }}>
              {ALLOWED_TOPICS.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#374151' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9488', flexShrink: 0 }} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Submission form */}
          {submitted ? (
            <div style={{
              background: '#fff', border: '1.5px solid #86efac', borderRadius: 16,
              padding: '40px 28px', textAlign: 'center',
            }}>
              <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                Article submitted!
              </h3>
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.65, maxWidth: 400, margin: '0 auto 20px' }}>
                Thank you for contributing. Our editorial team will review your submission and reach out within 5–7 business days.
              </p>
              <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', title: '', topic: '', summary: '', content: '' }); }}
                style={{ background: '#0d9488', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Submit another article
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 'clamp(20px,3vw,32px)' }}>
              <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: 16, marginBottom: 20 }}>Submit your article</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16, marginBottom: 16 }}>
                <Field label="Your Full Name *">
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Priya Sharma" style={inputStyle} />
                </Field>
                <Field label="Email Address *">
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="priya@yourbrand.com" style={inputStyle} />
                </Field>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Field label="Article Title *">
                  <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. How I grew my WhatsApp sales by 200%" style={inputStyle} />
                </Field>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Field label="Topic Category *">
                  <select required value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} style={inputStyle}>
                    <option value="">Select a topic...</option>
                    {ALLOWED_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Field label="Brief Summary *">
                  <textarea required value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="In 2-3 sentences, what is this article about and why would it help Hypnate's audience?" style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
                </Field>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Field label="Full Article Content *">
                  <textarea required value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Paste or write your full article here (minimum 500 words). Plain text or Markdown is fine." style={{ ...inputStyle, minHeight: 200, resize: 'vertical' }} />
                </Field>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: '#64748b', lineHeight: 1.65 }}>
                By submitting, you confirm this is original work and grant Hypnate the right to publish it on our blog with full author credit. Hypnate reserves the right to edit for clarity and style.
              </div>

              <button type="submit" disabled={submitting} style={{
                width: '100%', padding: '13px', background: '#0d9488', color: '#fff',
                border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {submitting ? 'Submitting…' : <><Send size={16} /> Submit for Review</>}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 style={{ fontFamily: "'Sora', sans-serif" }} className="text-2xl sm:text-3xl font-bold mb-4">Get smarter about social commerce</h2>
          <p className="text-primary-200 mb-8 text-sm sm:text-base">Join merchants receiving our weekly tips and trends.</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" className="flex-1 px-5 sm:px-6 py-3 rounded-full text-gray-900 focus:outline-none text-sm sm:text-base" />
            <Button className="rounded-full px-6 sm:px-8 bg-secondary-500 hover:bg-secondary-600 border-0 whitespace-nowrap">Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  border: '1.5px solid #e2e8f0', borderRadius: 10,
  fontSize: 14, fontFamily: "'DM Sans', sans-serif",
  color: '#0f172a', outline: 'none', background: '#fafafa',
  boxSizing: 'border-box',
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>
    {children}
  </div>
);