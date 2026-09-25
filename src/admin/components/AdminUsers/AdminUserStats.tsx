import React from 'react';
import { Shield, Users, Headset, UserCheck } from 'lucide-react';
import type { AdminUserRole } from '../../types';

interface AdminAccount {
  role: AdminUserRole;
}

interface Props {
  accounts: AdminAccount[];
}

export const AdminUserStats: React.FC<Props> = ({ accounts }) => {
  const cards = [
    {
      label: 'Total Accounts',
      value: accounts.length,
      icon: UserCheck,
      className: 'total',
    },
    {
      label: 'Super Admins',
      value: accounts.filter((u) => u.role === 'SUPER_ADMIN').length,
      icon: Shield,
      className: 'super',
    },
    {
      label: 'Admins',
      value: accounts.filter((u) => u.role === 'ADMIN').length,
      icon: Users,
      className: 'admin',
    },
    {
      label: 'Support',
      value: accounts.filter((u) => u.role === 'SUPPORT').length,
      icon: Headset,
      className: 'support',
    },
  ];

  return (
    <div className="adminusers-stats">
      {cards.map(({ label, value, icon: Icon, className }) => (
        <div className={`adminusers-stat-card ${className}`} key={label}>
          <div className="adminusers-stat-icon">
            <Icon size={19} />
          </div>
          <div>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
};
