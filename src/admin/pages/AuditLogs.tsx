import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Download, Search } from 'lucide-react';
import type { AuditLog } from '../types';
import AuditLogStats from '../components/AuditLogs/AuditLogStats';
import AuditLogFilters from '../components/AuditLogs/AuditLogFilters';
import AuditLogTable from '../components/AuditLogs/AuditLogTable';
import '../styles/AuditLogs.css';

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
const entityOptions = [
  'All',
  'SELLER',
  'CUSTOMER',
  'ORDER',
  'PRODUCT',
  'SUBSCRIPTION',
  'SETTINGS',
  'USER',
];

export const AuditLogs: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAuditLogs(mockAuditLogs);
      setIsLoading(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredLogs = useMemo(() => {
    let filtered = [...auditLogs];

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((log) => {
        const userEmail = log.userEmail ?? '';
        const entityId = String(log.entityId ?? '');
        const ipAddress = log.ipAddress ?? '';

        return (
          userEmail.toLowerCase().includes(query) ||
          entityId.toLowerCase().includes(query) ||
          ipAddress.toLowerCase().includes(query)
        );
      });
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

    return filtered;
  }, [auditLogs, searchQuery, actionFilter, entityFilter, dateRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setActionFilter('All');
    setEntityFilter('All');
    setDateRange('All');
  };

  const exportLogs = () => {
    const rows = filteredLogs.map((log) => ({
      timestamp: new Date(log.createdAt).toISOString(),
      action: log.action,
      entity: log.entity ?? '',
      entityId: log.entityId ?? '',
      userEmail: log.userEmail ?? '',
      userId: log.userId ?? '',
      ipAddress: log.ipAddress ?? '',
    }));

    const header = Object.keys(rows[0] ?? {
      timestamp: '',
      action: '',
      entity: '',
      entityId: '',
      userEmail: '',
      userId: '',
      ipAddress: '',
    });

    const csv = [
      header.join(','),
      ...rows.map((row) =>
        header
          .map((key) => `"${String(row[key as keyof typeof row]).replace(/"/g, '""')}"`)
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'hypnate-audit-logs.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="auditlogs-page">
      <header className="auditlogs-page__header">
        <div>
          <h1 className="auditlogs-page__title">Audit Logs</h1>
          <p className="auditlogs-page__subtitle">
            Track all platform activity and changes
          </p>
        </div>

        <button type="button" className="auditlogs-export-button" onClick={exportLogs}>
          <Download size={16} />
          Export
        </button>
      </header>

      <AuditLogStats logs={auditLogs} />

      <section className="auditlogs-card auditlogs-card--filters">
        <AuditLogFilters
          searchQuery={searchQuery}
          actionFilter={actionFilter}
          entityFilter={entityFilter}
          dateRange={dateRange}
          actionOptions={actionOptions}
          entityOptions={entityOptions}
          onSearchChange={setSearchQuery}
          onActionChange={setActionFilter}
          onEntityChange={setEntityFilter}
          onDateRangeChange={setDateRange}
          onClear={clearFilters}
        />
      </section>

      <section className="auditlogs-card auditlogs-card--table">
        <AuditLogTable
          logs={auditLogs}
          filteredLogs={filteredLogs}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
};

export default AuditLogs;
