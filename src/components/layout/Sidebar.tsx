import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut,
  CreditCard,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { cn } from '../../lib/utils';
import { Logo } from '../ui/Logo';

export const Sidebar = () => {
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/dashboard' },
    { icon: MessageSquare, label: t('nav.conversations'), path: '/conversations' },
    { icon: Package, label: t('nav.products'), path: '/products' },
    { icon: ShoppingBag, label: t('nav.orders'), path: '/orders' },
    { icon: Users, label: t('nav.customers'), path: '/customers' },
    { icon: Settings, label: t('nav.settings'), path: '/settings' },
    // New Items added after Settings
    { icon: CreditCard, label: t('nav.payments'), path: '/payments' },
    { icon: BarChart3, label: t('nav.analytics'), path: '/analytics' },
    { icon: Sparkles, label: t('nav.onboarding'), path: '/onboarding' },
  ];

  return (
    <div className="h-screen w-64 bg-primary-900 border-r border-primary-800 flex flex-col fixed left-0 top-0 z-10 shadow-xl">
      <div className="p-6 border-b border-primary-800">
        {/* Use light theme for logo on dark background */}
        <Logo variant="full" size="md" theme="light" />
      </div>

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
            <item.icon className={cn("w-5 h-5", ({ isActive }: { isActive: boolean }) => isActive ? "text-white" : "text-primary-300")} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-primary-200 hover:bg-red-900/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );
};
