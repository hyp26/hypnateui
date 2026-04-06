import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  BarChart3,
  Wand2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar = () => {
  const { t } = useTranslation();

  const navItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/dashboard' },
    { icon: MessageSquare, label: t('nav.conversations'), path: '/conversations' },
    { icon: Package, label: t('nav.products'), path: '/products' },
    { icon: ShoppingBag, label: t('nav.orders'), path: '/orders' },
    { icon: Users, label: t('nav.customers'), path: '/customers' },
    { icon: CreditCard, label: t('nav.payments'), path: '/payments' },
    { icon: BarChart3, label: t('nav.analytics'), path: '/analytics' },
  ];

  return (
    <div className="h-screen w-64 bg-primary-900 border-r border-primary-800 flex flex-col fixed left-0 top-0 z-10 shadow-xl">

      {/* ── Logo ── */}
      <div className="p-6 border-b border-primary-800 flex justify-center">
        <img
          src="/assets/logo.svg"
          alt="Hypnate Logo"
          className="h-55 w-150 object-contain"
        />
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-secondary-500 text-white shadow-lg shadow-secondary-900/20 translate-x-1'
                  : 'text-primary-100 hover:bg-primary-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}

        {/* ── Hypnate X — special item ── */}
        <div className="pt-3 mt-3 border-t border-primary-800">
          <NavLink
            to="/hypnate-x"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-violet-600 text-white shadow-lg translate-x-1'
                  : 'text-violet-300 hover:bg-violet-900/40 hover:text-violet-100'
              )
            }
          >
            <Wand2 className="w-5 h-5 shrink-0" />
            <span>Hypnate X</span>
            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500 text-white leading-tight">
              NEW
            </span>
          </NavLink>
        </div>
      </nav>

    </div>
  );
};