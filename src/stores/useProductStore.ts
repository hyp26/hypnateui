import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

const API = process.env.REACT_APP_API_URL as string;

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string | null;
  image: string | null;
}

interface ProductState {
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],

  // FETCH ALL PRODUCTS
  fetchProducts: async () => {
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();

      set({ products: data.products || [] });
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  },

  // ADD PRODUCT
  addProduct: async (product) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

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

      set((state) => ({
        products: [...state.products, data.product],
      }));
    } catch (error) {
      console.error("Add product error:", error);
      throw error;
    }
  },

  // DELETE PRODUCT
  deleteProduct: async (id) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete product");

      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error("Delete product error:", error);
      throw error;
    }
  },
}));
