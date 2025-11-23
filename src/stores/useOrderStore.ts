import { create } from 'zustand';

export type OrderStatus = 'pending' | 'payment_pending' | 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
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
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'upi' | 'card' | 'cod';
  timeline: OrderTimeline[];
  createdAt: Date;
  trackingNumber?: string;
  shippingAddress: string;
}

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  fetchOrders: () => Promise<void>;
  getOrder: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;
  addTracking: (id: string, trackingNumber: string) => void;
}

// Mock Data Generator
const generateMockOrders = (): Order[] => {
  return [
    {
      id: 'ORD-2024-1001',
      customerId: 'CUST-001',
      customerName: 'Rahul Sharma',
      customerPhone: '+91 98765 43210',
      customerEmail: 'rahul.s@example.com',
      items: [
        { id: 'oi1', productId: '1', name: 'Cotton Kurta (Blue)', quantity: 1, price: 1299, image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=150&q=80' }
      ],
      subtotal: 1299,
      tax: 0,
      total: 1299,
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'upi',
      shippingAddress: '123, Green Park, New Delhi - 110016',
      timeline: [
        { status: 'pending', timestamp: new Date(Date.now() - 86400000 * 3), note: 'Order placed' },
        { status: 'confirmed', timestamp: new Date(Date.now() - 86400000 * 2.9), note: 'Order confirmed' },
        { status: 'shipped', timestamp: new Date(Date.now() - 86400000 * 2), note: 'Shipped via Bluedart' },
        { status: 'delivered', timestamp: new Date(Date.now() - 86400000 * 1), note: 'Delivered to customer' },
      ],
      createdAt: new Date(Date.now() - 86400000 * 3),
      trackingNumber: 'BD123456789'
    },
    {
      id: 'ORD-2024-1002',
      customerId: 'CUST-002',
      customerName: 'Priya Singh',
      customerPhone: '+91 98123 45678',
      customerEmail: 'priya.singh@example.com',
      items: [
        { id: 'oi2', productId: '2', name: 'Handmade Soap (Lavender)', quantity: 2, price: 250, image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=150&q=80' }
      ],
      subtotal: 500,
      tax: 50,
      total: 550,
      status: 'payment_pending',
      paymentStatus: 'pending',
      shippingAddress: 'Flat 402, Palm Heights, Mumbai - 400050',
      timeline: [
        { status: 'pending', timestamp: new Date(Date.now() - 3600000), note: 'Order placed' },
        { status: 'payment_pending', timestamp: new Date(Date.now() - 3500000), note: 'Payment link sent' },
      ],
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'ORD-2024-1003',
      customerId: 'CUST-003',
      customerName: 'Vikram Malhotra',
      customerPhone: '+91 99988 77766',
      customerEmail: 'vikram.m@example.com',
      items: [
        { id: 'oi3', productId: '3', name: 'Ceramic Vase', quantity: 1, price: 899, image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=150&q=80' }
      ],
      subtotal: 899,
      tax: 90,
      total: 989,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      shippingAddress: 'Sector 45, Gurgaon - 122003',
      timeline: [
        { status: 'pending', timestamp: new Date(Date.now() - 7200000), note: 'Order placed' },
        { status: 'paid', timestamp: new Date(Date.now() - 7100000), note: 'Payment received' },
        { status: 'confirmed', timestamp: new Date(Date.now() - 7000000), note: 'Order confirmed' },
      ],
      createdAt: new Date(Date.now() - 7200000),
    }
  ];
};

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: generateMockOrders(),
  activeOrder: null,
  fetchOrders: async () => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  getOrder: (id) => {
    return get().orders.find(o => o.id === id);
  },
  updateOrderStatus: (id, status, note) => set((state) => ({
    orders: state.orders.map(order => {
      if (order.id === id) {
        return {
          ...order,
          status,
          timeline: [
            { status, timestamp: new Date(), note: note || `Status updated to ${status}` },
            ...order.timeline
          ]
        };
      }
      return order;
    })
  })),
  updatePaymentStatus: (id, status) => set((state) => ({
    orders: state.orders.map(order => {
      if (order.id === id) {
        const newTimelineStatus = status === 'paid' ? 'paid' : order.status;
        return {
          ...order,
          paymentStatus: status,
          status: newTimelineStatus as OrderStatus, // Auto update order status if paid
          timeline: status === 'paid' 
            ? [{ status: 'paid', timestamp: new Date(), note: 'Payment Received' }, ...order.timeline]
            : order.timeline
        };
      }
      return order;
    })
  })),
  addTracking: (id, trackingNumber) => set((state) => ({
    orders: state.orders.map(order => {
      if (order.id === id) {
        return {
          ...order,
          trackingNumber,
          status: 'shipped',
          timeline: [
            { status: 'shipped', timestamp: new Date(), note: `Shipped. Tracking: ${trackingNumber}` },
            ...order.timeline
          ]
        };
      }
      return order;
    })
  }))
}));
