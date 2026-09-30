import React from 'react';
import { CreditCard, ShoppingCart, Store, Truck } from 'lucide-react';

export interface TopSeller {
  name: string;
  revenue: number;
  orders: number;
}

export type SummaryActivityType = 'order' | 'payment' | 'seller' | 'shipping';

export interface SummaryActivity {
  id: string | number;
  action: string;
  entity: string;
  time: string;
  type: SummaryActivityType;
}

interface AnalyticsSummaryProps {
  formatCurrency: (amount: number) => string;
  topSellers: TopSeller[];
  activities: SummaryActivity[];
}

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  formatCurrency,
  topSellers,
  activities,
}) => {
  const icons: Record<SummaryActivityType, React.ReactNode> = {
    order: <ShoppingCart size={16} />,
    payment: <CreditCard size={16} />,
    seller: <Store size={16} />,
    shipping: <Truck size={16} />,
  };

  return (
    <div className="analytics-grid analytics-grid--two analytics-summary">
      <section className="analytics-card">
        <div className="analytics-card__header">
          <h2>Top Performing Sellers</h2>
        </div>

        <div className="analytics-summary__list">
          {topSellers.length === 0 && (
            <div className="analytics-summary__row">
              <div className="analytics-summary__identity">
                <strong>No seller data yet</strong>
                <span>Revenue leaders will appear here.</span>
              </div>
            </div>
          )}
          {topSellers.map((seller, index) => (
            <div className="analytics-summary__row" key={`${seller.name}-${index}`}>
              <div className="analytics-summary__rank">{index + 1}</div>

              <div className="analytics-summary__identity">
                <strong>{seller.name}</strong>
                <span>{seller.orders} orders</span>
              </div>

              <strong className="analytics-summary__revenue">
                {formatCurrency(seller.revenue)}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section className="analytics-card">
        <div className="analytics-card__header">
          <h2>Recent Activity</h2>
        </div>

        <div className="analytics-summary__list">
          {activities.length === 0 && (
            <div className="analytics-summary__row">
              <div className="analytics-summary__identity">
                <strong>No recent activity</strong>
                <span>Platform activity will appear here.</span>
              </div>
            </div>
          )}
          {activities.map((activity) => (
            <div className="analytics-summary__row" key={activity.id}>
              <div className={`analytics-activity-icon analytics-activity-icon--${activity.type}`}>
                {icons[activity.type]}
              </div>

              <div className="analytics-summary__identity">
                <strong>{activity.action}</strong>
                <span>{activity.entity}</span>
              </div>

              <span className="analytics-summary__time">{activity.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsSummary;
