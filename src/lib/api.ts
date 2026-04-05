import axios, { AxiosError } from "axios";

let API = process.env.REACT_APP_API_URL || "";
if (API && !API.endsWith('/api')) {
  API += '/api';
}

const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true, // ✅ sends httpOnly cookies on every request automatically
});

/* --------------------------------------------------
 * REQUEST INTERCEPTOR
 * No longer attaches token from localStorage — 
 * cookies are sent automatically by the browser
 * -------------------------------------------------- */
api.interceptors.request.use((config) => {
  return config;
});

/* --------------------------------------------------
 * RESPONSE INTERCEPTOR
 * Auto-refresh access token on TOKEN_EXPIRED,
 * then retry the original request once.
 * -------------------------------------------------- */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ code?: string; message?: string }>) => {
    const originalRequest = error.config as any;

    const isTokenExpired =
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED";

    // Don't retry refresh route itself (prevents infinite loop)
    const isRefreshRoute = originalRequest?.url?.includes("/auth/refresh");

    if (isTokenExpired && !originalRequest._retry && !isRefreshRoute) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/api/auth/refresh"); // ✅ refresh cookie silently
        processQueue(null);
        return api(originalRequest); // ✅ retry original request
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);

        // Refresh failed — user needs to log in again
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* --------------------------------------------------
 * ORDERS API
 * -------------------------------------------------- */
export const ordersApi = {
  list: async () => {
    const res = await api.get("/api/orders");
    return res.data;
  },

  get: async (id: string) => {
    const res = await api.get(`/api/orders/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, status: string, note?: string) => {
    const res = await api.patch(`/api/orders/${id}/status`, { status, note });
    return res.data;
  },

  updatePayment: async (id: string, status: string, method?: string) => {
    const res = await api.patch(`/api/orders/${id}/payment`, { status, method });
    return res.data;
  },

  addTracking: async (id: string, trackingNumber: string) => {
    const res = await api.post(`/api/orders/${id}/track`, { trackingNumber });
    return res.data;
  },
};

export default api;