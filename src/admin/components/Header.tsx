import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAdminStore } from '../stores/useAdminStore';

export const AdminHeader = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const adminUser = useAdminStore((state) => state.adminUser);
  const notifications = useAdminStore((state) => state.notifications);
  const logout = useAdminStore((state) => state.logout);
  const toggleSidebar = useAdminStore((state) => state.toggleSidebar);
  const markNotificationRead = useAdminStore((state) => state.markNotificationRead);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayName = [adminUser?.firstName, adminUser?.lastName].filter(Boolean).join(' ') || 'Admin';

  return (
    <header className="admin-header">
      <div className="admin-header__inner">
        <div className="admin-header__left">
          <button
            type="button"
            onClick={toggleSidebar}
            className="admin-header__menu"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="admin-search">
            <Search size={17} className="admin-search__icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search admin panel"
            />
          </div>
        </div>

        <div className="admin-header__right">
          <button
            type="button"
            onClick={() => {
              setShowNotifications((value) => !value);
              setShowUserMenu(false);
            }}
            className="admin-header__icon-button"
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="admin-notification-dot">{unreadCount}</span>}
          </button>

          <div className="admin-user">
            <button
              type="button"
              onClick={() => {
                setShowUserMenu((value) => !value);
                setShowNotifications(false);
              }}
              className="admin-user__button"
              aria-expanded={showUserMenu}
            >
              {adminUser?.avatar ? (
                <img src={adminUser.avatar} alt="" className="admin-user__avatar" />
              ) : (
                <span className="admin-user__avatar admin-user__avatar--fallback">
                  <User size={17} />
                </span>
              )}
              <span className="admin-user__details">
                <span className="admin-user__name">{displayName}</span>
                <span className="admin-user__role">{adminUser?.role?.replace('_', ' ') || 'ADMIN'}</span>
              </span>
              <ChevronDown size={16} className="admin-user__chevron" />
            </button>
          </div>
        </div>
      </div>

      {showNotifications && (
        <div className="admin-popover admin-popover--notifications">
          <div className="admin-popover__header">Notifications</div>
          <div className="admin-popover__body">
            {notifications.length === 0 ? (
              <div className="admin-popover__empty">No new notifications</div>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => {
                    markNotificationRead(notification.id);
                    setShowNotifications(false);
                  }}
                  className={`admin-notification-item ${notification.read ? '' : 'is-unread'}`}
                >
                  <span className={`admin-notification-item__dot type-${notification.type.toLowerCase()}`} />
                  <span>
                    <strong>{notification.title}</strong>
                    <small>{notification.message}</small>
                    <small>{new Date(notification.createdAt).toLocaleString()}</small>
                  </span>
                </button>
              ))
            )}
          </div>
          <Link to="/admin/settings" className="admin-popover__footer" onClick={() => setShowNotifications(false)}>
            View notification settings
          </Link>
        </div>
      )}

      {showUserMenu && (
        <div className="admin-popover admin-popover--user">
          <div className="admin-popover__profile">
            <strong>{displayName}</strong>
            <span>{adminUser?.email}</span>
          </div>
          <div className="admin-popover__actions">
            <Link to="/admin/settings" onClick={() => setShowUserMenu(false)}>
              <Settings size={16} /> Settings
            </Link>
            <button type="button" onClick={handleLogout}>
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
