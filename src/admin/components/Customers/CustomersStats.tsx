import React from 'react';

interface CustomersStatsProps {
  total: number;
  active: number;
  orders: number;
  spent: string;
}

const CustomersStats: React.FC<CustomersStatsProps> = ({ total, active, orders, spent }) => (
  <section className="customers-stats" aria-label="Customer statistics">
    <div className="customers-stat-card">
      <span className="customers-stat-card__label">Total Customers</span>
      <strong className="customers-stat-card__value">{total}</strong>
    </div>
    <div className="customers-stat-card">
      <span className="customers-stat-card__label">Active</span>
      <strong className="customers-stat-card__value customers-stat-card__value--green">{active}</strong>
    </div>
    <div className="customers-stat-card">
      <span className="customers-stat-card__label">Total Orders</span>
      <strong className="customers-stat-card__value">{orders}</strong>
    </div>
    <div className="customers-stat-card">
      <span className="customers-stat-card__label">Total Spent</span>
      <strong className="customers-stat-card__value customers-stat-card__value--revenue">{spent}</strong>
    </div>
  </section>
);

export default CustomersStats;
