import { create } from "zustand";
import { persist } from "zustand/middleware";

const API = process.env.REACT_APP_API_URL || "";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  sellerId?: number | null;
  seller?: {
    businessName?: string;
    phone?: string | null;
    onboardedAt?: string | null;
    selectedPlan?: string | null;
    activePlan?: string | null;
    planActivatedAt?: string | null;
    [key: string]: unknown;
  };
  emailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authInitialized: boolean;

  login: (email: string, password: string) => Promise<User>;
  signup: (
    name: string,
    email: string,
    password: string,
    businessName: string,
    phone: string,
    selectedPlan?: string | null
  ) => Promise<User>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
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
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const error = new Error(data.message || "Invalid email or password") as Error & { code?: string };
          error.code = data.code;
          throw error;
        }

        if (!data.user) {
          throw new Error("Login succeeded but no account information was returned.");
        }

        set({ user: data.user, isAuthenticated: true });
        return data.user as User;
      },

      /* --------------------------------------------------
       * SIGNUP
       * -------------------------------------------------- */
      signup: async (name, email, password, businessName, phone, selectedPlan = null) => {
        const res = await fetch(`${API}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password, businessName, phone, selectedPlan }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const error = new Error(data.message || "Signup failed") as Error & { code?: string };
          error.code = data.code;
          throw error;
        }

        if (!data.user) {
          throw new Error("Signup succeeded but no account information was returned.");
        }

        // Registration does not create an authenticated session on the backend.
        // Keep the returned account data for the verification screen, but do not
        // mark the browser as authenticated until email verification succeeds.
        set({ user: data.user, isAuthenticated: false });
        return data.user as User;
      },

      requestPasswordReset: async (email) => {
        const res = await fetch(`${API}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Could not send the password reset link.");
        }
      },

      resetPassword: async (token, password) => {
        const res = await fetch(`${API}/api/auth/reset-password/${encodeURIComponent(token)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ password }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Could not reset your password.");
        }
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
    const res = await fetch(`${API}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
};