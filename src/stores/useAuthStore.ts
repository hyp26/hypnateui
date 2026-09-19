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
  emailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authInitialized: boolean;

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
  setUser: (user: User | null) => void;
  setAuthInitialized: (value: boolean) => void;

  // Email verification (post-signup)
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      authInitialized: false,
      setUser: (user) => set({ user }),
      setAuthInitialized: (value) => set({ authInitialized: value }),

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
       * VERIFY EMAIL (post-signup)
       * -------------------------------------------------- */
      verifyEmail: async (token) => {
        const res = await fetch(`${API}/api/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "This verification link is invalid or has expired.");
        }

        const data = await res.json().catch(() => ({}));
        set((state) => ({
          user: data.user || (state.user ? { ...state.user, emailVerified: true } : state.user),
          isAuthenticated: true,
        }));
      },

      resendVerificationEmail: async (email) => {
        const res = await fetch(`${API}/api/auth/resend-verification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Could not resend the verification email. Please try again.");
        }
      },

      /* --------------------------------------------------
       * LOAD PROFILE (session bootstrap)
       * -------------------------------------------------- */
      loadProfile: async () => {
        try {
          const res = await fetch(`${API}/api/auth/profile`, {
            credentials: "include",
          });

          if (res.ok) {
            const profile = await res.json();
            set({
              user: profile,
              isAuthenticated: true,
              authInitialized: true,
            });
            return;
          }

          // Only attempt refresh when the API explicitly says the
          // access token expired. Do not turn unrelated 4xx responses
          // into refresh attempts.
          let body: { code?: string } = {};
          try {
            body = await res.json();
          } catch {
            // Ignore malformed/non-JSON error bodies.
          }

          if (res.status !== 401 || body.code !== "TOKEN_EXPIRED") {
            set({
              user: null,
              isAuthenticated: false,
              authInitialized: true,
            });
            return;
          }

          const refreshed = await tryRefreshToken();

          if (!refreshed) {
            set({
              user: null,
              isAuthenticated: false,
              authInitialized: true,
            });
            return;
          }

          const retryRes = await fetch(`${API}/api/auth/profile`, {
            credentials: "include",
          });

          if (!retryRes.ok) {
            set({
              user: null,
              isAuthenticated: false,
              authInitialized: true,
            });
            return;
          }

          const profile = await retryRes.json();

          set({
            user: profile,
            isAuthenticated: true,
            authInitialized: true,
          });
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            authInitialized: true,
          });
        }
      },

      /* --------------------------------------------------
       * LOGOUT
       * -------------------------------------------------- */
      logout: async () => {
        await fetch(`${API}/api/auth/logout`, {
          method: "POST",
          credentials: "include", // ✅ clears httpOnly cookies server-side
        }).catch(() => { }); // fire and forget

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