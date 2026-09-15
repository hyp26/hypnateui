import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/Button";
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const PublicHeader = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Blog', path: '/blog' },
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
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-gray-600">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "hover:text-primary-600 transition-colors",
                location.pathname === link.path && "text-primary-600"
              )}
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
            <Link to="/signup">
              <Button size="sm" className="rounded-full px-5">Get Started</Button>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 -mr-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={cn(
        "md:hidden overflow-hidden transition-all duration-300 bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg",
        mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 py-3 space-y-1">
          {navLinks.map(link => (
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
          {!isLogin && (
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full justify-center rounded-xl">Log In</Button>
            </Link>
          )}
          {!isSignup && (
            <Link to="/signup" className="w-full">
              <Button className="w-full justify-center rounded-xl">Get Started</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};