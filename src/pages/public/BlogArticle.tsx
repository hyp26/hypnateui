import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Facebook, Twitter, Linkedin, Share2, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const AUTHORS = {
  hamim: { name: 'Hamim Quazi Syed Frahuddin', role: 'Founder & CEO, Hypnate', initials: 'HQ' },
  farhat: { name: 'Syed Md Farhat Ali Nizami', role: 'Co-Founder & CFO, Hypnate', initials: 'SF' },
};

const ARTICLES: Record<string, any> = {
  'whatsapp-commerce-guide-2026': {
    title: 'The Complete Guide to WhatsApp Commerce in 2026',
    author: AUTHORS.hamim,
    date: 'Jan 15, 2026',
    category: 'Commerce',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80',
    content: `<p class="lead">The way we sell is changing. It's no longer about browsing static catalogs on websites — it's about having conversations. And in India, those conversations happen on WhatsApp.</p><p>With over 500 million WhatsApp users in India, your customers are already there. The question is: are you selling to them where they are?</p><h2>Why Conversational Commerce Wins</h2><p>Traditional e-commerce has a friction problem. A customer sees your Instagram ad, visits your website, creates an account, enters an OTP, adds to cart, then abandons — because the checkout was too complicated.</p><p>With WhatsApp Commerce, the entire journey lives in one chat window. Customer asks about a product, AI replies instantly, order is placed in the same conversation. The result? <strong>3x higher conversion rates</strong> and dramatically lower cart abandonment.</p><h2>What WhatsApp Business API Unlocks</h2><p>The free WhatsApp Business app has limits. The API — which Hypnate connects you to — unlocks interactive buttons, automated catalog browsing, broadcast campaigns to opted-in customers, and AI-powered responses at scale.</p><h2>Getting Started with Hypnate</h2><p>Connect your WhatsApp Business API number in your Hypnate dashboard, upload your product catalog, and your AI sales agent is live within minutes. It handles product queries, order placement, payment collection, and post-purchase updates — automatically.</p><blockquote>"We went from missing 60% of our DMs to closing 90% of conversations that came in. Hypnate changed everything." — Early Hypnate User</blockquote><h2>The Bottom Line</h2><p>2026 is the year of chat commerce in India. The brands that adapt now will own the next decade. Start with your WhatsApp number, let AI handle the heavy lifting, and watch your sales grow without growing your team.</p>`,
  },
  'ai-customer-support-automation': {
    title: 'Automating Customer Support without Losing the Human Touch',
    author: AUTHORS.farhat,
    date: 'Jan 28, 2026',
    category: 'AI Technology',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
    content: `<p class="lead">The fear with AI is always the same: "Will it make my brand feel robotic?" Done right, the answer is no. Done right, customers don't know they're talking to AI — until you tell them.</p><p>At Hypnate, we've built AI agents that handle over 80% of support queries with a response time under 3 seconds, while maintaining the warmth of a human conversation.</p><h2>Training AI on Your Brand Voice</h2><p>Generic AI sounds generic. Hypnate trains your agent on your actual product catalog, your FAQs, your pricing, and your preferred tone. A kurta seller in Jaipur sounds different from a tech gadget brand in Bangalore — your AI should too.</p><h2>The 80/20 Rule of Support</h2><p>In most D2C businesses, 80% of customer queries are repetitive: "Is this in stock?", "What's the return policy?", "When will it ship?" AI handles all of these instantly, 24/7. The remaining 20% — complaints, complex issues, bulk orders — escalates to your human team with full context.</p><h2>Smart Escalation</h2><p>Hypnate's AI recognizes frustration signals in messages. If a customer says "I'm very upset" or sends repeated messages without a reply, it automatically flags the conversation and notifies a human agent — before the customer has to ask.</p><blockquote>"My team now only handles the conversations that actually need a human. Everything else is taken care of." — Hypnate Customer</blockquote><h2>Conclusion</h2><p>AI in customer support isn't about replacing humans. It's about letting humans do what they're best at: building relationships, solving complex problems, and growing the business.</p>`,
  },
};

// Default fallback article
const DEFAULT_ARTICLE = {
  title: 'Article Not Found',
  author: AUTHORS.hamim,
  date: 'Jan 2026',
  category: 'Commerce',
  readTime: '—',
  image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80',
  content: '<p>This article could not be found. Please go back to the blog and try again.</p>',
};

const RECENT = [
  { slug: 'whatsapp-commerce-guide-2026', title: 'The Complete Guide to WhatsApp Commerce in 2026', date: 'Jan 15, 2026', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&q=80' },
  { slug: 'ai-customer-support-automation', title: 'Automating Customer Support without Losing the Human Touch', date: 'Jan 28, 2026', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&q=80' },
  { slug: 'instagram-dm-sales-strategies', title: '5 Instagram DM Strategies to Close More Sales', date: 'Feb 5, 2026', image: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=200&q=80' },
];

export const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = (slug && ARTICLES[slug]) ? ARTICLES[slug] : DEFAULT_ARTICLE;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post.title, url: window.location.href });
    }
  };

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        .article-body { font-family: 'Lora', Georgia, serif; }
        .article-body p { font-size: clamp(16px, 2vw, 18px); line-height: 1.8; color: #374151; margin: 0 0 20px; }
        .article-body .lead { font-size: clamp(18px, 2.5vw, 21px); color: #1e293b; font-weight: 500; line-height: 1.7; }
        .article-body h2 { font-family: 'Sora', sans-serif; font-size: clamp(20px, 3vw, 26px); font-weight: 800; color: #0f172a; margin: 36px 0 14px; letter-spacing: -0.3px; }
        .article-body ul, .article-body ol { padding-left: 24px; margin: 0 0 20px; }
        .article-body li { font-size: clamp(15px, 2vw, 17px); line-height: 1.75; color: #374151; margin-bottom: 6px; }
        .article-body blockquote { border-left: 4px solid #0d9488; background: #f0fdfa; padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 24px 0; font-style: italic; color: #0f172a; font-size: clamp(15px, 2vw, 17px); }
        .article-body strong { color: #0f172a; font-weight: 700; }
      `}</style>

      {/* Hero Image */}
      <div style={{ height: 'clamp(240px, 40vw, 420px)', width: '100%', position: 'relative' }}>
        <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.2))' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(16px,4vw,48px)', maxWidth: 900, margin: '0 auto' }}>
          <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500, textDecoration: 'none', marginBottom: 16 }}>
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ padding: '4px 12px', borderRadius: 100, background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {post.category}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(20px, 4vw, 40px)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.5px' }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {post.author.initials}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{post.author.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{post.author.role}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              <Calendar size={13} /> {post.date}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              <Clock size={13} /> {post.readTime}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(32px,5vw,64px) clamp(16px,4vw,24px)', display: 'grid', gridTemplateColumns: '1fr', gap: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 40 }} className="lg-grid">
          <style>{`@media(min-width:1024px){ .lg-grid { grid-template-columns: minmax(0,2fr) 340px !important; } }`}</style>

          {/* Article body */}
          <div>
            <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content }} />

            {/* Share */}
            <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Share this article</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { Icon: Facebook, color: '#1877f2', bg: '#eff6ff', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
                  { Icon: Twitter, color: '#0ea5e9', bg: '#f0f9ff', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}` },
                  { Icon: Linkedin, color: '#0a66c2', bg: '#eff6ff', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}` },
                  { Icon: Share2, color: '#64748b', bg: '#f1f5f9', href: '#', onClick: handleShare },
                ].map(({ Icon, color, bg, href, onClick }, i) => (
                  <a key={i} href={href} target={href !== '#' ? '_blank' : undefined} rel="noopener noreferrer" onClick={onClick}
                    style={{ width: 40, height: 40, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'transform 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.1)'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'}>
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* CTA Card */}
            <div style={{ background: '#f0fdfa', padding: 24, borderRadius: 16, border: '1px solid #ccfbf1' }}>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Start selling on WhatsApp today</h3>
              <p style={{ color: '#64748b', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>Join merchants growing their business with Hypnate. Free 14-day trial.</p>
              <Link to="/signup">
                <Button className="w-full">Get Started for Free</Button>
              </Link>
            </div>

            {/* Recent Posts */}
            <div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Recent Articles</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {RECENT.filter(r => r.slug !== slug).slice(0, 3).map((r, i) => (
                  <Link key={i} to={`/blog/${r.slug}`} style={{ display: 'flex', gap: 12, textDecoration: 'none', alignItems: 'flex-start' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={r.image} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.1)'}
                        onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.4, marginBottom: 4 }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.date}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Popular Tags</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['WhatsApp', 'Instagram', 'D2C', 'AI', 'Payments', 'Growth', 'India'].map(tag => (
                  <span key={tag} style={{ padding: '4px 12px', borderRadius: 100, background: '#f1f5f9', color: '#64748b', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};