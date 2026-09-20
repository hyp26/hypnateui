import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DemoChatWidget } from '../public/DemoChatWidget';
import {
  BreadcrumbListStructuredData,
  OrganizationStructuredData,
  WebSiteStructuredData,
} from '../public/StructuredData';

export const PublicLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const menu = mobileMenuRef.current;
    const firstLink = menu?.querySelector('a') as HTMLAnchorElement | null;
    firstLink?.focus();

    const getFocusable = () =>
      Array.from(
        menu?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) || []
      );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileMenuOpen(false);
        mobileMenuToggleRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);


  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const breadcrumbLabels: Record<string, string> = {
    '/about': 'About',
    '/pricing': 'Pricing',
    '/features': 'Features',
    '/contact': 'Contact',
    '/careers': 'Careers',
    '/faq': 'FAQ',
    '/terms': 'Terms of Service',
    '/privacy': 'Privacy Policy',
    '/refund': 'Refund Policy',
  };

  const breadcrumbName = breadcrumbLabels[location.pathname];
  const breadcrumbItems = breadcrumbName
    ? [
        { name: 'Home', path: '/' },
        { name: breadcrumbName, path: location.pathname },
      ]
    : [];


  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lg">Skip to main content</a>
      <OrganizationStructuredData />
      <WebSiteStructuredData />
      {breadcrumbItems.length > 0 && (
        <BreadcrumbListStructuredData items={breadcrumbItems} />
      )}

      {/* Navbar */}
      <nav aria-label="Primary navigation" className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled || mobileMenuOpen
          ? "bg-white/95 backdrop-blur-md border-gray-200 shadow-sm"
          : "bg-transparent border-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="relative z-50 shrink-0">
            <img src="/assets/hypnate-logo.png" alt="Hypnate Logo" className="h-10 sm:h-12 w-auto object-contain" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary-600",
                  location.pathname === link.path ? "text-primary-600" : "text-gray-600"
                )}
                aria-current={location.pathname === link.path ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="inline-flex h-8 items-center justify-center rounded-full bg-primary-500 px-5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary-600">Get Started</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={mobileMenuToggleRef}
            type="button"
            className="md:hidden relative z-50 p-2 -mr-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="public-mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu — renders as block/hidden, NOT pointer-events trick */}
        <div id="public-mobile-menu" ref={mobileMenuRef} role="region" aria-label="Mobile navigation" className="md:hidden bg-white border-t border-gray-100 shadow-lg" hidden={!mobileMenuOpen}>
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => {
                    // Keep focus on the visible toggle before the menu is hidden after navigation.
                    mobileMenuToggleRef.current?.focus();
                  }}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-base font-medium transition-colors",
                    location.pathname === link.path
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                  )}
                  aria-current={location.pathname === link.path ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="px-4 pb-5 pt-2 flex flex-col gap-3 border-t border-gray-100">
              <Link to="/login" className="inline-flex w-full h-10 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">Log In</Link>
              <Link to="/signup" className="inline-flex w-full h-10 items-center justify-center rounded-xl bg-primary-500 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-600">Get Started</Link>
            </div>
          </div>
      </nav>

      {/* Main content */}
      <main id="main-content" className="flex-1 pt-16">
        <Outlet />
      </main>

      <DemoChatWidget />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-12">
          <div className="col-span-2 md:col-span-1">
            <img src="/assets/hypnate-logo-light.png" alt="Hypnate Logo" className="h-12 sm:h-14 w-auto max-w-[280px] object-contain object-left" />
            <p className="mt-4 sm:mt-6 text-sm text-gray-400 leading-relaxed">
              Helping Indian businesses manage commerce workflows across WhatsApp, Instagram, Facebook and Telegram with AI-assisted tools.
            </p>
            <div className="flex gap-4 mt-4 sm:mt-6">
              <a href="https://www.instagram.com/hypnate.app/" target="_blank" rel="noopener noreferrer" aria-label="Hypnate on Instagram" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" aria-hidden="true" /></a>
              <a href="https://www.facebook.com/Hypnate" target="_blank" rel="noopener noreferrer" aria-label="Hypnate on Facebook" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" aria-hidden="true" /></a>
              <a href="https://x.com/HypnateIndia" target="_blank" rel="noopener noreferrer" aria-label="Hypnate on X" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" aria-hidden="true" /></a>
              <a href="https://www.linkedin.com/company/hypnate/" target="_blank" rel="noopener noreferrer" aria-label="Hypnate on LinkedIn" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" aria-hidden="true" /></a>
            </div>
          </div>
          <div>
            <h2 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Product</h2>
            <ul className="space-y-3 sm:space-y-4 text-sm">
              <li><Link to="/features" className="hover:text-primary-400 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
              <li><Link to="/faq" className="hover:text-primary-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Company</h2>
            <ul className="space-y-3 sm:space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary-400 transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Legal</h2>
            <ul className="space-y-3 sm:space-y-4 text-sm">
              <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund" className="hover:text-primary-400 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 sm:pt-8 border-t border-gray-800 text-xs sm:text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-2">
          <p>© 2026 Hypnate Solutions Pvt Ltd. All rights reserved.</p>
          <p className="text-gray-500">Made with ❤️ in India</p>
        </div>
      </footer>
    </div>
  );
};