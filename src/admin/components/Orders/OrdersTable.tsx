import React from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
  ShoppingCart,
  Truck,
  XCircle,
} from 'lucide-react';
import type { Order } from '../../pages/Orders';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
}

const getStatusBadge = (status: Order['status']) => {
  const labels: Record<Order['status'], string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };

  const icons: Partial<Record<Order['status'], React.ReactNode>> = {
    delivered: <CheckCircle size={11} />,
    shipped: <Truck size={11} />,
    processing: <Clock size={11} />,
    cancelled: <XCircle size={11} />,
    refunded: <AlertCircle size={11} />,
  };

  return (
    <span className={`orders-badge orders-badge--${status}`}>
      {icons[status]}
      {labels[status]}
    </span>
  );
};

const getPaymentBadge = (status: Order['paymentStatus']) => {
  const labels: Record<Order['paymentStatus'], string> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
  };

  return (
    <span className={`orders-payment-badge orders-payment-badge--${status}`}>
      {labels[status]}
    </span>
  );
};

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  isLoading,
  formatCurrency,
}) => {
  if (isLoading) {
    return (
      <section className="orders-table-card">
        <div className="orders-empty-state">
          <div className="orders-spinner" />
          <span>Loading orders...</span>
        </div>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="orders-table-card">
        <div className="orders-empty-state">
          <ShoppingCart size={48} />
          <h3>No orders found</h3>
          <p>Try adjusting your filters.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="orders-table-card">
      <div className="orders-table-scroll">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Seller ID</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Ordered</th>
              <th className="orders-table__actions" aria-label="Actions" />
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <span className="orders-table__id">{order.id}</span>
                </td>

                <td>
                  <div className="orders-table__customer">
                    {order.customerName}
                  </div>
                  <div className="orders-table__secondary">
                    ID: {order.customerId}
                  </div>
                </td>

                <td>
                  <span className="orders-table__number">{order.sellerId}</span>
                </td>

                <td>
                  <span className="orders-table__number">{order.items}</span>
                </td>

                <td>
                  <span className="orders-table__amount">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </td>

                <td>{getStatusBadge(order.status)}</td>

                <td>{getPaymentBadge(order.paymentStatus)}</td>

                <td className="orders-table__date">
                  {new Date(order.createdAt).toLocaleDateString('en-GB')}
                </td>

                <td className="orders-table__actions">
                  <button
                    type="button"
                    className="orders-icon-button"
                    aria-label={`Actions for ${order.id}`}
                  >
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default OrdersTable;
