import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  MoreVertical,
  Settings,
  ShoppingCart,
  Store,
  Tag,
  User,
} from 'lucide-react';
import type { AuditLog } from '../../types';

interface AuditLogTableProps {
  logs: AuditLog[];
  filteredLogs: AuditLog[];
  isLoading: boolean;
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  filteredLogs,
  isLoading,
}) => {
  const [expandedId, setExpandedId] = React.useState<number | string | null>(null);

  const getActionBadge = (action: string) => (
    <span className={`auditlogs-action auditlogs-action--${action.toLowerCase()}`}>
      {action}
    </span>
  );

  const getEntityIcon = (entity?: string) => {
    const icons: Record<string, React.ReactNode> = {
      SELLER: <Store size={15} />,
      CUSTOMER: <User size={15} />,
      ORDER: <ShoppingCart size={15} />,
      PRODUCT: <Tag size={15} />,
      SUBSCRIPTION: <CreditCard size={15} />,
      SETTINGS: <Settings size={15} />,
      USER: <User size={15} />,
    };

    return icons[entity ?? ''] ?? <Tag size={15} />;
  };

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (isLoading) {
    return (
      <div className="auditlogs-state">
        <div className="auditlogs-spinner" />
        <span>Loading audit logs...</span>
      </div>
    );
  }

  if (filteredLogs.length === 0) {
    return (
      <div className="auditlogs-state">
        <Clock size={48} />
        <h3>No audit logs found</h3>
        <p>Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="auditlogs-table-wrapper">
        <table className="auditlogs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>User</th>
              <th>IP Address</th>
              <th>Changes</th>
              <th aria-label="Actions" />
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id;

              return (
                <React.Fragment key={log.id}>
                  <tr className={isExpanded ? 'is-expanded' : ''}>
                    <td className="auditlogs-timestamp">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>

                    <td>{getActionBadge(log.action)}</td>

                    <td>
                      <div className="auditlogs-entity">
                        <span className="auditlogs-entity__icon">
                          {getEntityIcon(log.entity)}
                        </span>
                        <span>{log.entity ?? 'Unknown'}</span>
                      </div>
                    </td>

                    <td className="auditlogs-entity-id">
                      {String(log.entityId ?? '—')}
                    </td>

                    <td>
                      <div className="auditlogs-user">
                        <strong>{log.userEmail ?? 'Unknown user'}</strong>
                        <span>ID: {String(log.userId ?? '—')}</span>
                      </div>
                    </td>

                    <td className="auditlogs-ip">{log.ipAddress ?? '—'}</td>

                    <td>
                      <div className="auditlogs-changes">
                        {log.oldValue && (
                          <span>
                            From: {formatValue(log.oldValue).substring(0, 48)}
                            {formatValue(log.oldValue).length > 48 ? '…' : ''}
                          </span>
                        )}
                        {log.newValue && (
                          <span>
                            To: {formatValue(log.newValue).substring(0, 48)}
                            {formatValue(log.newValue).length > 48 ? '…' : ''}
                          </span>
                        )}
                        {!log.oldValue && !log.newValue && <span>—</span>}
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="auditlogs-more"
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} audit log ${log.id}`}
                      >
                        {isExpanded ? <ChevronUp size={17} /> : <MoreVertical size={17} />}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="auditlogs-detail-row">
                      <td colSpan={8}>
                        <div className="auditlogs-detail">
                          <div>
                            <span>Action</span>
                            <strong>{log.action}</strong>
                          </div>
                          <div>
                            <span>Entity ID</span>
                            <strong>{String(log.entityId ?? '—')}</strong>
                          </div>
                          <div>
                            <span>IP Address</span>
                            <strong>{log.ipAddress ?? '—'}</strong>
                          </div>
                          <div>
                            <span>User Agent</span>
                            <strong>{log.userAgent ?? '—'}</strong>
                          </div>
                          <div className="auditlogs-detail__value">
                            <span>Previous Value</span>
                            <pre>{formatValue(log.oldValue)}</pre>
                          </div>
                          <div className="auditlogs-detail__value">
                            <span>New Value</span>
                            <pre>{formatValue(log.newValue)}</pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="auditlogs-table-footer">
        <span>
          Showing {filteredLogs.length} of {logs.length} logs
        </span>
        <div className="auditlogs-pagination">
          <button type="button" disabled>Previous</button>
          <button type="button" disabled>Next</button>
        </div>
      </div>
    </>
  );
};

export default AuditLogTable;
