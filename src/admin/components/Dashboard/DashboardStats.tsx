import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, DollarSign, Store, Users } from 'lucide-react';

const stats = [
  { id: 'sellers', title: 'Total Sellers', value: '1,247', change: 12.5, icon: Store, path: '/admin/sellers', tone: 'teal' },
  { id: 'customers', title: 'Total Customers', value: '24,589', change: 8.2, icon: Users, path: '/admin/customers', tone: 'blue' },
  { id: 'revenue', title: 'Total Revenue', value: '₹12,45,678', change: 15.3, icon: DollarSign, path: '/admin/analytics', tone: 'purple' },
  { id: 'subscriptions', title: 'Active Subscriptions', value: '892', change: -2.1, icon: CreditCard, path: '/admin/subscriptions', tone: 'orange' },
] as const;

export const DashboardStats: React.FC = () => (
  <section className="dashboard-stats" aria-label="Platform statistics">
    {stats.map((stat) => {
      const Icon = stat.icon;
      const positive = stat.change >= 0;

      return (
        <Link key={stat.id} to={stat.path} className="dashboard-stat-card">
          <div className="dashboard-stat-card__content">
            <p className="dashboard-stat-card__label">{stat.title}</p>
            <p className="dashboard-stat-card__value">{stat.value}</p>
            <p className={`dashboard-stat-card__change ${positive ? 'is-positive' : 'is-negative'}`}>
              {positive ? '↑' : '↓'} {Math.abs(stat.change)}%
            </p>
          </div>
          <span className={`dashboard-stat-card__icon dashboard-stat-card__icon--${stat.tone}`} aria-hidden="true">
            <Icon size={22} strokeWidth={2} />
          </span>
        </Link>
      );
    })}
  </section>
);
