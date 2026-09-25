import React from 'react';
import type { AuditLog } from '../../types';

interface AuditLogStatsProps {
  logs: AuditLog[];
}

const AuditLogStats: React.FC<AuditLogStatsProps> = ({ logs }) => {
  const today = new Date();

  const todayCount = logs.filter((log) => {
    const date = new Date(log.createdAt);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }).length;

  const stats = [
    { label: 'Total Actions', value: logs.length, tone: 'default' },
    { label: 'Today', value: todayCount, tone: 'teal' },
    { label: 'Creates', value: logs.filter((log) => log.action === 'CREATE').length, tone: 'green' },
    { label: 'Updates', value: logs.filter((log) => log.action === 'UPDATE').length, tone: 'blue' },
    { label: 'Deletes', value: logs.filter((log) => log.action === 'DELETE').length, tone: 'red' },
  ];

  return (
    <div className="auditlogs-stats">
      {stats.map((stat) => (
        <div className="auditlogs-stat" key={stat.label}>
          <span className="auditlogs-stat__label">{stat.label}</span>
          <strong className={`auditlogs-stat__value auditlogs-stat__value--${stat.tone}`}>
            {stat.value}
          </strong>
        </div>
      ))}
    </div>
  );
};

export default AuditLogStats;
