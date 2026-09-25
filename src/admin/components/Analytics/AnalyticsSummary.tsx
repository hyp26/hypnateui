import React from 'react';
import { CreditCard, ShoppingCart, Store, Truck } from 'lucide-react';

interface AnalyticsSummaryProps {
  formatCurrency: (amount: number) => string;
}

const sellers = [
  { name: 'Priya Boutique', revenue: 3456789, orders: 2156 },
  { name: 'Rahul Fashion House', revenue: 1245678, orders: 892 },
  { name: 'Furniture World', revenue: 890123, orders: 345 },
];

const activities = [
  { action: 'New order', entity: '#ORD-2024-001239', time: '2 min ago', type: 'order' },
  { action: 'Payment received', entity: '₹2,499', time: '15 min ago', type: 'payment' },
  { action: 'Seller registered', entity: 'New Boutique', time: '1 hour ago', type: 'seller' },
  { action: 'Order shipped', entity: '#ORD-2024-001238', time: '3 hours ago', type: 'shipping' },
];

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ formatCurrency }) => {
  const icons: Record<string, React.ReactNode> = {
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
          {sellers.map((seller, index) => (
            <div className="analytics-summary__row" key={seller.name}>
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
          {activities.map((activity) => (
            <div className="analytics-summary__row" key={`${activity.action}-${activity.entity}`}>
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
