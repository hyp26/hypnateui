import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, MessageSquare, Package,
  ShoppingBag, Users, CreditCard, BarChart3,
  Sparkles, Wand2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/dashboard', color: '#0ea5e9' },
    { icon: MessageSquare, label: t('nav.conversations'), path: '/conversations', color: '#ec4899' },
    { icon: Package, label: t('nav.products'), path: '/products', color: '#8b5cf6' },
    { icon: ShoppingBag, label: t('nav.orders'), path: '/orders', color: '#f59e0b' },
    { icon: Users, label: t('nav.customers'), path: '/customers', color: '#10b981' },
    { icon: CreditCard, label: t('nav.payments'), path: '/payments', color: '#06b6d4' },
    { icon: BarChart3, label: t('nav.analytics'), path: '/analytics', color: '#6366f1' },
    { icon: Sparkles, label: t('nav.onboarding'), path: '/onboarding', color: '#f97316' },
  ];

  return (
    <div
      style={{
        width: collapsed ? '72px' : '240px',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        height: '100vh',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0, top: 0,
        zIndex: 50,
        overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight: '72px',
        transition: 'padding 0.25s',
      }}>
        {collapsed ? (
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: '16px', fontWeight: 800 }}>H</span>
          </div>
        ) : (
          <img src="/assets/logo.svg" alt="Hypnate" style={{ height: '36px', objectFit: 'contain' }} />
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '10px',
              marginBottom: '2px',
              textDecoration: 'none',
              fontSize: '13.5px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
              transition: 'all 0.15s',
              position: 'relative',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            })}
            className="sidebar-link"
          >
            {({ isActive }) => (
              <>
                {/* Active indicator */}
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px', height: '60%',
                    borderRadius: '0 3px 3px 0',
                    background: item.color,
                  }} />
                )}
                <item.icon style={{
                  width: 18, height: 18,
                  color: isActive ? item.color : 'rgba(255,255,255,0.4)',
                  flexShrink: 0,
                  transition: 'color 0.15s',
                }} />
                {!collapsed && (
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Hypnate X */}
        <div style={{ paddingTop: '8px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <NavLink
            to="/hypnate-x"
            title={collapsed ? 'Hypnate X' : undefined}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: '10px',
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '13.5px', fontWeight: 600,
              color: isActive ? '#fff' : '#a78bfa',
              background: isActive ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.08)',
              transition: 'all 0.15s',
              position: 'relative',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px', height: '60%',
                    borderRadius: '0 3px 3px 0',
                    background: '#8b5cf6',
                  }} />
                )}
                <Wand2 style={{ width: 18, height: 18, color: '#a78bfa', flexShrink: 0 }} />
                {!collapsed && (
                  <>
                    <span>Hypnate X</span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '9px', fontWeight: 700,
                      padding: '2px 6px', borderRadius: '4px',
                      background: '#7c3aed', color: '#fff',
                      letterSpacing: '0.04em',
                    }}>NEW</span>
                  </>
                )}
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Collapse toggle */}
      <div style={{
        padding: '12px 8px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-end',
            gap: '6px', padding: '8px 12px',
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
            borderRadius: '8px', transition: 'all 0.15s', fontSize: '12px',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {collapsed
            ? <ChevronRight style={{ width: 16, height: 16 }} />
            : <><span>Collapse</span><ChevronLeft style={{ width: 16, height: 16 }} /></>
          }
        </button>
      </div>

      <style>{`
        .sidebar-link:hover {
          background: rgba(255,255,255,0.06) !important;
          color: rgba(255,255,255,0.85) !important;
        }
      `}</style>
    </div>
  );
};