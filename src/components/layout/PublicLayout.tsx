import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DemoChatWidget } from '../public/DemoChatWidget';

export const PublicLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Blog', path: '/blog' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">

      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled || mobileMenuOpen
          ? "bg-white/95 backdrop-blur-md border-gray-200 shadow-sm"
          : "bg-transparent border-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="relative z-50 shrink-0">
            <img src="/assets/logo.svg" alt="Hypnate Logo" className="h-10 sm:h-12 w-auto object-contain" />
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
            <Link to="/signup">
              <Button size="sm" className="rounded-full px-5">Get Started</Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative z-50 p-2 -mr-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu — renders as block/hidden, NOT pointer-events trick */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-base font-medium transition-colors",
                    location.pathname === link.path
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="px-4 pb-5 pt-2 flex flex-col gap-3 border-t border-gray-100">
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full justify-center rounded-xl">Log In</Button>
              </Link>
              <Link to="/signup" className="w-full">
                <Button className="w-full justify-center rounded-xl">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <DemoChatWidget />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-12">
          <div className="col-span-2 md:col-span-1">
            <img src="/assets/logo.svg" alt="Hypnate Logo" className="h-20 sm:h-28 w-auto object-contain" />
            <p className="mt-4 sm:mt-6 text-sm text-gray-400 leading-relaxed">
              Empowering Indian SMBs with AI-driven social commerce tools. Sell smarter on WhatsApp, Instagram, and Facebook.
            </p>
            <div className="flex gap-4 mt-4 sm:mt-6">
              <a href="https://www.instagram.com/hypnate.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="https://www.facebook.com/Hypnate" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="https://x.com/HypnateIndia" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="https://www.linkedin.com/company/hypnate/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Product</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm">
              <li><Link to="/features" className="hover:text-primary-400 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
              <li><Link to="/faq" className="hover:text-primary-400 transition-colors">FAQ</Link></li>
              <li><Link to="/changelog" className="hover:text-primary-400 transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Company</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary-400 transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="hover:text-primary-400 transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Legal</h4>
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