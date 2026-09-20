import { create } from 'zustand';
import { ordersApi } from '../lib/api';

/* ----------------------------------------------------
 * TYPES
 * ---------------------------------------------------- */
export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'paid'
  | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: string;

  items: OrderItem[];

  subtotal: number;
  tax: number;
  total: number;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;

  timeline: OrderTimeline[];
  trackingNumber?: string;

  createdAt: Date;
}

/* ----------------------------------------------------
 * SAFE CAST HELPERS
 * ---------------------------------------------------- */
const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'payment_pending',
  'paid',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  'unpaid',
  'pending',
  'paid',
  'refunded',
];

const castOrderStatus = (value: any): OrderStatus =>
  ORDER_STATUSES.includes(value) ? value : 'pending';

const castPaymentStatus = (value: any): PaymentStatus =>
  PAYMENT_STATUSES.includes(value) ? value : 'unpaid';

/* ----------------------------------------------------
 * NORMALIZATION (Backend → Frontend)
 * ---------------------------------------------------- */
const normalizeOrder = (raw: any): Order => {
  return {
    id: String(raw.id),

    customerName: raw.customerName ?? '',
    customerPhone: raw.customerPhone ?? '',
    customerEmail: raw.customerEmail ?? '',
    shippingAddress: raw.shippingAddress ?? '',

    subtotal: Number(raw.subtotal ?? 0),
    tax: Number(raw.tax ?? 0),
    total: Number(raw.totalAmount ?? raw.total ?? 0),

    status: castOrderStatus(
      String(raw.status ?? 'pending').toLowerCase()
    ),

    paymentStatus: castPaymentStatus(
      String(raw.paymentStatus ?? 'unpaid').toLowerCase()
    ),

    paymentMethod: raw.paymentMethod ?? undefined,
    trackingNumber: raw.trackingNumber ?? undefined,

    createdAt: new Date(raw.createdAt),

    timeline: Array.isArray(raw.timeline)
      ? raw.timeline.map((t: any) => ({
          status: castOrderStatus(
            String(t.status ?? 'pending').toLowerCase()
          ),
          timestamp: new Date(t.timestamp),
          note: t.note,
        }))
      : [],

    items: Array.isArray(raw.products)
      ? raw.products.map((p: any) => ({
          id: String(p.id),
          productId: String(p.productId),
          name: p.Product?.name ?? '',
          quantity: Number(p.quantity ?? 0),
          price: Number(
            p.priceAtPurchase ??
              p.Product?.price ??
              0
          ),
          image: p.Product?.imageUrl ?? '',
        }))
      : [],
  };
};

/* ----------------------------------------------------
 * STORE
 * ---------------------------------------------------- */
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

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,
  loading: false,
  error: null,

  /* ---------------- FETCH ALL ---------------- */
  fetchOrders: async () => {
    try {
      set({ loading: true, error: null });
      const data = await ordersApi.list();
      const normalized = Array.isArray(data)
        ? data.map(normalizeOrder)
        : [];
      set({ orders: normalized, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || 'Failed to load orders',
      });
    }
  },

  /* ---------------- FETCH ONE ---------------- */
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
          ...state.orders.filter((o) => o.id !== id),
        ],
        loading: false,
      }));
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || 'Failed to load order',
      });
    }
  },

  getOrder: (id) => get().orders.find((o) => o.id === id),

  /* ---------------- UPDATE STATUS ---------------- */
  updateOrderStatus: async (id, status, note) => {
    try {
      const data = await ordersApi.updateStatus(id, status, note);
      const normalized = normalizeOrder(data);

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? normalized : o
        ),
        activeOrder:
          state.activeOrder?.id === id
            ? normalized
            : state.activeOrder,
        error: null,
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to update order status' });
    }
  },

  /* ---------------- UPDATE PAYMENT ---------------- */
  updatePaymentStatus: async (id, status, method) => {
    try {
      const data = await ordersApi.updatePayment(id, status, method);
      const normalized = normalizeOrder(data);

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? normalized : o
        ),
        activeOrder:
          state.activeOrder?.id === id
            ? normalized
            : state.activeOrder,
        error: null,
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to update payment status' });
    }
  },

  /* ---------------- ADD TRACKING ---------------- */
  addTracking: async (id, trackingNumber) => {
    try {
      const data = await ordersApi.addTracking(id, trackingNumber);
      const normalized = normalizeOrder(data);

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? normalized : o
        ),
        activeOrder:
          state.activeOrder?.id === id
            ? normalized
            : state.activeOrder,
        error: null,
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to add tracking number' });
    }
  },
}));
