import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

const API = process.env.REACT_APP_API_URL as string;

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
}

interface ProductState {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  fetchProducts: (opts?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sort?: string;
  }) => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Promise<Product>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,

  fetchProducts: async (opts = {}) => {
    try {
      set({ loading: true });
      const token = useAuthStore.getState().token;

      const page = opts.page ?? get().page ?? 1;
      const limit = opts.limit ?? get().limit ?? 20;
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (opts.search) params.set("search", opts.search);
      if (opts.category) params.set("category", opts.category);
      if (opts.sort) params.set("sort", opts.sort);

      const res = await fetch(`${API}/api/products?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        console.warn("fetchProducts failed", data);
        set({ products: [], total: 0, loading: false });
        return;
      }

      set({
        products: data.products || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || limit,
        loading: false,
      });
    } catch (err) {
      console.error("fetchProducts error:", err);
      set({ loading: false });
    }
  },

  addProduct: async (product) => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(product),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");

      // Add product to current page state (optimistic)
      set((state) => ({ products: [data, ...state.products], total: state.total + 1 }));
      return data;
    } catch (err) {
      console.error("addProduct error:", err);
      throw err;
    }
  },

  updateProduct: async (id, partial) => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API}/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(partial),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update product");

      set((state) => ({ products: state.products.map((p) => (p.id === id ? data : p)) }));
      return data;
    } catch (err) {
      console.error("updateProduct error:", err);
      throw err;
    }
  },

  deleteProduct: async (id) => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete product");

      set((state) => ({ products: state.products.filter((p) => p.id !== id), total: Math.max(0, state.total - 1) }));
    } catch (err) {
      console.error("deleteProduct error:", err);
      throw err;
    }
  },
}));
