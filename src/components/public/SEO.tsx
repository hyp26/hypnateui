import React from 'react';
import { useLocation } from 'react-router-dom';
import { PUBLIC_CHANNEL_TITLE_SUMMARY, PUBLIC_CHANNEL_SUMMARY } from '../../data/publicChannels';

const SITE_URL = 'https://hypnate.in';
const SITE_NAME = 'Hypnate';
const DEFAULT_IMAGE = `${SITE_URL}/assets/hypnate-og.png`;
const TWITTER_HANDLE = '@HypnateIndia';

type RobotsDirective = 'index,follow' | 'noindex,nofollow';
type OpenGraphType = 'website' | 'article';

export interface PageSEO {
  title: string;
  description: string;
  path: string;
  robots?: RobotsDirective;
  image?: string;
  imageAlt?: string;
  type?: OpenGraphType;
  publishedTime?: string;
  author?: string;
}

const PUBLIC_SEO: Record<string, Omit<PageSEO, 'path'>> = {
  '/': {
    title: `Hypnate | ${PUBLIC_CHANNEL_TITLE_SUMMARY} Commerce`,
    description: `Manage ${PUBLIC_CHANNEL_SUMMARY} conversations alongside products, orders, payments and customers in one commerce workspace.`,
  },
  '/features': {
    title: 'Commerce Features | Hypnate',
    description: `Explore Hypnate features for ${PUBLIC_CHANNEL_SUMMARY} workflows, products, orders, customers, payment links, analytics and AI-assisted catalog tools.`,
  },
  '/pricing': {
    title: 'Pricing | Hypnate',
    description: `View Hypnate pilot pricing for a commerce workspace covering ${PUBLIC_CHANNEL_SUMMARY} workflows, products, orders, payments and analytics.`,
  },
  '/about': {
    title: 'About Hypnate | Commerce for Conversations',
    description: 'Learn about Hypnate Solutions and our approach to building practical commerce tools for businesses that sell through conversations.',
  },
  '/faq': {
    title: 'Frequently Asked Questions | Hypnate',
    description: 'Find answers about Hypnate setup, supported channels, AI-assisted catalog extraction, pricing, payments, security and account workflows.',
  },
  '/careers': {
    title: 'Careers at Hypnate | Future Opportunities',
    description: 'Learn about future opportunities at Hypnate and share your interest in upcoming roles across product, engineering, marketing and operations.',
  },
  '/contact': {
    title: 'Contact Hypnate | Get in Touch',
    description: 'Contact the Hypnate team about the product, onboarding, partnerships, support questions or other business enquiries.',
  },
  '/terms': {
    title: 'Terms of Service | Hypnate',
    description: 'Read the Hypnate Terms of Service covering use of the platform, accounts, billing, responsibilities and service terms.',
  },
  '/privacy': {
    title: 'Privacy Policy | Hypnate',
    description: 'Read the Hypnate Privacy Policy covering how information is collected, used, protected and handled when you use our services.',
  },
  '/refund': {
    title: 'Refund Policy | Hypnate',
    description: 'Read the Hypnate Refund Policy for applicable billing, cancellation and refund terms.',
  },
};

const BLOG_ARTICLES: Record<string, Omit<PageSEO, 'path'>> = {
  'whatsapp-commerce-guide-2026': {
    title: 'The Complete Guide to WhatsApp Commerce in 2026 | Hypnate',
    description: 'A practical guide to WhatsApp commerce in India, covering conversational selling, customer journeys and the role of structured commerce workflows.',
    type: 'article',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80',
    imageAlt: 'WhatsApp commerce article illustration',
    publishedTime: '2026-01-15T00:00:00+05:30',
    author: 'Hamim Quazi Syed Frahuddin',
  },
  'ai-customer-support-automation': {
    title: 'Automating Customer Support without Losing the Human Touch | Hypnate',
    description: 'Explore practical ways businesses can use AI-assisted support workflows while keeping human oversight for complex customer conversations.',
    type: 'article',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
    imageAlt: 'AI customer support article illustration',
    publishedTime: '2026-01-28T00:00:00+05:30',
    author: 'Syed Md Farhat Ali Nizami',
  },
};

const NOINDEX_ROUTES: Record<string, Omit<PageSEO, 'path'>> = {
  '/login': {
    title: 'Log in | Hypnate',
    description: 'Log in to your Hypnate account.',
    robots: 'noindex,nofollow',
  },
  '/signup': {
    title: 'Create an Account | Hypnate',
    description: 'Create your Hypnate account and get started.',
    robots: 'noindex,nofollow',
  },
  '/verify-email': {
    title: 'Verify Your Email | Hypnate',
    description: 'Verify the email address associated with your Hypnate account.',
    robots: 'noindex,nofollow',
  },
  '/forgot-password': {
    title: 'Reset Your Password | Hypnate',
    description: 'Reset the password for your Hypnate account.',
    robots: 'noindex,nofollow',
  },
  '/onboarding': {
    title: 'Complete Your Hypnate Setup',
    description: 'Complete your Hypnate account and commerce setup.',
    robots: 'noindex,nofollow',
  },
  '/dashboard': {
    title: 'Dashboard | Hypnate',
    description: 'Hypnate merchant dashboard.',
    robots: 'noindex,nofollow',
  },
  '/products': {
    title: 'Products | Hypnate',
    description: 'Manage products in Hypnate.',
    robots: 'noindex,nofollow',
  },
  '/products/new': {
    title: 'Add Product | Hypnate',
    description: 'Add a product in Hypnate.',
    robots: 'noindex,nofollow',
  },
  '/orders': {
    title: 'Orders | Hypnate',
    description: 'Manage orders in Hypnate.',
    robots: 'noindex,nofollow',
  },
  '/orders/:id': {
    title: 'Order | Hypnate',
    description: 'View an order in Hypnate.',
    robots: 'noindex,nofollow',
  },
  '/customers': {
    title: 'Customers | Hypnate',
    description: 'Manage customers in Hypnate.',
    robots: 'noindex,nofollow',
  },
  '/conversations': {
    title: 'Conversations | Hypnate',
    description: 'Manage customer conversations in Hypnate.',
    robots: 'noindex,nofollow',
  },
  '/settings': {
    title: 'Settings | Hypnate',
    description: 'Manage Hypnate settings.',
    robots: 'noindex,nofollow',
  },
  '/payments': {
    title: 'Payments | Hypnate',
    description: 'Manage payments in Hypnate.',
    robots: 'noindex,nofollow',
  },
  '/analytics': {
    title: 'Analytics | Hypnate',
    description: 'View commerce analytics in Hypnate.',
    robots: 'noindex,nofollow',
  },
  '/hypnate-x': {
    title: 'Hypnate X | Hypnate',
    description: 'Manage the Hypnate X website builder.',
    robots: 'noindex,nofollow',
  },
};

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const withoutTrailingSlash = pathname.replace(/\/+$/, '');
  return withoutTrailingSlash || '/';
}

function matchPrivateRoute(pathname: string): Omit<PageSEO, 'path'> | null {
  const normalized = normalizePath(pathname);

  if (NOINDEX_ROUTES[normalized]) return NOINDEX_ROUTES[normalized];
  if (/^\/products\/[^/]+\/edit$/.test(normalized)) return NOINDEX_ROUTES['/products'];
  if (/^\/products\/[^/]+$/.test(normalized)) return { ...NOINDEX_ROUTES['/products'], title: 'Product | Hypnate' };
  if (normalized === '/orders' || /^\/orders\/[^/]+$/.test(normalized)) {
    return /^\/orders\/[^/]+$/.test(normalized) ? NOINDEX_ROUTES['/orders/:id'] : NOINDEX_ROUTES['/orders'];
  }

  return null;
}

export function getPageSEO(pathname: string): PageSEO {
  const normalized = normalizePath(pathname);

  const direct = PUBLIC_SEO[normalized];
  if (direct) {
    return {
      ...direct,
      path: normalized,
      robots: direct.robots || 'index,follow',
    };
  }

  if (normalized.startsWith('/blog/')) {
    const slug = decodeURIComponent(normalized.slice('/blog/'.length));
    const article = BLOG_ARTICLES[slug];
    if (article) {
      return {
        ...article,
        path: `/blog/${encodeURIComponent(slug)}`,
        robots: article.robots || 'index,follow',
      };
    }

    return {
      title: 'Article Not Found | Hypnate',
      description: 'The requested Hypnate article could not be found.',
      path: normalized,
      robots: 'noindex,nofollow',
    };
  }

  const privateRoute = matchPrivateRoute(normalized);
  if (privateRoute) {
    return {
      ...privateRoute,
      path: normalized,
      robots: privateRoute.robots || 'noindex,nofollow',
    };
  }

  return {
    title: 'Hypnate',
    description: 'Hypnate commerce workspace for businesses selling through conversations.',
    path: normalized,
    robots: 'noindex,nofollow',
  };
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string): void {
  if (typeof document === 'undefined') return;

  let element = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string): void {
  if (typeof document === 'undefined') return;

  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function removeMeta(attribute: 'name' | 'property', key: string): void {
  if (typeof document === 'undefined') return;
  document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove();
}

/**
 * Central route-aware SEO component.
 *
 * React 19 hoists title/meta/link elements into <head>. The small effect below
 * also keeps the document head correct in environments where metadata hoisting
 * is unavailable or delayed.
 */
export const RouteSEO: React.FC = () => {
  const location = useLocation();
  const seo = getPageSEO(location.pathname);
  const canonicalUrl = `${SITE_URL}${seo.path === '/' ? '/' : seo.path}`;
  const image = seo.image || DEFAULT_IMAGE;
  const imageAlt = seo.imageAlt || 'Hypnate';
  const type = seo.type || 'website';

  React.useEffect(() => {
    document.title = seo.title;

    upsertMeta('name', 'description', seo.description);
    upsertMeta('name', 'robots', seo.robots || 'index,follow');
    upsertMeta('name', 'googlebot', seo.robots || 'index,follow');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', seo.title);
    upsertMeta('name', 'twitter:description', seo.description);
    upsertMeta('name', 'twitter:image', image);
    upsertMeta('name', 'twitter:image:alt', imageAlt);
    upsertMeta('name', 'twitter:site', TWITTER_HANDLE);

    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', seo.title);
    upsertMeta('property', 'og:description', seo.description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'en_IN');
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:image:alt', imageAlt);

    if (seo.publishedTime) {
      upsertMeta('property', 'article:published_time', seo.publishedTime);
    } else {
      removeMeta('property', 'article:published_time');
    }
    if (seo.author) {
      upsertMeta('property', 'article:author', seo.author);
    } else {
      removeMeta('property', 'article:author');
    }

    upsertLink('canonical', canonicalUrl);
  }, [seo, canonicalUrl, image, imageAlt, type]);

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="robots" content={seo.robots || 'index,follow'} />
      <meta name="googlebot" content={seo.robots || 'index,follow'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={imageAlt} />
      {seo.publishedTime && <meta property="article:published_time" content={seo.publishedTime} />}
      {seo.author && <meta property="article:author" content={seo.author} />}
      <link rel="canonical" href={canonicalUrl} />
    </>
  );
};
