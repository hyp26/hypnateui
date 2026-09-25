import type { ReactNode } from 'react';
export type AdminUserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'BLOCKED' | 'TRIALING';
export type PlanType = 'FREE' | 'BASIC' | 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'TRIALING';
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'PARTIAL';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type TicketStatus = 'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ContentType = 'FAQ' | 'ANNOUNCEMENT' | 'PAGE';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SETTINGS';
export type FeatureFlagKey = 'maintenanceMode' | 'newUserRegistration' | 'emailNotifications' | 'analyticsDashboard' | 'subscriptionUpgrades';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetUsers: string[];
}

export interface AdminUser {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminUserRole;
  status: UserStatus;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Seller {
  id: string | number;
  email: string;
  businessName: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  plan: PlanType;
  subscriptionStatus?: SubscriptionStatus;
  trialEndsAt?: string;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  onboardedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Subscription {
  id: string;
  sellerId: string | number;
  seller?: Pick<Seller, 'id' | 'businessName' | 'email'>;
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  currentPeriodStart?: string;
  cancelAtPeriodEnd?: boolean;
  trialStart?: string;
  trialEnd?: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  amount: number;
  currency?: string;
  createdAt: string;
  updatedAt?: string;
  paymentMethod?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  sellerId: string;
  seller?: Seller;
  customerId: string;
  customer?: Customer;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Ticket {
  id: string;
  ticketNumber?: string;
  customerId?: string | number;
  customer?: Customer;
  sellerId?: string | number;
  seller?: Seller;
  subject: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string;
  assignedToId?: string | number;
  assignedTo?: string | number | AdminUser;
  tags?: string[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface FAQItem {
  id: string | number;
  question: string;
  answer: string;
  category: string;
  tags?: string[];
  order: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Announcement {
  id: string | number;
  title: string;
  content: string;
  type: 'GENERAL' | 'MAINTENANCE' | 'FEATURE' | 'SECURITY';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  priority?: TicketPriority;
  targetAudience?: 'ALL' | 'SELLERS' | 'CUSTOMERS';
  startsAt?: string;
  endsAt?: string;
  expiresAt?: string;
  isPublished?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Stats {
  totalSellers: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingTickets: number;
  newSignups: number;
  revenueThisMonth: number;
  revenueGrowth: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

export interface AuditLog {
  id: string | number;
  adminUserId?: string | number;
  adminUser?: AdminUser;
  action: AuditAction;
  entityType?: string;
  entity?: string;
  entityId: string | number;
  userId?: string | number;
  userEmail?: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface FeatureFlagConfig {
  maintenanceMode: boolean;
  newUserRegistration: boolean;
  emailNotifications: boolean;
  analyticsDashboard: boolean;
  subscriptionUpgrades: boolean;
}

export interface Settings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  defaultCurrency: string;
  defaultTimezone: string;
  supportEmail: string;
  featureFlags: FeatureFlagConfig;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
}

export type AdminNavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
};