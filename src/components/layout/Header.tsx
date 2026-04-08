import React, { Fragment, useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell, Search, Globe, User, Settings, LogOut,
  ShoppingBag, Users, Package, X, ArrowRight,
  CheckCheck, Trash2, ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Transition, Menu as HeadlessMenu } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import api from '../../lib/api';

// ── Types ──────────────────────────────────────────────────────────────────
interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

interface SearchResult {
  orders: { id: number; customerName: string; totalAmount: number; status: string; createdAt: string }[];
  customers: { id: number; name: string; email?: string; phone?: string; totalOrders: number }[];
  products: { id: number; name: string; price: number; stock: number; imageUrl?: string; category?: string }[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const notifIcon = (type: string) => {
  if (type.startsWith('ORDER')) return <ShoppingBag size={14} />;
  if (type.startsWith('CUSTOMER')) return <Users size={14} />;
  if (type.startsWith('STOCK') || type.startsWith('PAYMENT')) return <Package size={14} />;
  return <Bell size={14} />;
};

const notifColor = (type: string) => {
  if (type.startsWith('ORDER')) return { bg: '#eff6ff', color: '#1d4ed8' };
  if (type.startsWith('PAYMENT')) return { bg: '#f0fdf4', color: '#166534' };
  if (type.startsWith('STOCK')) return { bg: '#fff7ed', color: '#c2410c' };
  if (type.startsWith('CUSTOMER')) return { bg: '#fdf4ff', color: '#7e22ce' };
  return { bg: '#f1f5f9', color: '#475569' };
};

// ── Component ──────────────────────────────────────────────────────────────
export const Header = () => {
  const { i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // ── Notifications state ──
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Search state ──
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch notifications ────────────────────────────────────────────────
  const fetchNotifs = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/notifications');
      setNotifs(res.data.notifications);
      setUnread(res.data.unreadCount);
    } catch { /* silent fail */ }
  }, []);

  // Poll every 15s
  useEffect(() => {
    fetchNotifs();
    pollRef.current = setInterval(() => fetchNotifs(true), 15000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchNotifs]);

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Mark one read ──────────────────────────────────────────────────────
  const markRead = async (id: number) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
    try {
      await api.patch(`/api/notifications/${id}/read`);
    } catch { await fetchNotifs(true); }
  };

  // ── Mark all read ──────────────────────────────────────────────────────
  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
    try {
      await api.patch('/api/notifications/read-all');
    } catch { await fetchNotifs(true); }
  };

  // ── Delete notification ────────────────────────────────────────────────
  const deleteNotif = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifs(prev => prev.filter(n => n.id !== id));
    try {
      await api.delete(`/api/notifications/${id}`);
    } catch { await fetchNotifs(true); }
  };

  // ── Global search with debounce ────────────────────────────────────────
  const handleSearch = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim() || val.trim().length < 2) {
      setResults(null);
      setSearchOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await api.get('/api/search', { params: { q: val.trim() } });
        setResults(res.data);
        setSearchOpen(true);
      } catch { /* silent */ } finally {
        setSearching(false);
      }
    }, 350);
  };

  const hasResults = results && (
    results.orders.length + results.customers.length + results.products.length > 0
  );

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');

  const navigateTo = (path: string) => {
    setSearchOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <>
      <style>{headerCss}</style>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-20 shadow-sm">

        {/* ── Search ── */}
        <div className="flex items-center gap-4 flex-1" ref={searchRef}>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => { if (hasResults) setSearchOpen(true); }}
              placeholder="Search orders, customers, or products..."
              className="w-full pl-10 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full spin-anim" />
            )}
            {query && !searching && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => { setQuery(''); setResults(null); setSearchOpen(false); }}
              >
                <X size={13} />
              </button>
            )}

            {/* Search results dropdown */}
            {searchOpen && results && (
              <div className="search-dropdown">
                {!hasResults ? (
                  <div className="search-empty">No results for "{query}"</div>
                ) : (
                  <>
                    {/* Orders */}
                    {results.orders.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-label"><ShoppingBag size={11} /> Orders</div>
                        {results.orders.map(o => (
                          <button key={o.id} className="search-item" onClick={() => navigateTo(`/orders/${o.id}`)}>
                            <div className="search-item-main">
                              <span className="search-item-title">#{o.id} — {o.customerName}</span>
                              <span className={`search-status status-${o.status.toLowerCase()}`}>{o.status}</span>
                            </div>
                            <span className="search-item-sub">₹{o.totalAmount.toLocaleString()}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Customers */}
                    {results.customers.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-label"><Users size={11} /> Customers</div>
                        {results.customers.map(c => (
                          <button key={c.id} className="search-item" onClick={() => navigateTo(`/customers`)}>
                            <div className="search-item-main">
                              <span className="search-item-title">{c.name}</span>
                              <span className="search-item-badge">{c.totalOrders} orders</span>
                            </div>
                            <span className="search-item-sub">{c.email || c.phone || '—'}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Products */}
                    {results.products.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-label"><Package size={11} /> Products</div>
                        {results.products.map(p => (
                          <button key={p.id} className="search-item" onClick={() => navigateTo(`/products`)}>
                            <div className="search-item-main">
                              <span className="search-item-title">{p.name}</span>
                              <span className={`search-item-badge ${p.stock < 5 ? 'badge-warn' : ''}`}>
                                {p.stock < 5 ? `⚠ ${p.stock} left` : `${p.stock} in stock`}
                              </span>
                            </div>
                            <span className="search-item-sub">₹{p.price.toLocaleString()} · {p.category || 'General'}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="search-footer">
                      <button onClick={() => navigateTo(`/orders`)} className="search-footer-link">
                        See all results <ArrowRight size={11} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">

          {/* ── Language Toggle ── */}
          <button
            onClick={toggleLang}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase text-xs">{i18n.language}</span>
          </button>

          {/* ── Notifications ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(o => !o)}
              className={cn(
                'p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative outline-none',
                notifOpen && 'bg-gray-100 text-primary-600'
              )}
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
              )}
            </button>

            {/* Notification panel */}
            {notifOpen && (
              <div className="notif-panel">
                <div className="notif-header">
                  <div>
                    <h3 className="notif-title">Notifications</h3>
                    {unread > 0 && <span className="notif-unread-count">{unread} unread</span>}
                  </div>
                  {unread > 0 && (
                    <button onClick={markAllRead} className="notif-mark-all">
                      <CheckCheck size={13} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="notif-list">
                  {notifs.length === 0 ? (
                    <div className="notif-empty">
                      <Bell size={32} strokeWidth={1.5} />
                      <p>You're all caught up!</p>
                    </div>
                  ) : (
                    notifs.map(n => {
                      const { bg, color } = notifColor(n.type);
                      return (
                        <div
                          key={n.id}
                          className={cn('notif-item', !n.isRead && 'notif-item-unread')}
                          onClick={() => {
                            if (!n.isRead) markRead(n.id);
                            if (n.link) { navigateTo(n.link); setNotifOpen(false); }
                          }}
                        >
                          <div className="notif-icon-wrap" style={{ background: bg, color }}>
                            {notifIcon(n.type)}
                          </div>
                          <div className="notif-body">
                            <div className="notif-item-title">{n.title}</div>
                            <div className="notif-item-body">{n.body}</div>
                            <div className="notif-time">{fmtTime(n.createdAt)}</div>
                          </div>
                          <div className="notif-actions">
                            {!n.isRead && (
                              <div className="notif-dot" title="Unread" />
                            )}
                            <button
                              className="notif-delete"
                              onClick={e => deleteNotif(n.id, e)}
                              title="Dismiss"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="notif-footer">
                  <Link to="/settings" onClick={() => setNotifOpen(false)} className="notif-footer-link">
                    Notification settings <ExternalLink size={11} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── Profile Dropdown ── */}
          <HeadlessMenu as="div" className="relative">
            <HeadlessMenu.Button className="flex items-center gap-2 outline-none p-1 pr-3 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm border border-primary-200">
                {user?.name?.charAt(0) || 'M'}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[100px] truncate">
                {user?.name || 'Merchant'}
              </span>
            </HeadlessMenu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <HeadlessMenu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-lg border border-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 divide-y divide-gray-100">
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <Link to="/settings" className={cn('flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors', active ? 'bg-primary-50 text-primary-700' : 'text-gray-700')}>
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                    )}
                  </HeadlessMenu.Item>
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <Link to="/settings" className={cn('flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors', active ? 'bg-primary-50 text-primary-700' : 'text-gray-700')}>
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                    )}
                  </HeadlessMenu.Item>
                </div>
                <div className="p-1">
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <button onClick={handleLogout} className={cn('flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors', active ? 'bg-red-50 text-red-700' : 'text-red-600')}>
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    )}
                  </HeadlessMenu.Item>
                </div>
              </HeadlessMenu.Items>
            </Transition>
          </HeadlessMenu>
        </div>
      </header>
    </>
  );
};

// ── Scoped CSS ─────────────────────────────────────────────────────────────
const headerCss = `
@keyframes spin { to { transform: rotate(360deg); } }
.spin-anim { animation: spin 0.7s linear infinite; }

/* ── Search dropdown ── */
.search-dropdown {
  position: absolute; top: calc(100% + 8px); left: 0;
  width: 420px; background: #fff;
  border: 1.5px solid #e2e8f0; border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.12);
  z-index: 100; overflow: hidden;
  animation: dropIn 0.15s ease;
}
@keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }

.search-empty { padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; }
.search-section { border-bottom: 1px solid #f1f5f9; }
.search-section:last-of-type { border-bottom: none; }
.search-section-label {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 14px 4px; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.6px; color: #94a3b8;
}
.search-item {
  display: block; width: 100%; text-align: left;
  padding: 9px 14px; border: none; background: none; cursor: pointer;
  transition: background 0.1s;
}
.search-item:hover { background: #f8fafc; }
.search-item-main { display: flex; align-items: center; gap: 8px; margin-bottom: 1px; }
.search-item-title { font-size: 13px; font-weight: 600; color: #1e293b; }
.search-item-sub { font-size: 11px; color: #94a3b8; }
.search-item-badge {
  font-size: 10px; font-weight: 600; padding: 1px 7px;
  border-radius: 100px; background: #f1f5f9; color: #64748b;
}
.badge-warn { background: #fff7ed !important; color: #c2410c !important; }
.search-status {
  font-size: 10px; font-weight: 700; padding: 1px 8px;
  border-radius: 100px; text-transform: capitalize;
}
.status-pending { background: #fff7ed; color: #c2410c; }
.status-confirmed, .status-delivered { background: #f0fdf4; color: #166534; }
.status-cancelled { background: #fef2f2; color: #991b1b; }
.search-footer {
  padding: 10px 14px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end;
}
.search-footer-link {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 600; color: #0d9488;
  background: none; border: none; cursor: pointer;
}

/* ── Notification badge ── */
.notif-badge {
  position: absolute; top: 4px; right: 4px;
  min-width: 16px; height: 16px;
  background: #f97316; color: #fff;
  font-size: 9px; font-weight: 800;
  border-radius: 100px; border: 2px solid #fff;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px; line-height: 1;
}

/* ── Notification panel ── */
.notif-panel {
  position: absolute; right: 0; top: calc(100% + 10px);
  width: 360px; background: #fff;
  border: 1.5px solid #e2e8f0; border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.12); z-index: 100;
  overflow: hidden;
  animation: dropIn 0.15s ease;
}
.notif-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #f1f5f9;
}
.notif-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }
.notif-unread-count { font-size: 11px; color: #94a3b8; }
.notif-mark-all {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600; color: #0d9488;
  background: none; border: none; cursor: pointer; padding: 4px 8px;
  border-radius: 6px; transition: background 0.15s;
}
.notif-mark-all:hover { background: #f0fdfa; }

.notif-list { max-height: 360px; overflow-y: auto; }
.notif-list::-webkit-scrollbar { width: 3px; }
.notif-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

.notif-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 40px 20px;
  color: #cbd5e1; font-size: 13px;
}

.notif-item {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 16px; cursor: pointer;
  border-bottom: 1px solid #f8fafc; transition: background 0.1s;
  position: relative;
}
.notif-item:hover { background: #f8fafc; }
.notif-item:hover .notif-delete { opacity: 1; }
.notif-item-unread { background: #f0fdfa; }

.notif-icon-wrap {
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.notif-body { flex: 1; min-width: 0; }
.notif-item-title { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
.notif-item-body { font-size: 12px; color: #64748b; line-height: 1.4; margin-bottom: 4px; }
.notif-time { font-size: 10px; color: #94a3b8; }

.notif-actions { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
.notif-dot { width: 7px; height: 7px; border-radius: 50%; background: #0d9488; }
.notif-delete {
  background: none; border: none; cursor: pointer;
  color: #cbd5e1; padding: 2px; border-radius: 4px;
  opacity: 0; transition: opacity 0.15s, color 0.15s;
}
.notif-delete:hover { color: #ef4444; }

.notif-footer {
  padding: 10px 16px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: center;
}
.notif-footer-link {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: #94a3b8; text-decoration: none;
  transition: color 0.15s;
}
.notif-footer-link:hover { color: #0d9488; }
`;