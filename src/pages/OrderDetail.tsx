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
  Send,
  Printer,
  CheckCircle2,
  Truck
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

// IMPORTANT: Same API base as your useProductStore
const API = process.env.REACT_APP_API_URL || "";

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

  // Load order from backend
  useEffect(() => {
    if (id) fetchOrder(id);
  }, [id]);

  if (loading || !order) {
    return <div className="p-8 text-center">Loading Order...</div>;
  }

  const handleTrackingSubmit = async () => {
    if (trackingInput.trim()) {
      await addTracking(order.id, trackingInput);
      setShowTrackingInput(false);
      setTrackingInput('');
    }
  };

  // PRINT INVOICE HANDLER
  const handlePrintInvoice = () => {
    // Opens new tab and downloads PDF
    window.open(
      `${API}/api/orders/${order.id}/invoice`,
      "_blank"
    );
  };

  // Timeline steps
  const steps = [
    { id: 'pending', label: 'Order Placed', icon: Clock },
    { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: Package },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === order.status);

  const computedStepIndex =
    currentStepIndex !== -1
      ? currentStepIndex
      : order.status === 'paid' || order.status === 'payment_pending'
      ? 0
      : 4;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Order #{order.id}
            <span
              className={cn(
                'text-sm px-3 py-1 rounded-full font-medium',
                order.status === 'delivered'
                  ? 'bg-green-100 text-green-700'
                  : order.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-primary-100 text-primary-700'
              )}
            >
              {order.status.toUpperCase().replace('_', ' ')}
            </span>
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Placed on {format(order.createdAt, 'MMMM dd, yyyy @ hh:mm a')}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="ml-auto flex gap-3">

          {/* PRINT INVOICE (NEW HANDLER) */}
          <Button variant="outline" onClick={handlePrintInvoice}>
            <Printer className="w-4 h-4 mr-2" /> Print Invoice
          </Button>

          {order.status === 'pending' && (
            <Button onClick={() => updateOrderStatus(order.id, 'confirmed')}>
              Confirm Order
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

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STATUS TRACK BAR */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Order Status</h3>

            <div className="relative flex justify-between items-center">

              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10" />

              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 transition-all duration-500 -z-10"
                style={{
                  width: `${(Math.max(0, computedStepIndex) / (steps.length - 1)) * 100}%`,
                }}
              />

              {steps.map((step, idx) => {
                const completed = idx <= computedStepIndex;

                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                        completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white border-gray-200 text-gray-300'
                      )}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        completed ? 'text-gray-900' : 'text-gray-400'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* TRACKING INPUT */}
            {showTrackingInput && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Tracking Details
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="e.g. BD123456789"
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <Button onClick={handleTrackingSubmit}>Save & Ship</Button>
                </div>
              </div>
            )}
          </div>

          {/* ORDER ITEMS */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Items</h3>
            </div>

            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-6 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (GST)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* CUSTOMER DETAILS */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Customer</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                  {order.customerName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {order.customerEmail}
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {order.customerPhone}
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  {order.shippingAddress}
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT DETAILS */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Payment</h3>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-medium',
                  order.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                )}
              >
                {order.paymentStatus.toUpperCase()}
              </span>
            </div>

            {order.paymentStatus !== 'paid' && (
              <div className="space-y-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => updatePaymentStatus(order.id, 'paid')}
                >
                  Mark as Paid
                </Button>

                <Button className="w-full flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Send Payment Link
                </Button>
              </div>
            )}

            {order.paymentStatus === 'paid' && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                Payment secured via {order.paymentMethod || 'UPI'}
              </div>
            )}
          </div>

          {/* TIMELINE */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Timeline</h3>
            <div className="relative space-y-6 pl-4 border-l-2 border-gray-100">
              {order.timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-300 border-2 border-white ring-1 ring-gray-100" />
                  <p className="text-sm font-medium text-gray-900">{event.note}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(event.timestamp), 'MMM dd, hh:mm a')}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
