import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

// Vercel
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Layouts
import { Layout } from './components/layout/layout';
import { PublicLayout } from './components/layout/PublicLayout';
import { RouteSEO } from './components/public/SEO';
import { PlanRoute } from './components/plan/PlanGate';
import { normalizePlan } from './config/planEntitlements';

// Auth Store
import { useAuthStore } from './stores/useAuthStore';

// Auth Pages
import { Login } from './pages/Login';
import { Signup } from "./pages/Signup";
import { VerifyEmail } from "./pages/VerifyEmail";
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

// Dashboard Pages
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { AddProduct } from './pages/AddProduct';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Conversations } from './pages/Conversations';
import { Onboarding } from './pages/Onboarding';
import { Settings } from './pages/Settings';
import { Payments } from './pages/Payments';
import { Analytics as DashboardAnalytics } from './pages/Analytics';
import { EditProduct } from './pages/EditProduct';
import { ProductView } from './pages/ProductView';
import Customers from './pages/Customers';
import { HypnateX } from './pages/HypnateX';
import { PlanRequired } from "./pages/PlanRequired";

// Public Website Pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Pricing } from './pages/public/Pricing';
import { Contact } from './pages/public/Contact';
import { Features } from './pages/public/Features';
import { Careers } from './pages/public/Careers';
import { FAQ } from './pages/public/FAQ';
import { Terms } from './pages/public/Term';
import { Privacy } from './pages/public/Privacy';
import { Refund } from './pages/public/Refund';
import { NotFound } from './pages/NotFound';

// i18n
import './i18n/config';

/* --------------------------------------------------
 * PROTECTED ROUTE
 * -------------------------------------------------- */

/* --------------------------------------------------
 * AUTH ENTRY ROUTE
 * -------------------------------------------------- */
const AuthEntryRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const user = useAuthStore((state) => state.user);

  if (!authInitialized) return null;

  if (isAuthenticated) {
    const sellerNeedsSetup = user?.role === "SELLER" && !user.seller?.onboardedAt;
    const sellerNeedsPlan = user?.role === "SELLER" && Boolean(user.seller?.onboardedAt) && !normalizePlan(user.seller?.activePlan);
    const destination = sellerNeedsSetup
      ? "/onboarding"
      : sellerNeedsPlan
        ? "/plan-required"
        : "/dashboard";
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!authInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.role === "SELLER" && !user.seller?.onboardedAt && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (
    user?.role === "SELLER" &&
    user.seller?.onboardedAt &&
    !normalizePlan(user.seller?.activePlan) &&
    location.pathname !== "/plan-required"
  ) {
    return <Navigate to="/plan-required" replace />;
  }

  return <>{children}</>;
};

const AuthBootstrap = () => {
  const location = useLocation();
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const setAuthInitialized = useAuthStore((state) => state.setAuthInitialized);

  React.useEffect(() => {
    /*
     * Do not bootstrap auth on the login/signup screens.
     *
     * This prevents the initial unauthenticated profile check from
     * racing a just-completed login and clearing the authenticated
     * Zustand state.
     */
    const isAuthEntry = location.pathname === "/login" || location.pathname === "/signup";
    const persistedAuthenticated = useAuthStore.getState().isAuthenticated;

    if (isAuthEntry && !persistedAuthenticated) {
      setAuthInitialized(true);
      return;
    }

    setAuthInitialized(false);
    void loadProfile();
  }, [location.pathname, loadProfile, setAuthInitialized]);

  return null;
};

function App() {
  return (
    <Router>
      <AuthBootstrap />
      <RouteSEO />
      <Routes>

        {/* ---------------- PUBLIC MARKETING SITE ---------------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/features" element={<Features />} />

          {/* Company */}
          <Route path="/careers" element={<Careers />} />
          <Route path="/faq" element={<FAQ />} />

          {/* Legal */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
        </Route>

        {/* ---------------- AUTH ---------------- */}
        <Route
          path="/login"
          element={
            <AuthEntryRoute>
              <Login />
            </AuthEntryRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthEntryRoute>
              <Signup />
            </AuthEntryRoute>
          }
        />
        {/* Public: must work even without an active session, since the link
            is opened from an email and may land in a different browser. */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ---------------- PLAN ACTIVATION (protected, no sidebar) ---------------- */}
        <Route
          path="/plan-required"
          element={
            <ProtectedRoute>
              <PlanRequired />
            </ProtectedRoute>
          }
        />

        {/* ---------------- ONBOARDING (protected, no sidebar) ---------------- */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* ---------------- PROTECTED DASHBOARD ---------------- */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Products */}
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<AddProduct />} />
          <Route path="/products/:id" element={<ProductView />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />

          {/* Orders */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          {/* Customers */}
          <Route path="/customers" element={<Customers />} />

          {/* Conversations */}
          <Route path="/conversations" element={<Conversations />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* Payments */}
          <Route path="/payments" element={<Payments />} />

          {/* Analytics — Pro and Business */}
          <Route
            path="/analytics"
            element={
              <PlanRoute feature="advancedAnalytics">
                <DashboardAnalytics />
              </PlanRoute>
            }
          />

          {/* Hypnate X — Business only */}
          <Route
            path="/hypnate-x"
            element={
              <PlanRoute feature="hypnateX">
                <HypnateX />
              </PlanRoute>
            }
          />
        </Route>

        {/* ---------------- FALLBACK ---------------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Vercel Analytics */}
      <Analytics />
      <SpeedInsights />
    </Router>
  );
}

export default App;