import React from 'react';

interface OrdersStatsProps {
  total: number;
  delivered: number;
  totalRevenue: string;
  averageOrderValue: string;
}

const OrdersStats: React.FC<OrdersStatsProps> = ({
  total,
  delivered,
  totalRevenue,
  averageOrderValue,
}) => (
  <section className="orders-stats" aria-label="Order statistics">
    <div className="orders-stat-card">
      <span className="orders-stat-card__label">Total Orders</span>
      <strong className="orders-stat-card__value">{total}</strong>
    </div>

    <div className="orders-stat-card">
      <span className="orders-stat-card__label">Delivered</span>
      <strong className="orders-stat-card__value orders-stat-card__value--green">
        {delivered}
      </strong>
    </div>

    <div className="orders-stat-card">
      <span className="orders-stat-card__label">Total Revenue</span>
      <strong className="orders-stat-card__value">{totalRevenue}</strong>
    </div>

    <div className="orders-stat-card">
      <span className="orders-stat-card__label">Avg. Order Value</span>
      <strong className="orders-stat-card__value">{averageOrderValue}</strong>
    </div>
  </section>
);

export default OrdersStats;
