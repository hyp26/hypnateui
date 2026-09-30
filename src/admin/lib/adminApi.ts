import axios, { AxiosError } from 'axios';
import type {
  AdminUser,
  Announcement,
  ChartData,
  FAQItem,
  FeatureFlagConfig,
  Settings,
  Stats,
} from '../types';

const BASE_URL = process.env.REACT_APP_API_URL || '';

/* ------------------------------------------------------------------
 * Shared response shapes
 * ------------------------------------------------------------------ */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  statusBreakdown?: Record<string, number>;
}

export interface AnalyticsResponse {
  growth: ChartData & {
    datasets: Array<{ label: string; data: number[] }>;
  };
  planDistribution: Record<string, number> | ChartData;
  orderStatusBreakdown: Record<string, number> | ChartData;
  ticketStatusBreakdown: Record<string, number> | ChartData;
}

export interface ChartsResponse {
  chartData: ChartData;
}

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || 'Request failed. Please try again.';
  }
  if (error instanceof Error) return error.message;
  return 'Request failed. Please try again.';
};

/* ------------------------------------------------------------------
 * Axios instance
 * The backend delivers the admin access/refresh tokens as HttpOnly
 * cookies, so credentials are sent automatically on every request.
 * ------------------------------------------------------------------ */
const adminApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

adminApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Never auto-refresh the login/refresh routes themselves.
    const isAuthRoute =
      originalRequest?.url?.includes('/api/admin/auth/login') ||
      originalRequest?.url?.includes('/api/admin/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => adminApi(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await adminApi.post('/api/admin/auth/refresh');
        processQueue(null);
        return adminApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        window.dispatchEvent(new Event('admin:auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ------------------------------------------------------------------
 * Auth
 * ------------------------------------------------------------------ */
const unwrapAdmin = (payload: any): AdminUser =>
  payload && typeof payload === 'object' && 'admin' in payload ? payload.admin : payload;

export const adminAuthApi = {
  login: async (payload: { email: string; password: string }) => {
    const res = await adminApi.post('/api/admin/auth/login', payload);
    return res.data as { admin: AdminUser; accessToken: string };
  },
  refresh: async () => {
    const res = await adminApi.post('/api/admin/auth/refresh');
    return res.data;
  },
  logout: async () => {
    const res = await adminApi.post('/api/admin/auth/logout');
    return res.data;
  },
  profile: async () => {
    const res = await adminApi.get('/api/admin/auth/profile');
    return unwrapAdmin(res.data) as AdminUser;
  },
  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const res = await adminApi.post('/api/admin/auth/change-password', payload);
    return res.data;
  },
};

/* ------------------------------------------------------------------
 * Admin users
 * ------------------------------------------------------------------ */
export const adminUsersApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    const res = await adminApi.get('/api/admin/users', { params });
    return res.data as PaginatedResponse<AdminUser>;
  },
  create: async (payload: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'SUPPORT';
    password: string;
  }) => {
    const res = await adminApi.post('/api/admin/users', payload);
    return unwrapAdmin(res.data) as AdminUser;
  },
  updateRole: async (id: string | number, role: 'ADMIN' | 'SUPPORT') => {
    const res = await adminApi.patch(`/api/admin/users/${id}/role`, { role });
    return unwrapAdmin(res.data) as AdminUser;
  },
  updateStatus: async (
    id: string | number,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  ) => {
    const res = await adminApi.patch(`/api/admin/users/${id}/status`, { status });
    return unwrapAdmin(res.data) as AdminUser;
  },
  remove: async (id: string | number) => {
    const res = await adminApi.delete(`/api/admin/users/${id}`);
    return res.data;
  },
};

/* ------------------------------------------------------------------
 * Sellers
 * ------------------------------------------------------------------ */
export interface AdminSeller {
  id: string | number;
  email: string;
  businessName: string;
  firstName: string;
  lastName: string;
  status: string;
  phone?: string;
  plan: string;
  subscriptionStatus?: string;
  trialStart?: string;
  trialEndsAt?: string;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  onboardedAt?: string;
  createdAt: string;
}

export const adminSellersApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    plan?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await adminApi.get('/api/admin/sellers', { params });
    return res.data as PaginatedResponse<AdminSeller>;
  },
  get: async (id: string | number) => {
    const res = await adminApi.get(`/api/admin/sellers/${id}`);
    return res.data;
  },
  updateStatus: async (id: string | number, status: string) => {
    const res = await adminApi.patch(`/api/admin/sellers/${id}/status`, { status });
    return res.data;
  },
};

/* ------------------------------------------------------------------
 * Customers
 * ------------------------------------------------------------------ */
export interface AdminCustomer {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  sellerIds?: Array<string | number>;
  createdAt: string;
}

export const adminCustomersApi = {
  list: async (params?: { search?: string; sellerId?: string | number; page?: number; limit?: number }) => {
    const res = await adminApi.get('/api/admin/customers', { params });
    return res.data as PaginatedResponse<AdminCustomer>;
  },
};

/* ------------------------------------------------------------------
 * Orders
 * ------------------------------------------------------------------ */
export interface AdminOrder {
  id: string;
  orderNumber: string;
  sellerId: string;
  seller?: { id: string | number; businessName: string; email: string };
  customerId: string;
  customer?: { id: string | number; firstName?: string; lastName?: string; email?: string };
  items: Array<Record<string, unknown>>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export const adminOrdersApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    sellerId?: string | number;
    page?: number;
    limit?: number;
  }) => {
    const res = await adminApi.get('/api/admin/orders', { params });
    return res.data as PaginatedResponse<AdminOrder>;
  },
  get: async (id: string) => {
    const res = await adminApi.get(`/api/admin/orders/${id}`);
    return res.data as AdminOrder;
  },
  updateStatus: async (id: string, status: string) => {
    const res = await adminApi.patch(`/api/admin/orders/${id}/status`, { status });
    return res.data as AdminOrder;
  },
};

/* ------------------------------------------------------------------
 * Subscriptions (id = seller id)
 * ------------------------------------------------------------------ */
export interface AdminSubscription {
  id: string;
  sellerId: string | number;
  seller?: { id: string | number; businessName: string; email: string };
  plan: string;
  status: string;
  trialStart?: string;
  trialEnd?: string;
  currentPeriodEnd?: string;
  billingCycle: 'MONTHLY' | 'YEARLY' | string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  createdAt: string;
}

export const adminSubscriptionsApi = {
  list: async (params?: { plan?: string; status?: string; page?: number; limit?: number }) => {
    const res = await adminApi.get('/api/admin/subscriptions', { params });
    return res.data as PaginatedResponse<AdminSubscription>;
  },
  update: async (sellerId: string | number, payload: { plan?: string; status?: string }) => {
    const res = await adminApi.patch(`/api/admin/subscriptions/${sellerId}`, payload);
    return res.data as AdminSubscription;
  },
};

/* ------------------------------------------------------------------
 * Support tickets
 * ------------------------------------------------------------------ */
export interface AdminTicket {
  id: string;
  ticketNumber?: string;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  sellerId?: string | number;
  customerId?: string | number;
  assignedToId?: string | number;
  assignedTo?: { id: string | number; firstName: string; lastName: string; email: string } | null;
  tags?: string[];
  messages?: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt?: string;
}

export const adminTicketsApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    priority?: string;
    assignedToAdminId?: string | number;
    page?: number;
    limit?: number;
  }) => {
    const res = await adminApi.get('/api/admin/tickets', { params });
    return res.data as PaginatedResponse<AdminTicket>;
  },
  get: async (id: string) => {
    const res = await adminApi.get(`/api/admin/tickets/${id}`);
    return res.data as AdminTicket;
  },
  create: async (payload: {
    subject: string;
    description?: string;
    priority?: string;
    category?: string;
    sellerId?: string | number;
    customerId?: string | number;
    tags?: string[];
  }) => {
    const res = await adminApi.post('/api/admin/tickets', payload);
    return res.data as AdminTicket;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const res = await adminApi.patch(`/api/admin/tickets/${id}`, payload);
    return res.data as AdminTicket;
  },
  addMessage: async (id: string, payload: { body: string; isInternal?: boolean }) => {
    const res = await adminApi.post(`/api/admin/tickets/${id}/messages`, payload);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await adminApi.delete(`/api/admin/tickets/${id}`);
    return res.data;
  },
};

/* ------------------------------------------------------------------
 * Announcements
 * ------------------------------------------------------------------ */
export const adminAnnouncementsApi = {
  list: async (params?: { status?: string; type?: string; page?: number; limit?: number }) => {
    const res = await adminApi.get('/api/admin/announcements', { params });
    return res.data as PaginatedResponse<Announcement>;
  },
  create: async (payload: Record<string, unknown>) => {
    const res = await adminApi.post('/api/admin/announcements', payload);
    return res.data as Announcement;
  },
  update: async (id: string | number, payload: Record<string, unknown>) => {
    const res = await adminApi.patch(`/api/admin/announcements/${id}`, payload);
    return res.data as Announcement;
  },
  remove: async (id: string | number) => {
    const res = await adminApi.delete(`/api/admin/announcements/${id}`);
    return res.data;
  },
};

/* ------------------------------------------------------------------
 * FAQ
 * ------------------------------------------------------------------ */
export const adminFaqApi = {
  list: async (params?: { category?: string; page?: number; limit?: number }) => {
    const res = await adminApi.get('/api/admin/faq', { params });
    return res.data as PaginatedResponse<FAQItem>;
  },
  create: async (payload: Record<string, unknown>) => {
    const res = await adminApi.post('/api/admin/faq', payload);
    return res.data as FAQItem;
  },
  update: async (id: string | number, payload: Record<string, unknown>) => {
    const res = await adminApi.patch(`/api/admin/faq/${id}`, payload);
    return res.data as FAQItem;
  },
  remove: async (id: string | number) => {
    const res = await adminApi.delete(`/api/admin/faq/${id}`);
    return res.data;
  },
};

/* ------------------------------------------------------------------
 * Content pages
 * ------------------------------------------------------------------ */
export interface AdminContentPage {
  id: string | number;
  slug: string;
  title: string;
  body: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export const adminContentApi = {
  list: async (params?: { status?: string; page?: number; limit?: number }) => {
    const res = await adminApi.get('/api/admin/content', { params });
    return res.data as PaginatedResponse<AdminContentPage>;
  },
  create: async (payload: { slug: string; title: string; body: string; status?: string }) => {
    const res = await adminApi.post('/api/admin/content', payload);
    return res.data as AdminContentPage;
  },
  update: async (id: string | number, payload: Record<string, unknown>) => {
    const res = await adminApi.patch(`/api/admin/content/${id}`, payload);
    return res.data as AdminContentPage;
  },
  remove: async (id: string | number) => {
    const res = await adminApi.delete(`/api/admin/content/${id}`);
    return res.data;
  },
};

/* ------------------------------------------------------------------
 * Audit logs (SUPER_ADMIN / ADMIN only)
 * ------------------------------------------------------------------ */
export interface AdminAuditLog {
  id: string | number;
  adminUserId?: string | number;
  adminUser?: { id: string | number; email: string; firstName?: string; lastName?: string } | null;
  action: string;
  entityType?: string;
  entityId?: string | number;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export const adminAuditLogsApi = {
  list: async (params?: {
    action?: string;
    adminUserId?: string | number;
    entityType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await adminApi.get('/api/admin/audit-logs', { params });
    return res.data as PaginatedResponse<AdminAuditLog>;
  },
};

/* ------------------------------------------------------------------
 * Settings & feature flags
 * ------------------------------------------------------------------ */
export const adminSettingsApi = {
  get: async () => {
    const res = await adminApi.get('/api/admin/settings');
    return res.data as Settings;
  },
  update: async (payload: Partial<Omit<Settings, 'featureFlags'>>) => {
    const res = await adminApi.put('/api/admin/settings', payload);
    return res.data as Settings;
  },
};

export const adminFeatureFlagsApi = {
  get: async () => {
    const res = await adminApi.get('/api/admin/feature-flags');
    return res.data as FeatureFlagConfig;
  },
  update: async (payload: Partial<FeatureFlagConfig>) => {
    const res = await adminApi.put('/api/admin/feature-flags', payload);
    return res.data as FeatureFlagConfig;
  },
};

/* ------------------------------------------------------------------
 * Stats & analytics
 * ------------------------------------------------------------------ */
export const adminStatsApi = {
  get: async () => {
    const res = await adminApi.get('/api/admin/stats');
    return res.data as Stats;
  },
  charts: async (days = 30) => {
    const res = await adminApi.get('/api/admin/stats/charts', { params: { days } });
    return res.data as ChartsResponse;
  },
};

export const adminAnalyticsApi = {
  get: async () => {
    const res = await adminApi.get('/api/admin/analytics');
    return res.data as AnalyticsResponse;
  },
};

export default adminApi;
