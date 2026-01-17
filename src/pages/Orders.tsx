import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore, OrderStatus } from '../stores/useOrderStore';
import { Search, ChevronRight, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

const API = process.env.REACT_APP_API_URL || '';

export const Orders = () => {
  const { orders, fetchOrders, loading, error } = useOrderStore();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ----------------------------------------
   * EXPORT ORDERS
   * ---------------------------------------- */
  const handleExportOrders = () => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token');

    if (!token) {
      alert('You must be logged in to export orders.');
      return;
    }

    window.open(
      `${API}/api/orders/export/all?token=${token}`,
      '_blank'
    );
  };

  /* ----------------------------------------
   * FILTERED ORDERS
   * ---------------------------------------- */
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === 'all' || order.status === filterStatus;

    const q = searchQuery.toLowerCase();

    const matchesSearch =
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  /* ----------------------------------------
   * STATUS BADGE
   * ---------------------------------------- */
  const getStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      payment_pending: 'bg-orange-100 text-orange-700',
      paid: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-indigo-100 text-indigo-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };

    const labels: Record<OrderStatus, string> = {
      pending: 'Pending',
      payment_pending: 'Payment Pending',
      paid: 'Paid',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };

    return (
      <span
        className={cn(
          'px-2.5 py-0.5 rounded-full text-xs font-medium',
          styles[status]
        )}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

        <Button onClick={handleExportOrders}>
          Export Orders
        </Button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {[
            'all',
            'pending',
            'payment_pending',
            'paid',
            'confirmed',
            'shipped',
            'delivered',
            'cancelled',
          ].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap',
                filterStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  Loading orders...
                </td>
              </tr>
            )}

            {error && !loading && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-red-500">
                  Failed to load orders: {error}
                </td>
              </tr>
            )}

            {!loading && !error && filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <td className="px-6 py-4 font-medium text-primary-600">
                    {order.id}
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-xs text-gray-400">
                      {order.items.length} items
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        order.paymentStatus === 'paid'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-orange-50 text-orange-700'
                      )}
                    >
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>

                  <td className="px-6 py-4 font-bold">
                    {formatCurrency(order.total)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                  </td>
                </tr>
              ))
            ) : (
              !loading &&
              !error && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">No orders found</p>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
