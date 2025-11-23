import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'merchant';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  signup: (email: string) => Promise<void>;
  logout: () => void;
}

type AuthPersist = PersistOptions<AuthState>;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (email: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        set({
          token: 'mock-jwt-token',
          user: { id: '1', name: 'Demo Merchant', email, role: 'merchant' },
          isAuthenticated: true,
        });
      },

      signup: async (email: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        set({
          token: 'mock-jwt-token',
          user: { id: '1', name: 'New Merchant', email, role: 'merchant' },
          isAuthenticated: true,
        });
      },

      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' } as AuthPersist
  )
);
