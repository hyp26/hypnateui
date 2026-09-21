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

// Auth Store
import { useAuthStore } from './stores/useAuthStore';

// Auth Pages
import { Login } from './pages/Login';
import { Signup } from "./pages/Signup";
import { VerifyEmail } from "./pages/VerifyEmail";
import { ForgotPassword } from './pages/ForgotPassword';

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
import { HypnateX } from './pages/HypnateX'; // ✅ added
import { PlanRequired } from "./pages/PlanRequired";
import { getEffectivePlan } from "./config/planEntitlements";

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

// i18n
import './i18n/config';

/* --------------------------------------------------
 * PROTECTED ROUTE
 * -------------------------------------------------- */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation().pathname;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === "SELLER" && !user.seller?.onboardedAt && location !== "/onboarding") return <Navigate to="/onboarding" replace />;
  if (user?.role === "SELLER" && user.seller?.onboardedAt) { const access = getEffectivePlan(user.seller); if (!access.hasAccess && location !== "/plan-required") return <Navigate to="/plan-required" replace />; }
  return <>{children}</>;
};

function App() {
  const loadProfile = useAuthStore((state) => state.loadProfile);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <Router>
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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Public: must work even without an active session, since the link
            is opened from an email and may land in a different browser. */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/plan-required" element={<ProtectedRoute><PlanRequired /></ProtectedRoute>} />

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

          {/* Analytics */}
          <Route path="/analytics" element={<DashboardAnalytics />} />

          {/* Hypnate X — AI website builder */}
          <Route path="/hypnate-x" element={<HypnateX />} />
        </Route>

        {/* ---------------- FALLBACK ---------------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Vercel Analytics */}
      <Analytics />
      <SpeedInsights />
    </Router>
  );
}

export default App;