import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../stores/useOrderStore';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Package,
  Printer,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

const API = process.env.REACT_APP_API_URL || '';

export const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    activeOrder: order,
    fetchOrder,
    updateOrderStatus,
    updatePaymentStatus,
    addTracking,
    loading,
  } = useOrderStore();

  const [trackingInput, setTrackingInput] = useState('');
  const [showTrackingInput, setShowTrackingInput] = useState(false);

  useEffect(() => {
    if (id) fetchOrder(id);
  }, [id, fetchOrder]);

  if (loading || !order) {
    return <div className="p-8 text-center">Loading Order...</div>;
  }

  /* ----------------------------------------
   * TRACKING
   * ---------------------------------------- */
  const handleTrackingSubmit = async () => {
    if (!trackingInput.trim()) return;
    await addTracking(order.id, trackingInput.trim());
    setTrackingInput('');
    setShowTrackingInput(false);
  };

  /* ----------------------------------------
   * PRINT INVOICE
   * ---------------------------------------- */
  const handlePrintInvoice = async (orderId: number) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/invoice`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      alert("Failed to generate invoice");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  /* ----------------------------------------
   * STATUS TIMELINE (USES order.status)
   * ---------------------------------------- */
  const steps = [
    { id: 'pending', label: 'Order Placed', icon: Clock },
    { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: Package },
  ];

  const currentStepIndex = steps.findIndex(
    (s) => s.id === order.status
  );

  /* ----------------------------------------
   * UI
   * ---------------------------------------- */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Order #{order.id}
            <span
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                order.status === 'delivered'
                  ? 'bg-green-100 text-green-700'
                  : order.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-primary-100 text-primary-700'
              )}
            >
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </h1>

          <p className="text-sm text-gray-500">
            Placed on{' '}
            {format(new Date(order.createdAt), 'MMMM dd, yyyy @ hh:mm a')}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={() => handlePrintInvoice(Number(order.id))}>
            <Printer className="w-4 h-4 mr-2" /> Invoice
          </Button>

          {order.status === 'pending' && (
            <Button onClick={() => updateOrderStatus(order.id, 'confirmed')}>
              Confirm
            </Button>
          )}

          {order.status === 'confirmed' && (
            <Button onClick={() => setShowTrackingInput(true)}>
              Ship Order
            </Button>
          )}

          {order.status === 'shipped' && (
            <Button onClick={() => updateOrderStatus(order.id, 'delivered')}>
              Mark Delivered
            </Button>
          )}
        </div>
      </div>

      {/* STATUS BAR */}
      <div className="bg-white p-6 rounded-xl border">
        <div className="relative flex justify-between">
          <div className="absolute w-full h-1 bg-gray-100 top-5" />
          <div
            className="absolute h-1 bg-green-500 top-5 transition-all"
            style={{
              width:
                currentStepIndex >= 0
                  ? `${(currentStepIndex / (steps.length - 1)) * 100}%`
                  : '0%',
            }}
          />

          {steps.map((step, idx) => {
            const active = idx <= currentStepIndex;
            return (
              <div key={step.id} className="z-10 text-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2',
                    active
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-200 text-gray-300'
                  )}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <p className="text-xs mt-2">{step.label}</p>
              </div>
            );
          })}
        </div>

        {showTrackingInput && (
          <div className="mt-6 flex gap-2">
            <input
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="Tracking number"
              className="flex-1 border rounded-lg px-4 py-2"
            />
            <Button onClick={handleTrackingSubmit}>Save & Ship</Button>
          </div>
        )}
      </div>

      {/* ITEMS */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {order.items.map((item) => (
          <div key={item.id} className="p-6 flex gap-4 border-b">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover bg-gray-100"
            />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                Qty: {item.quantity}
              </p>
            </div>
            <div className="font-bold">
              {formatCurrency(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* PAYMENT */}
      <div className="bg-white p-6 rounded-xl border">
        <div className="flex justify-between mb-4">
          <span>Status</span>
          <span className="font-medium">
            {order.paymentStatus.toUpperCase()}
          </span>
        </div>

        {order.paymentStatus !== 'paid' &&
          order.status !== 'cancelled' && (
            <Button
              className="w-full"
              onClick={() => updatePaymentStatus(order.id, 'paid')}
            >
              Mark as Paid
            </Button>
          )}
      </div>

      {/* CUSTOMER */}
      <div className="bg-white p-6 rounded-xl border">
        <h3 className="font-bold mb-4">Customer</h3>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {order.customerEmail}
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {order.customerPhone}
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5" />
            {order.shippingAddress}
          </div>
        </div>
      </div>
    </div>
  );
};
