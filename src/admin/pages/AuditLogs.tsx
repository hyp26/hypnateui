import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Store,
  ShoppingCart,
  CreditCard,
  Settings,
  MoreVertical,
  Eye,
  Calendar,
  Tag
} from 'lucide-react';
import type { AuditLog } from '../types';

// Mock data
const mockAuditLogs: AuditLog[] = [
  {
    id: 1,
    action: 'CREATE',
    entity: 'SELLER',
    entityId: 123,
    userId: 1,
    userEmail: 'admin@hypnate.in',
    oldValue: null,
    newValue: { businessName: 'Rahul Fashion House', plan: 'pro' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: '2024-01-28T14:30:00Z',
  },
  {
    id: 2,
    action: 'UPDATE',
    entity: 'SUBSCRIPTION',
    entityId: 'sub_123456789',
    userId: 123,
    userEmail: 'rahul@fashionhouse.in',
    oldValue: { plan: 'starter' },
    newValue: { plan: 'pro' },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2024-01-28T10:15:00Z',
  },
  {
    id: 3,
    action: 'DELETE',
    entity: 'PRODUCT',
    entityId: 456,
    userId: 123,
    userEmail: 'rahul@fashionhouse.in',
    oldValue: { name: 'Old Product', price: 999 },
    newValue: null,
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    createdAt: '2024-01-27T16:45:00Z',
  },
  {
    id: 4,
    action: 'CREATE',
    entity: 'ORDER',
    entityId: 'ORD-2024-001234',
    userId: 789,
    userEmail: 'customer@example.com',
    oldValue: null,
    newValue: { totalAmount: 2499, items: 3 },
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Android 12; Mobile)',
    createdAt: '2024-01-27T14:20:00Z',
  },
  {
    id: 5,
    action: 'UPDATE',
    entity: 'SETTINGS',
    entityId: 1,
    userId: 1,
    userEmail: 'admin@hypnate.in',
    oldValue: { theme: 'light' },
    newValue: { theme: 'dark' },
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: '2024-01-26T11:00:00Z',
  },
  {
    id: 6,
    action: 'LOGIN',
    entity: 'USER',
    entityId: 123,
    userId: 123,
    userEmail: 'rahul@fashionhouse.in',
    oldValue: null,
    newValue: null,
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2024-01-25T09:30:00Z',
  },
  {
    id: 7,
    action: 'LOGOUT',
    entity: 'USER',
    entityId: 123,
    userId: 123,
    userEmail: 'rahul@fashionhouse.in',
    oldValue: null,
    newValue: null,
    ipAddress: '192.168.1.106',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2024-01-25T18:00:00Z',
  },
];

const actionOptions = ['All', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
const entityOptions = ['All', 'SELLER', 'CUSTOMER', 'ORDER', 'PRODUCT', 'SUBSCRIPTION', 'SETTINGS', 'USER'];

export const AuditLogs: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuditLogs(mockAuditLogs);
      setFilteredLogs(mockAuditLogs);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = [...auditLogs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          (log.userEmail ?? '').toLowerCase().includes(query) ||
          log.entityId.toString().includes(query) ||
          (log.ipAddress ?? '').includes(query)
      );
    }

    if (actionFilter !== 'All') {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    if (entityFilter !== 'All') {
      filtered = filtered.filter((log) => log.entity === entityFilter);
    }

    if (dateRange !== 'All') {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((log) => {
        const logDate = new Date(log.createdAt);
        if (dateRange === '7d') return logDate >= oneWeekAgo;
        if (dateRange === '30d') return logDate >= oneMonthAgo;
        if (dateRange === 'today') {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          return logDate >= today;
        }
        return true;
      });
    }

    setFilteredLogs(filtered);
  }, [auditLogs, searchQuery, actionFilter, entityFilter, dateRange]);

  const getActionBadge = (action: string) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (action) {
      case 'CREATE': return <span className={`${baseClasses} bg-green-100 text-green-600`}>CREATE</span>;
      case 'UPDATE': return <span className={`${baseClasses} bg-blue-100 text-blue-600`}>UPDATE</span>;
      case 'DELETE': return <span className={`${baseClasses} bg-red-100 text-red-600`}>DELETE</span>;
      case 'LOGIN': return <span className={`${baseClasses} bg-purple-100 text-purple-600`}>LOGIN</span>;
      case 'LOGOUT': return <span className={`${baseClasses} bg-gray-100 text-gray-600`}>LOGOUT</span>;
      default: return <span className={baseClasses}>{action}</span>;
    }
  };

  const getEntityIcon = (entity: string) => {
    const icons: Record<string, React.ReactNode> = {
      SELLER: <Store size={16} />,
      CUSTOMER: <User size={16} />,
      ORDER: <ShoppingCart size={16} />,
      PRODUCT: <Tag size={16} />,
      SUBSCRIPTION: <CreditCard size={16} />,
      SETTINGS: <Settings size={16} />,
      USER: <User size={16} />,
    };
    return icons[entity] || null;
  };

  const formatValue = (value: any) => {
    if (!value) return 'N/A';
    if (typeof value === 'object') {
      return JSON.stringify(value).substring(0, 50) + '...';
    }
    return String(value).substring(0, 50);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Audit Logs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track all platform activity and changes</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="admin-btn admin-btn-secondary text-sm">
            <Calendar size={16} /> Export
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Actions</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{auditLogs.length}</div>
        </div>
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Today</div>
          <div className="text-2xl font-bold text-teal-600">
            {auditLogs.filter((log) => {
              const logDate = new Date(log.createdAt);
              const today = new Date();
              return logDate.getDate() === today.getDate() &&
                     logDate.getMonth() === today.getMonth() &&
                     logDate.getFullYear() === today.getFullYear();
            }).length}
          </div>
        </div>
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Creates</div>
          <div className="text-2xl font-bold text-green-600">{auditLogs.filter((log) => log.action === 'CREATE').length}</div>
        </div>
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Updates</div>
          <div className="text-2xl font-bold text-blue-600">{auditLogs.filter((log) => log.action === 'UPDATE').length}</div>
        </div>
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Deletes</div>
          <div className="text-2xl font-bold text-red-600">{auditLogs.filter((log) => log.action === 'DELETE').length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[240px]">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Search size={16} /> Search
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Search by user email, entity ID, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{ width: 140 }}
            >
              {actionOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              style={{ width: 140 }}
            >
              {entityOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ width: 140 }}
            >
              <option value="All">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              className="admin-btn admin-btn-secondary text-sm"
              onClick={() => {
                setActionFilter('All');
                setEntityFilter('All');
                setDateRange('All');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={64} className="mx-auto text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No audit logs found</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Timestamp</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Entity</th>
                    <th className="px-4 py-3 text-left">Entity ID</th>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">IP Address</th>
                    <th className="px-4 py-3 text-left">Changes</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {getEntityIcon(log.entity ?? '')}
                          <span className="text-gray-900 dark:text-gray-100">{log.entity}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{log.entityId}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{log.userEmail}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">ID: {log.userId}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{log.ipAddress}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {log.oldValue ? `From: ${formatValue(log.oldValue)}` : ''}
                          {log.newValue ? ` To: ${formatValue(log.newValue)}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredLogs.length} of {auditLogs.length} logs
              </div>
              <div className="flex gap-2">
                <button className="admin-btn admin-btn-secondary text-sm" disabled>Previous</button>
                <button className="admin-btn admin-btn-secondary text-sm" disabled>Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};