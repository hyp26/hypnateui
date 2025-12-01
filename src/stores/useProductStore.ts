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
  imageUrl: string | null;
}

interface ProductState {
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],

  fetchProducts: async () => {
    try {
      const token = useAuthStore.getState().token;

      const res = await fetch(`${API}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      // Backend returns an array
      if (Array.isArray(data)) {
        set({ products: data });
      } else {
        console.warn("Unexpected response:", data);
        set({ products: [] });
      }

    } catch (error) {
      console.error("Fetch products error:", error);
    }
  },

  addProduct: async (product) => {
    try {
      const token = useAuthStore.getState().token;

      const res = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to add product");

      // Optimistic update
      set(state => ({
        products: [...state.products, data],
      }));

    } catch (error) {
      console.error("Add product error:", error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const token = useAuthStore.getState().token;

      const res = await fetch(`${API}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete product");

      set(state => ({
        products: state.products.filter(p => p.id !== id),
      }));
    } catch (error) {
      console.error("Delete product error:", error);
      throw error;
    }
  },
}));
