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
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/useAuthStore';
import { hasPlanFeature, type PlanFeature } from '../../config/planEntitlements';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { t } = useTranslation();
  const plan = useAuthStore((state) => state.user?.seller?.selectedPlan);

  const navItems: Array<{ icon: React.ElementType; label: string; path: string; feature?: PlanFeature }> = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/dashboard' },
    { icon: MessageSquare, label: t('nav.conversations'), path: '/conversations' },
    { icon: Package, label: t('nav.products'), path: '/products' },
    { icon: ShoppingBag, label: t('nav.orders'), path: '/orders' },
    { icon: Users, label: t('nav.customers'), path: '/customers' },
    { icon: CreditCard, label: t('nav.payments'), path: '/payments' },
    { icon: BarChart3, label: t('nav.analytics'), path: '/analytics', feature: 'advancedAnalytics' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div className={cn(
        "fixed left-0 top-0 h-screen w-64 bg-primary-900 border-r border-primary-800 flex flex-col z-30 shadow-xl transition-transform duration-300",
        // On mobile: slide in/out. On lg+: always visible
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>

        {/* Logo + mobile close button */}
        <div className="p-5 border-b border-primary-800 flex items-center justify-between">
          <img
            src="/assets/hypnate-wordmark-light.png"
            alt="Hypnate Logo"
            className="h-10 w-auto object-contain"
          />
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-primary-300 hover:bg-primary-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const locked = item.feature ? !hasPlanFeature(plan, item.feature) : false;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={locked ? 'Requires Pro or Business' : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-secondary-500 text-white shadow-lg shadow-secondary-900/20 translate-x-1'
                      : locked
                        ? 'text-primary-300 hover:bg-primary-800 hover:text-primary-100'
                        : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                  )
                }
                aria-label={locked ? `${item.label}, requires Pro or Business` : item.label}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.label}
                {locked && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-700 text-primary-200 leading-tight">
                    PRO
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Hypnate X */}
          <div className="pt-3 mt-3 border-t border-primary-800">
            {(() => {
              const locked = !hasPlanFeature(plan, 'hypnateX');
              return (
                <NavLink
                  to="/hypnate-x"
                  onClick={onClose}
                  title={locked ? 'Requires Business plan' : 'Hypnate X'}
                  aria-label={locked ? 'Hypnate X, requires Business plan' : 'Hypnate X'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-violet-600 text-white shadow-lg translate-x-1'
                        : locked
                          ? 'text-violet-400 hover:bg-violet-900/40 hover:text-violet-200'
                          : 'text-violet-300 hover:bg-violet-900/40 hover:text-violet-100'
                    )
                  }
                >
                  <Wand2 className="w-5 h-5 shrink-0" />
                  <span>Hypnate X</span>
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500 text-white leading-tight">
                    {locked ? 'BUSINESS' : 'NEW'}
                  </span>
                </NavLink>
              );
            })()}
          </div>
        </nav>
      </div>
    </>
  );
};