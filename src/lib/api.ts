import axios from "axios";

// For CRA / Webpack apps, environment vars use process.env.REACT_APP_*
const API_BASE = process.env.REACT_APP_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// -----------------------------
// ORDERS API
// -----------------------------
export const ordersApi = {
  list: async () => {
    const res = await api.get("/orders");
    return res.data;
  },

  get: async (id: string) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, status: string, note?: string) => {
    const res = await api.patch(`/orders/${id}/status`, { status, note });
    return res.data;
  },

  updatePayment: async (id: string, status: string, method?: string) => {
    const res = await api.patch(`/orders/${id}/payment`, {
      status,
      method,
    });
    return res.data;
  },

  addTracking: async (id: string, trackingNumber: string) => {
    const res = await api.post(`/orders/${id}/track`, {
      trackingNumber,
    });
    return res.data;
  },
};

export default api;
