import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import OrdersStats from '../components/Orders/OrdersStats';
import OrdersFilters from '../components/Orders/OrdersFilters';
import OrdersTable from '../components/Orders/OrdersTable';
import '../styles/Orders.css';

export interface Order {
  id: string;
  sellerId: number;
  customerId: number;
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

const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001234',
    sellerId: 1,
    customerId: 1,
    customerName: 'Rahul Sharma',
    totalAmount: 2499,
    status: 'delivered',
    paymentStatus: 'paid',
    items: 3,
    createdAt: '2024-01-25T14:30:00Z',
    updatedAt: '2024-01-28T10:15:00Z',
  },
  {
    id: 'ORD-2024-001235',
    sellerId: 2,
    customerId: 2,
    customerName: 'Priya Patel',
    totalAmount: 4599,
    status: 'shipped',
    paymentStatus: 'paid',
    items: 5,
    createdAt: '2024-01-28T10:15:00Z',
    updatedAt: '2024-01-28T14:20:00Z',
  },
  {
    id: 'ORD-2024-001236',
    sellerId: 3,
    customerId: 3,
    customerName: 'Amit Kumar',
    totalAmount: 1299,
    status: 'processing',
    paymentStatus: 'paid',
    items: 2,
    createdAt: '2024-01-27T09:30:00Z',
    updatedAt: '2024-01-27T11:45:00Z',
  },
  {
    id: 'ORD-2024-001237',
    sellerId: 1,
    customerId: 4,
    customerName: 'Sneha Singh',
    totalAmount: 3499,
    status: 'confirmed',
    paymentStatus: 'pending',
    items: 4,
    createdAt: '2024-01-26T16:45:00Z',
    updatedAt: '2024-01-26T18:00:00Z',
  },
  {
    id: 'ORD-2024-001238',
    sellerId: 2,
    customerId: 5,
    customerName: 'Vikram Rathod',
    totalAmount: 5699,
    status: 'cancelled',
    paymentStatus: 'refunded',
    items: 6,
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-01-25T12:30:00Z',
  },
];

const statusOptions = [
  'All',
  'Pending',
  'Confirmed',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 300);

    return () => window.clearTimeout(timer);
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
