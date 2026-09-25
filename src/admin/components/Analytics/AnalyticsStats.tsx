import React from 'react';
import { DollarSign, ShoppingCart, Store, Users } from 'lucide-react';

const stats = [
  { id: 'revenue', title: 'Total Revenue', value: '₹12,45,678', change: 15.3, icon: <DollarSign size={22} />, tone: 'teal' },
  { id: 'orders', title: 'Total Orders', value: '2,456', change: 12.5, icon: <ShoppingCart size={22} />, tone: 'blue' },
  { id: 'sellers', title: 'Total Sellers', value: '1,247', change: 8.2, icon: <Store size={22} />, tone: 'purple' },
  { id: 'customers', title: 'Total Customers', value: '24,589', change: 18.7, icon: <Users size={22} />, tone: 'amber' },
];

const AnalyticsStats: React.FC = () => (
  <div className="analytics-stats">
    {stats.map((stat) => (
      <div className="analytics-stat" key={stat.id}>
        <div className="analytics-stat__content">
          <div className="analytics-stat__value">{stat.value}</div>
          <div className="analytics-stat__title">{stat.title}</div>
          <div className="analytics-stat__change">
            <span>↑ {stat.change}%</span> from last period
          </div>
        </div>

        <div className={`analytics-stat__icon analytics-stat__icon--${stat.tone}`}>
          {stat.icon}
        </div>
      </div>
    ))}
  </div>
);

export default AnalyticsStats;
