import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, DollarSign, Store, Users } from 'lucide-react';
import type { Stats } from '../../types';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatNumber = (amount: number) =>
  new Intl.NumberFormat('en-IN').format(amount);

interface DashboardStatsProps {
  stats: Stats | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const cards = [
    {
      id: 'sellers',
      title: 'Total Sellers',
      value: stats ? formatNumber(stats.totalSellers) : '—',
      change: undefined as number | undefined,
      icon: Store,
      path: '/admin/sellers',
      tone: 'teal',
    },
    {
      id: 'customers',
      title: 'Total Customers',
      value: stats ? formatNumber(stats.totalCustomers) : '—',
      change: undefined as number | undefined,
      icon: Users,
      path: '/admin/customers',
      tone: 'blue',
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: stats ? formatCurrency(stats.totalRevenue) : '—',
      change: stats ? stats.revenueGrowth : undefined,
      icon: DollarSign,
      path: '/admin/analytics',
      tone: 'purple',
    },
    {
      id: 'subscriptions',
      title: 'Active Subscriptions',
      value: stats ? formatNumber(stats.activeSubscriptions) : '—',
      change: undefined as number | undefined,
      icon: CreditCard,
      path: '/admin/subscriptions',
      tone: 'orange',
    },
  ];

  return (
    <section className="dashboard-stats" aria-label="Platform statistics">
      {cards.map((stat) => {
        const Icon = stat.icon;
        const hasChange = typeof stat.change === 'number' && Number.isFinite(stat.change);
        const positive = hasChange && (stat.change as number) >= 0;

        return (
          <Link key={stat.id} to={stat.path} className="dashboard-stat-card">
            <div className="dashboard-stat-card__content">
              <p className="dashboard-stat-card__label">{stat.title}</p>
              <p className="dashboard-stat-card__value">{stat.value}</p>
              {hasChange ? (
                <p className={`dashboard-stat-card__change ${positive ? 'is-positive' : 'is-negative'}`}>
                  {positive ? '↑' : '↓'} {Math.abs(stat.change as number)}%
                </p>
              ) : (
                <p className="dashboard-stat-card__change">&nbsp;</p>
              )}
            </div>
            <span className={`dashboard-stat-card__icon dashboard-stat-card__icon--${stat.tone}`} aria-hidden="true">
              <Icon size={22} strokeWidth={2} />
            </span>
          </Link>
        );
      })}
    </section>
  );
};
