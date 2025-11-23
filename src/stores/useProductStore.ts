import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

interface ProductState {
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [
    { id: '1', name: 'Cotton Kurta', price: 1299, stock: 45, category: 'Apparel', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=150&q=80' },
    { id: '2', name: 'Handmade Soap', price: 250, stock: 100, category: 'Beauty', image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=150&q=80' },
    { id: '3', name: 'Ceramic Vase', price: 899, stock: 12, category: 'Home', image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=150&q=80' },
  ],
  fetchProducts: async () => {
    // Mock fetch
  },
  addProduct: (product) => set((state) => ({ 
    products: [...state.products, { ...product, id: Math.random().toString(36).substr(2, 9) }] 
  })),
}));
