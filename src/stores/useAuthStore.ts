import { create } from "zustand";
import { persist } from "zustand/middleware";

const API = process.env.REACT_APP_API_URL as string;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  seller?: any;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, businessName: string, phone: string) => Promise<void>;
  loadProfile: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await fetch(`${API}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) throw new Error("Invalid email or password");

        const data = await res.json();
        localStorage.setItem("token", data.token);

        set({
          token: data.token,
          user: data.user,
          isAuthenticated: true,
        });
      },

      signup: async (name, email, password, businessName, phone) => {
        const res = await fetch(`${API}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            businessName,
            phone,
          }),
        });

        if (!res.ok) throw new Error("Signup failed");

        const data = await res.json();
        localStorage.setItem("token", data.token);

        set({
          token: data.token,
          user: data.user,
          isAuthenticated: true,
        });
      },

      loadProfile: async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          set({ token: null, user: null, isAuthenticated: false });
          return;
        }

        const profile = await res.json();

        set({ user: profile, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    { name: "auth-storage" }
  )
);
