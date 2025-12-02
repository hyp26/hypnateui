import { create } from 'zustand';
import { ordersApi } from '../lib/api';

export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderTimeline {
  status: OrderStatus | string;
  timestamp: Date;
  note?: string;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  timeline: OrderTimeline[];
  createdAt: Date;
  trackingNumber?: string;
  shippingAddress?: string;
}

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  getOrder: (id: string) => Order | undefined;
  updateOrderStatus: (
    id: string,
    status: OrderStatus,
    note?: string
  ) => Promise<void>;
  updatePaymentStatus: (
    id: string,
    status: PaymentStatus,
    method?: string
  ) => Promise<void>;
  addTracking: (id: string, trackingNumber: string) => Promise<void>;
}

// ------------------------------------------------------------------
// NORMALIZATION: maps backend → frontend model
// ------------------------------------------------------------------
const normalizeOrder = (raw: any): Order => {
  return {
    id: String(raw.id),
    customerName: raw.customerName,
    customerPhone: raw.customerPhone ?? '',
    customerEmail: raw.customerEmail ?? '',
    shippingAddress: raw.shippingAddress ?? '',
    subtotal: raw.subtotal ?? 0,
    tax: raw.tax ?? 0,
    total: raw.totalAmount ?? 0,
    status: (raw.status ?? 'pending').toLowerCase(),
    paymentStatus: (raw.paymentStatus ?? 'unpaid').toLowerCase(),
    paymentMethod: raw.paymentMethod ?? undefined,
    trackingNumber: raw.trackingNumber ?? undefined,
    createdAt: new Date(raw.createdAt),

    timeline: Array.isArray(raw.timeline)
      ? raw.timeline.map((t: any) => ({
          status: t.status.toLowerCase(),
          timestamp: new Date(t.timestamp),
          note: t.note,
        }))
      : [],

    items: Array.isArray(raw.products)
      ? raw.products.map((p: any) => ({
          id: String(p.id),
          productId: String(p.productId),
          name: p.Product?.name ?? '',
          quantity: p.quantity,
          price: p.priceAtPurchase ?? p.Product?.price ?? 0,
          image: p.Product?.imageUrl ?? '',
        }))
      : [],
  };
};

// ------------------------------------------------------------------
// STORE IMPLEMENTATION
// ------------------------------------------------------------------
export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,
  loading: false,
  error: null,

  // --------------------------------------------------------------
  // FETCH ALL
  // --------------------------------------------------------------
  fetchOrders: async () => {
    try {
      set({ loading: true, error: null });
      const data = await ordersApi.list();

      const normalized = Array.isArray(data)
        ? data.map(normalizeOrder)
        : [];

      set({ orders: normalized, loading: false });
    } catch (err: any) {
      console.error('fetchOrders error:', err);
      set({ loading: false, error: err?.message || 'Failed to load orders' });
    }
  },

  // --------------------------------------------------------------
  // FETCH SINGLE ORDER
  // --------------------------------------------------------------
  fetchOrder: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const data = await ordersApi.get(id);
      if (!data) throw new Error('Order not found');

      const normalized = normalizeOrder(data);

      set((state) => ({
        activeOrder: normalized,
        orders: [
          normalized,
          ...state.orders.filter((o) => o.id !== normalized.id),
        ],
        loading: false,
      }));
    } catch (err: any) {
      console.error('fetchOrder error:', err);
      set({ loading: false, error: err?.message || 'Failed to load order' });
    }
  },

  getOrder: (id: string) => get().orders.find((o) => o.id === id),

  // --------------------------------------------------------------
  // UPDATE STATUS
  // --------------------------------------------------------------
  updateOrderStatus: async (id, status, note) => {
    try {
      const data = await ordersApi.updateStatus(id, status, note);
      const normalized = normalizeOrder(data);

      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? normalized : o)),
        activeOrder: state.activeOrder?.id === id ? normalized : state.activeOrder,
      }));
    } catch (err) {
      console.error('updateOrderStatus error: ', err);
    }
  },

  // --------------------------------------------------------------
  // UPDATE PAYMENT
  // --------------------------------------------------------------
  updatePaymentStatus: async (id, status, method) => {
    try {
      const data = await ordersApi.updatePayment(id, status, method);
      const normalized = normalizeOrder(data);

      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? normalized : o)),
        activeOrder: state.activeOrder?.id === id ? normalized : state.activeOrder,
      }));
    } catch (err) {
      console.error('updatePaymentStatus error: ', err);
    }
  },

  // --------------------------------------------------------------
  // ADD TRACKING
  // --------------------------------------------------------------
  addTracking: async (id, trackingNumber) => {
    try {
      const data = await ordersApi.addTracking(id, trackingNumber);
      const normalized = normalizeOrder(data);

      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? normalized : o)),
        activeOrder: state.activeOrder?.id === id ? normalized : state.activeOrder,
      }));
    } catch (err) {
      console.error('addTracking error: ', err);
    }
  },
}));
