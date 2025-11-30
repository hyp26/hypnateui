import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

const API = process.env.REACT_APP_API_URL as string;

export interface Product {
  id: string | number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;

  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string | number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,

  // FETCH ALL PRODUCTS
  fetchProducts: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoading: true });

    try {
      const res = await fetch(`${API}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error('Failed to fetch products');
        return;
      }

      const data = await res.json();
      set({ products: data });
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // ADD PRODUCT
  addProduct: async (product) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Not authenticated');

    set({ isLoading: true });

    try {
      const res = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      if (!res.ok) throw new Error('Failed to add product');

      const newProduct = await res.json();

      set((state) => ({
        products: [...state.products, newProduct],
      }));
    } catch (error) {
      console.error('Add product error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // DELETE PRODUCT
  deleteProduct: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Not authenticated');

    try {
      const res = await fetch(`${API}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete product');

      // Update UI immediately
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  },
}));
