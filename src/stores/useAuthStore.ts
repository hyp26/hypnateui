import { create } from "zustand";
import { persist } from "zustand/middleware";

const API = process.env.REACT_APP_API_URL as string;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  sellerId?: number | null;
  seller?: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    businessName: string,
    phone: string
  ) => Promise<void>;
  loadProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      /* --------------------------------------------------
       * LOGIN
       * -------------------------------------------------- */
      login: async (email, password) => {
        const res = await fetch(`${API}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // ✅ sends & receives httpOnly cookies
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Invalid email or password");
        }

        const data = await res.json();
        // ✅ No token stored — cookie is set automatically by browser
        set({ user: data.user, isAuthenticated: true });
      },

      /* --------------------------------------------------
       * SIGNUP
       * -------------------------------------------------- */
      signup: async (name, email, password, businessName, phone) => {
        const res = await fetch(`${API}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // ✅ receives httpOnly cookie on register
          body: JSON.stringify({ name, email, password, businessName, phone }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Signup failed");
        }

        const data = await res.json();
        set({ user: data.user, isAuthenticated: true });
      },

      /* --------------------------------------------------
       * LOAD PROFILE (on app boot)
       * -------------------------------------------------- */
      loadProfile: async () => {
        const res = await fetch(`${API}/api/auth/profile`, {
          credentials: "include", // ✅ cookie sent automatically
        });

        if (!res.ok) {
          // Try refreshing the token once before giving up
          const refreshed = await tryRefreshToken();
          if (!refreshed) {
            set({ user: null, isAuthenticated: false });
            return;
          }

          // Retry profile after refresh
          const retryRes = await fetch(`${API}/api/auth/profile`, {
            credentials: "include",
          });

          if (!retryRes.ok) {
            set({ user: null, isAuthenticated: false });
            return;
          }

          const profile = await retryRes.json();
          set({ user: profile, isAuthenticated: true });
          return;
        }

        const profile = await res.json();
        set({ user: profile, isAuthenticated: true });
      },

      /* --------------------------------------------------
       * LOGOUT
       * -------------------------------------------------- */
      logout: async () => {
        await fetch(`${API}/api/auth/logout`, {
          method: "POST",
          credentials: "include", // ✅ clears httpOnly cookies server-side
        }).catch(() => {}); // fire and forget

        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      // ✅ Only persist user info, NOT token (token lives in httpOnly cookie)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/* --------------------------------------------------
 * HELPER — Try to refresh access token silently
 * -------------------------------------------------- */
export const tryRefreshToken = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
};