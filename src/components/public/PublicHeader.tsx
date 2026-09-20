import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const PublicHeader = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);

  const isLogin = location.pathname === "/login";
  const isSignup = location.pathname === "/signup";

  // Close on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const menu = mobileMenuRef.current;
    const firstLink = menu?.querySelector('a') as HTMLAnchorElement | null;
    firstLink?.focus();

    const getFocusable = () => Array.from(menu?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) || []);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileMenuOpen(false);
        mobileMenuToggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
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
  ];

  return (
    <header className="w-full bg-white border-b border-gray-100 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/assets/hypnate-logo.png" alt="Hypnate" className="h-8 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-gray-600">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "hover:text-primary-600 transition-colors",
                location.pathname === link.path && "text-primary-600"
              )}
              aria-current={location.pathname === link.path ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {!isLogin && (
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600">
              Log In
            </Link>
          )}
          {!isSignup && (
            <Link to="/signup" className="inline-flex h-8 items-center justify-center rounded-full bg-primary-500 px-5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary-600">
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          ref={mobileMenuToggleRef}
          type="button"
          className="md:hidden p-2 -mr-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="legacy-mobile-menu"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div id="legacy-mobile-menu" ref={mobileMenuRef} role="region" aria-label="Mobile navigation" className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg" hidden={!mobileMenuOpen}>
          <div className="px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => {
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
          {!isLogin && (
            <Link to="/login" className="inline-flex w-full h-10 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">Log In</Link>
          )}
          {!isSignup && (
            <Link to="/signup" className="inline-flex w-full h-10 items-center justify-center rounded-xl bg-primary-500 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-600">Get Started</Link>
          )}
          </div>
        </div>
    </header>
  );
};