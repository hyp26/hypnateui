import { create } from "zustand";

export type Category = {
  id?: number;
  name: string;
};

type CategoryStore = {
  categories: Category[];
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
};

const API = process.env.REACT_APP_API_URL;

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],

  fetchCategories: async () => {
    const res = await fetch(`${API}/api/categories`);
    const data = await res.json();

    if (Array.isArray(data)) {
      set({ categories: data });
    }
  },

  addCategory: async (name: string) => {
    const res = await fetch(`${API}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const newCat = await res.json();

      set((state) => ({
        categories: [...state.categories, newCat],
      }));
    }
  },
}));
