import React, { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { adminAuditLogsApi, getApiErrorMessage, type AdminAuditLog } from '../lib/adminApi';
import type { AuditLog } from '../types';
import AuditLogStats from '../components/AuditLogs/AuditLogStats';
import AuditLogFilters from '../components/AuditLogs/AuditLogFilters';
import AuditLogTable from '../components/AuditLogs/AuditLogTable';
import '../styles/AuditLogs.css';

// Maps a backend audit log row onto the frontend AuditLog shape.
const mapApiLog = (log: AdminAuditLog): AuditLog => ({
  id: log.id,
  adminUserId: log.adminUserId,
  action: (log.action || 'UPDATE') as AuditLog['action'],
  entityType: log.entityType,
  entity: log.entityType,
  entityId: log.entityId ?? '',
  userId: log.adminUserId,
  userEmail: log.adminUser?.email,
  oldValue: log.oldValue ?? null,
  newValue: log.newValue ?? null,
  ipAddress: log.ipAddress,
  userAgent: log.userAgent,
  createdAt: log.createdAt,
});

const actionOptions = ['All', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SETTINGS'];
const entityOptions = [
  'All',
  'SELLER',
  'CUSTOMER',
  'ORDER',
  'PRODUCT',
  'SUBSCRIPTION',
  'TICKET',
  'ANNOUNCEMENT',
  'FAQ',
  'SETTINGS',
  'USER',
];

export const AuditLogs: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All');

  useEffect(() => {
    let cancelled = false;

    adminAuditLogsApi
      .list({ limit: 100 })
      .then((response) => {
        if (cancelled) return;
        setAuditLogs(response.data.map(mapApiLog));
        setIsLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(getApiErrorMessage(error));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
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

      {loadError && (
        <div className="auditlogs-card auditlogs-card--filters">
          <span role="alert">{loadError}</span>
        </div>
      )}

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
