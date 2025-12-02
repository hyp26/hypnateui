import axios from "axios";

// SAME as product store
const API = process.env.REACT_APP_API_URL || "";

const api = axios.create({
  baseURL: API, // base backend URL WITHOUT /api
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Attach JWT from localStorage
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
    const res = await api.patch(`/api/orders/${id}/payment`, {
      status,
      method,
    });
    return res.data;
  },

  addTracking: async (id: string, trackingNumber: string) => {
    const res = await api.post(`/api/orders/${id}/track`, {
      trackingNumber,
    });
    return res.data;
  },
};

export default api;
