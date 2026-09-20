import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CreditCard,
  Instagram,
  MessageCircle,
  Package,
  Send,
  ShoppingBag,
  Users,
  Globe2,
} from 'lucide-react';
import { HypnateDemoPlayer } from '../../components/public/HypnateDemoPlayer';
import { PUBLIC_CHANNELS, PUBLIC_CHANNEL_SUMMARY } from '../../data/publicChannels';
import { SoftwareApplicationStructuredData } from '../../components/public/StructuredData';
import '../../styles/Home.css';

const channels = [
  {
    label: 'WhatsApp Commerce',
    text: 'Take orders and support customers in chat.',
    icon: MessageCircle,
    tone: 'home-channel-whatsapp',
  },
  {
    label: 'Instagram Commerce',
    text: 'Turn product conversations into sales workflows.',
    icon: Instagram,
    tone: 'home-channel-instagram',
  },
  {
    label: 'Facebook Commerce',
    text: 'Manage supported conversations in one place.',
    icon: Users,
    tone: 'home-channel-facebook',
  },
  {
    label: 'Telegram Commerce',
    text: 'Sell and support customers on Telegram.',
    icon: Send,
    tone: 'home-channel-telegram',
  },
];

const features = [
  {
    icon: MessageCircle,
    title: 'Omnichannel Inbox',
    desc: `Bring supported ${PUBLIC_CHANNEL_SUMMARY} conversations together.`,
  },
  {
    icon: ShoppingBag,
    title: 'Order Management',
    desc: 'Manage structured order records and commerce activity from one dashboard.',
  },
  {
    icon: CreditCard,
    title: 'Payment Links',
    desc: 'Create and share payment links through your commerce workflow.',
  },
  {
    icon: Package,
    title: 'Catalog Management',
    desc: 'Keep products, pricing and inventory organized in one workspace.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    desc: 'See commerce activity and business performance from one dashboard.',
  },
  {
    icon: Bot,
    title: 'AI Catalog Assistance',
    desc: 'Use configured AI catalog extraction to turn supported catalog documents into structured product data.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Connect your channels',
    desc: `Connect supported ${PUBLIC_CHANNEL_SUMMARY} accounts.`,
    icon: MessageCircle,
  },
  {
    step: '02',
    title: 'Add your products',
    desc: 'Upload your catalog and keep product information in one place.',
    icon: Package,
  },
  {
    step: '03',
    title: 'Start selling',
    desc: 'Chat with customers, share products and use supported payment workflows.',
    icon: ShoppingBag,
  },
  {
    step: '04',
    title: 'Grow your business',
    desc: 'Track orders, customers and commerce activity from your dashboard.',
    icon: BarChart3,
  },
];

const earlyStageCards = [
  {
    icon: MessageCircle,
    title: 'Conversations first',
    desc: `Bring supported ${PUBLIC_CHANNEL_SUMMARY} conversations into one workspace.`,
  },
  {
    icon: ShoppingBag,
    title: 'Commerce in one place',
    desc: 'Organize products, orders, payments and customers around the conversations that drive your sales.',
  },
  {
    icon: BarChart3,
    title: 'Ready to learn and improve',
    desc: 'Hypnate is being prepared for broader beta testing, with product improvements shaped by early usage and feedback.',
  },
];

export const Home = () => {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.home-reveal-on-scroll'));
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page overflow-hidden">
      <SoftwareApplicationStructuredData />

      {/* HERO */}
      <section className="home-hero relative overflow-hidden">
        <div className="home-hero-grid" aria-hidden="true" />
        <div className="home-orb home-orb-one" aria-hidden="true" />
        <div className="home-orb home-orb-two" aria-hidden="true" />
        <div className="home-orbit home-orbit-one" aria-hidden="true" />
        <div className="home-orbit home-orbit-two" aria-hidden="true" />

        <div className="home-container home-hero-inner">
          <div className="home-hero-copy">
            <div className="home-eyebrow home-reveal home-delay-1">
              <span className="home-eyebrow-dot" />
              BUILT FOR INDIAN D2C BRANDS
            </div>

            <h1 className="home-hero-title home-reveal home-delay-2">
              Sell smarter.
              <span>Grow faster.</span>
            </h1>

            <p className="home-hero-subtitle home-reveal home-delay-3">
              Turn {PUBLIC_CHANNEL_SUMMARY} conversations into a simpler commerce workflow for products, orders, payments and customers.
            </p>

            <div className="home-hero-actions home-reveal home-delay-4">
              <Link to="/signup" className="home-primary-cta rounded-full px-7 inline-flex items-center justify-center font-semibold">
                Get Started <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
              <Link to="/contact" className="home-secondary-cta rounded-full px-7 inline-flex items-center justify-center font-semibold">
                Book a Demo
              </Link>
            </div>

            <div className="home-hero-checks home-reveal home-delay-5">
              {['Guided setup', 'Works with supported business channels', 'Built for Indian businesses'].map((item) => (
                <div key={item} className="home-check-row">
                  <span className="home-check-icon"><Check className="h-3.5 w-3.5" aria-hidden="true" /></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="home-scribble home-scribble-left" aria-hidden="true">
              More conversations.
              <br />More customers.
              <br />More revenue.
            </div>
          </div>

          <div className="home-hero-visual home-reveal home-delay-3">
            <div className="home-hero-glow" aria-hidden="true" />
            <div className="home-dashboard-wrap">
              <div className="home-floating home-floating-wa home-float-delay-1">
                <div className="home-floating-icon home-floating-green"><MessageCircle className="h-5 w-5" aria-hidden="true" /></div>
                <div>
                  <strong>Example order</strong>
                  <span>₹2,199</span>
                </div>
              </div>
              <div className="home-floating home-floating-ig home-float-delay-2">
                <div className="home-floating-icon home-floating-pink"><Instagram className="h-5 w-5" aria-hidden="true" /></div>
                <div>
                  <strong>Example DM</strong>
                  <span>Product inquiry</span>
                </div>
              </div>
              <div className="home-floating home-floating-fb home-float-delay-3">
                <div className="home-floating-icon home-floating-blue"><Users className="h-5 w-5" aria-hidden="true" /></div>
                <div>
                  <strong>Example message</strong>
                  <span>Can you share the catalog?</span>
                </div>
              </div>
              <div className="home-floating home-floating-tg home-float-delay-4">
                <div className="home-floating-icon home-floating-sky"><Send className="h-5 w-5" aria-hidden="true" /></div>
                <div>
                  <strong>Example Telegram</strong>
                  <span>New conversation</span>
                </div>
              </div>

              <div className="home-dashboard-card">
                <HypnateDemoPlayer />
              </div>
            </div>

            <div className="home-scribble home-scribble-right" aria-hidden="true">
              <ArrowRight className="h-6 w-6 -rotate-12" />
              <span>One platform.<br />Four channels.</span>
            </div>
          </div>
        </div>

        <div className="home-hero-wave" aria-hidden="true" />
      </section>

      {/* CHANNEL STRIP */}
      <section className="home-trust-strip">
        <div className="home-container">
          <p className="home-section-kicker">POWERING CHAT-FIRST COMMERCE</p>
          <h2 className="sr-only">Supported channels</h2>
          <div className="home-channel-grid">
            {channels.map(({ label, text, icon: Icon, tone }) => (
              <div key={label} className="home-channel-card home-reveal-on-scroll">
                <div className={`home-channel-icon ${tone}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3>{label}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-section home-how-section">
        <div className="home-container">
          <div className="home-heading-wrap home-reveal-on-scroll">
            <div className="home-eyebrow home-eyebrow-soft">HOW IT WORKS</div>
            <h2>From conversation to revenue <span>in four simple steps.</span></h2>
            <p>Bring your channels, products and commerce workflows into one operating view.</p>
          </div>

          <div className="home-steps">
            <div className="home-step-line" aria-hidden="true" />
            {steps.map(({ step, title, desc, icon: Icon }, index) => (
              <div key={step} className="home-step-card home-reveal-on-scroll" style={{ animationDelay: `${index * 90}ms` }}>
                <div className="home-step-number" aria-hidden="true">{step}</div>
                <div className="home-step-icon"><Icon className="h-5 w-5" aria-hidden="true" /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE SHOWCASE */}
      <section className="home-section home-feature-section">
        <div className="home-feature-bg" aria-hidden="true" />
        <div className="home-container home-feature-layout">
          <div className="home-feature-copy home-reveal-on-scroll">
            <div className="home-eyebrow home-eyebrow-soft">ONE WORKSPACE</div>
            <h2>Connect. Convert. <span>Grow.</span></h2>
            <p>
              Hypnate brings conversations, orders, payments, products and customers into one place so your team can manage social commerce with less complexity.
            </p>
            <Link to="/features" className="rounded-full px-6 inline-flex items-center justify-center font-semibold bg-primary-500 text-white hover:bg-primary-600">
              Explore Features <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="home-feature-grid">
            {features.map(({ icon: Icon, title, desc }, index) => (
              <div key={title} className="home-feature-card home-reveal-on-scroll" style={{ animationDelay: `${index * 70}ms` }}>
                <div className="home-feature-icon"><Icon className="h-5 w-5" aria-hidden="true" /></div>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EARLY STAGE */}
      <section className="home-section home-feedback-section">
        <div className="home-container">
          <div className="home-heading-wrap home-reveal-on-scroll">
            <div className="home-eyebrow home-eyebrow-soft">EARLY STAGE</div>
            <h2>Built for the way <span>social commerce works.</span></h2>
            <p>Hypnate is being prepared for broader beta testing, with the product shaped around practical commerce workflows.</p>
          </div>

          <div className="home-testimonial-grid">
            {earlyStageCards.map(({ icon: Icon, title, desc }, index) => (
              <article key={title} className="home-testimonial-card home-reveal-on-scroll home-proof-card" style={{ animationDelay: `${index * 90}ms` }}>
                <div className="home-proof-icon"><Icon className="h-5 w-5" aria-hidden="true" /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-section home-cta-section">
        <div className="home-container">
          <div className="home-cta-card home-reveal-on-scroll">
            <div className="home-cta-glow" aria-hidden="true" />
            <div className="home-cta-content">
              <div className="home-eyebrow home-cta-eyebrow">READY TO GROW?</div>
              <h2>Start your Hypnate journey today.</h2>
              <p>Explore a simpler commerce workflow across {PUBLIC_CHANNEL_SUMMARY}.</p>
            </div>
            <div className="home-cta-button-wrap">
              <Link to="/signup" className="home-cta-button rounded-full px-7 inline-flex items-center justify-center font-semibold">
                Get Started <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
              <span>Explore the platform and see how it fits your workflow.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
