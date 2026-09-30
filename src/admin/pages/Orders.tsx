import React, { useEffect, useMemo, useState } from 'react';
import { adminOrdersApi, getApiErrorMessage, type AdminOrder } from '../lib/adminApi';
import OrdersStats from '../components/Orders/OrdersStats';
import OrdersFilters from '../components/Orders/OrdersFilters';
import OrdersTable from '../components/Orders/OrdersTable';
import '../styles/Orders.css';

export interface Order {
  id: string;
  sellerId: string | number;
  customerId: string | number;
  customerName: string;
  totalAmount: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  items: number;
  createdAt: string;
  updatedAt: string;
}

const mapApiOrder = (order: AdminOrder): Order => ({
  id: order.orderNumber || order.id,
  sellerId: order.sellerId,
  customerId: order.customerId,
  customerName:
    order.customer && (order.customer.firstName || order.customer.lastName)
      ? `${order.customer.firstName ?? ''} ${order.customer.lastName ?? ''}`.trim()
      : `Customer #${order.customerId}`,
  totalAmount: order.total,
  status: (order.status || 'pending').toLowerCase() as Order['status'],
  paymentStatus: (order.paymentStatus || 'pending').toLowerCase() as Order['paymentStatus'],
  items: Array.isArray(order.items) ? order.items.length : 0,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const statusOptions = [
  'All',
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Refunded',
];

const paymentOptions = ['All', 'Pending', 'Paid', 'Failed', 'Refunded'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;

    adminOrdersApi
      .list({ limit: 100 })
      .then((response) => {
        if (cancelled) return;
        setOrders(response.data.map(mapApiOrder));
        setIsLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(getApiErrorMessage(error));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.sellerId.toString().includes(query);

      const matchesStatus =
        statusFilter === 'All' ||
        order.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesPayment =
        paymentFilter === 'All' ||
        order.paymentStatus.toLowerCase() === paymentFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = orders.length ? totalRevenue / orders.length : 0;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPaymentFilter('All');
  };

  return (
    <div className="orders-page">
      <header className="orders-page__header">
        <div>
          <h1 className="orders-page__title">Orders</h1>
          <p className="orders-page__subtitle">
            Manage all orders across the platform
          </p>
        </div>
      </header>

      <OrdersStats
        total={orders.length}
        delivered={orders.filter((order) => order.status === 'delivered').length}
        totalRevenue={formatCurrency(totalRevenue)}
        averageOrderValue={formatCurrency(averageOrderValue)}
      />

      {loadError && (
        <div className="orders-page__error" role="alert">
          {loadError}
        </div>
      )}

      <OrdersFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        paymentFilter={paymentFilter}
        statusOptions={statusOptions}
        paymentOptions={paymentOptions}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onPaymentChange={setPaymentFilter}
        onClear={clearFilters}
      />

      <OrdersTable
        orders={filteredOrders}
        isLoading={isLoading}
        formatCurrency={formatCurrency}
      />

      {!isLoading && (
        <footer className="orders-page__footer">
          <span>
            Showing {filteredOrders.length} of {orders.length} orders
          </span>

          <div className="orders-page__pagination">
            <button type="button" className="orders-secondary-button" disabled>
              Previous
            </button>
            <button type="button" className="orders-secondary-button" disabled>
              Next
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Orders;
