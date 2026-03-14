import { create } from "zustand";
import api from "../lib/api";

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

  /* --------------------------------------------------
   * FETCH PRODUCTS
   * -------------------------------------------------- */
  fetchProducts: async (opts = {}) => {
    try {
      set({ loading: true });

      const page = opts.page ?? get().page ?? 1;
      const limit = opts.limit ?? get().limit ?? 20;

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (opts.search) params.set("search", opts.search);
      if (opts.category) params.set("category", opts.category);
      if (opts.sort) params.set("sort", opts.sort);

      const res = await api.get(`/api/products?${params.toString()}`);

      set({
        products: res.data.products || [],
        total: res.data.total || 0,
        page: res.data.page || page,
        limit: res.data.limit || limit,
        loading: false,
      });
    } catch (err: any) {
      console.error("fetchProducts error:", err);
      set({ products: [], total: 0, loading: false });
    }
  },

  /* --------------------------------------------------
   * ADD PRODUCT
   * -------------------------------------------------- */
  addProduct: async (product) => {
    try {
      const res = await api.post("/api/products", product);

      set((state) => ({
        products: [res.data, ...state.products],
        total: state.total + 1,
      }));

      return res.data;
    } catch (err: any) {
      console.error("addProduct error:", err);
      throw new Error(err?.response?.data?.message || "Failed to add product");
    }
  },

  /* --------------------------------------------------
   * UPDATE PRODUCT
   * -------------------------------------------------- */
  updateProduct: async (id, partial) => {
    try {
      const res = await api.put(`/api/products/${id}`, partial);

      set((state) => ({
        products: state.products.map((p) => (p.id === id ? res.data : p)),
      }));

      return res.data;
    } catch (err: any) {
      console.error("updateProduct error:", err);
      throw new Error(err?.response?.data?.message || "Failed to update product");
    }
  },

  /* --------------------------------------------------
   * DELETE PRODUCT
   * -------------------------------------------------- */
  deleteProduct: async (id) => {
    try {
      await api.delete(`/api/products/${id}`);

      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        total: Math.max(0, state.total - 1),
      }));
    } catch (err: any) {
      console.error("deleteProduct error:", err);
      throw new Error(err?.response?.data?.message || "Failed to delete product");
    }
  },
}));