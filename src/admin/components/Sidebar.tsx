import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  ShoppingCart,
  FileText,
  MessageSquare,
  HelpCircle,
  Megaphone,
  BarChart3,
  Settings,
  ClipboardList,
  ShieldCheck,
  Home,
  X,
} from 'lucide-react';
import { useAdminStore } from '../stores/useAdminStore';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Sellers', href: '/admin/sellers', icon: Users },
  { label: 'Customers', href: '/admin/customers', icon: UserCheck },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Content', href: '/admin/content', icon: FileText },
  { label: 'Tickets', href: '/admin/tickets', icon: MessageSquare, badge: 5 },
  { label: 'FAQ', href: '/admin/faq', icon: HelpCircle },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const sidebarCollapsed = useAdminStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAdminStore((state) => state.toggleSidebar);
  const adminUser = useAdminStore((state) => state.adminUser);
  const hasPermission = useAdminStore((state) => state.hasPermission);

  const canManageAdminUsers = Boolean(adminUser && hasPermission('VIEW_ADMIN_USERS'));

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <>
      {!sidebarCollapsed && (
        <button
          type="button"
          className="admin-sidebar-backdrop md:hidden"
          onClick={toggleSidebar}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`admin-sidebar ${sidebarCollapsed ? 'admin-sidebar--collapsed' : ''}`}
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar__brand">
          <Link to="/admin/dashboard" className="admin-sidebar__logo-link" onClick={() => {
            if (window.innerWidth < 768) toggleSidebar();
          }}>
            <img
              src="/assets/hypnate-logo.png"
              alt="Hypnate"
              className="admin-sidebar__logo"
            />
          </Link>

          <button
            type="button"
            onClick={toggleSidebar}
            className="admin-icon-button md:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          <div className="admin-sidebar__nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`admin-nav-item ${active ? 'is-active' : ''}`}
                >
                  <Icon className="admin-nav-item__icon" size={19} strokeWidth={1.9} />
                  <span className="admin-nav-item__label">{item.label}</span>
                  {item.badge && <span className="admin-nav-item__badge">{item.badge}</span>}
                </Link>
              );
            })}

            {canManageAdminUsers && (
              <Link
                to="/admin/admin-users"
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={`admin-nav-item ${isActive('/admin/admin-users') ? 'is-active' : ''}`}
              >
                <ShieldCheck className="admin-nav-item__icon" size={19} strokeWidth={1.9} />
                <span className="admin-nav-item__label">Admin Users</span>
              </Link>
            )}
          </div>

          <div className="admin-sidebar__footer">
            <Link to="/" className="admin-nav-item admin-nav-item--secondary">
              <Home className="admin-nav-item__icon" size={19} strokeWidth={1.9} />
              <span className="admin-nav-item__label">Go to Main Site</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
};
