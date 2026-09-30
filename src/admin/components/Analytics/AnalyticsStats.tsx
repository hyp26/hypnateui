import React from 'react';
import { DollarSign, ShoppingCart, Store, Users } from 'lucide-react';
import type { Stats } from '../../types';

const formatNumber = (amount: number) =>
  new Intl.NumberFormat('en-IN').format(amount);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

interface AnalyticsStatsProps {
  stats: Stats | null;
}

const AnalyticsStats: React.FC<AnalyticsStatsProps> = ({ stats }) => {
  const cards = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: stats ? formatCurrency(stats.totalRevenue) : '—',
      change: stats ? stats.revenueGrowth : undefined,
      icon: <DollarSign size={22} />,
      tone: 'teal',
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: stats ? formatNumber(stats.totalOrders) : '—',
      change: undefined,
      icon: <ShoppingCart size={22} />,
      tone: 'blue',
    },
    {
      id: 'sellers',
      title: 'Total Sellers',
      value: stats ? formatNumber(stats.totalSellers) : '—',
      change: undefined,
      icon: <Store size={22} />,
      tone: 'purple',
    },
    {
      id: 'customers',
      title: 'Total Customers',
      value: stats ? formatNumber(stats.totalCustomers) : '—',
      change: undefined,
      icon: <Users size={22} />,
      tone: 'amber',
    },
  ];

  return (
    <div className="analytics-stats">
      {cards.map((stat) => {
        const hasChange = typeof stat.change === 'number' && Number.isFinite(stat.change);
        return (
          <div className="analytics-stat" key={stat.id}>
            <div className="analytics-stat__content">
              <div className="analytics-stat__value">{stat.value}</div>
              <div className="analytics-stat__title">{stat.title}</div>
              {hasChange ? (
                <div className="analytics-stat__change">
                  <span>
                    {(stat.change as number) >= 0 ? '↑' : '↓'} {Math.abs(stat.change as number)}%
                  </span>{' '}
                  from last period
                </div>
              ) : (
                <div className="analytics-stat__change">&nbsp;</div>
              )}
            </div>

            <div className={`analytics-stat__icon analytics-stat__icon--${stat.tone}`}>
              {stat.icon}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsStats;
