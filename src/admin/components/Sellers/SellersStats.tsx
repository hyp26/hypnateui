import React from 'react';

interface SellersStatsProps {
  total: number;
  active: number;
  trialing: number;
  revenue: string;
}

const SellersStats: React.FC<SellersStatsProps> = ({ total, active, trialing, revenue }) => (
  <section className="sellers-stats" aria-label="Seller statistics">
    <div className="sellers-stat-card">
      <span className="sellers-stat-card__label">Total Sellers</span>
      <strong className="sellers-stat-card__value">{total}</strong>
    </div>
    <div className="sellers-stat-card">
      <span className="sellers-stat-card__label">Active</span>
      <strong className="sellers-stat-card__value sellers-stat-card__value--green">{active}</strong>
    </div>
    <div className="sellers-stat-card">
      <span className="sellers-stat-card__label">Trialing</span>
      <strong className="sellers-stat-card__value sellers-stat-card__value--amber">{trialing}</strong>
    </div>
    <div className="sellers-stat-card">
      <span className="sellers-stat-card__label">Total Revenue</span>
      <strong className="sellers-stat-card__value sellers-stat-card__value--revenue">{revenue}</strong>
    </div>
  </section>
);

export default SellersStats;
