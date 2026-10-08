import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Layout } from './components/layout/layout';
import { PublicLayout } from './components/layout/PublicLayout';
import { RouteSEO } from './components/public/SEO';
import { PlanRoute } from './components/plan/PlanGate';
import { normalizePlan } from './config/planEntitlements';
import { useAuthStore } from './stores/useAuthStore';
import { AdminApp } from './admin';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
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
import { PlanRequired } from './pages/PlanRequired';
import { billingApi } from './lib/billingApi';
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Pricing } from './pages/public/Pricing';
import { Contact } from './pages/public/Contact';
import { Features } from './pages/public/Features';
import { Careers } from './pages/public/Careers';
import { FAQ } from './pages/public/FAQ';
import { Terms } from './pages/public/Term';
import { Privacy } from 
'./pages/public/Privacy';
import { Refund } from './pages/public/Refund';
import { DataDeletion } from './pages/public/DataDeletion';
import { NotFound } from './pages/NotFound';
import './i18n/config';

const hasTrialAccess = (seller: any) => {
  const activePlan = normalizePlan(seller?.activePlan);
  if (activePlan) return true;
  const trialPlan = normalizePlan(seller?.trialPlan);
  const trialEndsAt = seller?.trialEndsAt ? new Date(seller.trialEndsAt) : null;
  return Boolean(trialPlan && trialEndsAt && trialEndsAt.getTime() > Date.now());
};

const AuthEntryRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const user = useAuthStore((state) => state.user);

  if (!authInitialized) return null;

  if (isAuthenticated) {
    const sellerNeedsSetup = user?.role === 'SELLER' && !user.seller?.onboardedAt;
    const sellerNeedsPlan =
      user?.role === 'SELLER' &&
      Boolean(user.seller?.onboardedAt) &&
      !hasTrialAccess(user.seller);
    const destination = sellerNeedsSetup
      ? '/onboarding'
      : sellerNeedsPlan
        ? '/plan-required'
        : '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  /*
   * Workspace billing access is decided by the authoritative
   * backend billing status (GET /api/billing/status), never by
   * the persisted auth-store seller fields (activePlan /
   * trialPlan / trialEndsAt), which can be stale.
   */
  const [billingAccess, setBillingAccess] = React.useState<
    'checking' | 'allowed' | 'blocked'
  >('checking');

  const sellerNeedsBillingCheck =
    user?.role === 'SELLER' &&
    Boolean(user.seller?.onboardedAt) &&
    location.pathname !== '/plan-required' &&
    location.pathname !== '/onboarding';

  React.useEffect(() => {
    if (!sellerNeedsBillingCheck) {
      return;
    }

    let cancelled = false;
    setBillingAccess('checking');

    billingApi
      .status()
      .then((status) => {
        if (cancelled) return;
        setBillingAccess(status?.access?.hasAccess ? 'allowed' : 'blocked');
      })
      .catch(() => {
        if (cancelled) return;
        // Fail closed: never grant workspace access from stale
        // persisted billing data when the authoritative check failed.
        setBillingAccess('blocked');
      });

    return () => {
      cancelled = true;
    };
  }, [sellerNeedsBillingCheck]);

  if (!authInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (user?.role === 'SELLER' && !user.seller?.onboardedAt && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (sellerNeedsBillingCheck) {
    // Do not render the protected workspace while the authoritative
    // billing check is in flight or says the seller has no access.
    if (billingAccess === 'checking') return null;
    if (billingAccess === 'blocked') {
      return <Navigate to="/plan-required" replace />;
    }
  }

  return <>{children}</>;
};

const AuthBootstrap = () => {
  const location = useLocation();
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const setAuthInitialized = useAuthStore((state) => state.setAuthInitialized);

  React.useEffect(() => {
    const isAuthEntry = location.pathname === '/login' || location.pathname === '/signup';
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
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/features" element={<Features />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/data-deletion" element={<DataDeletion />} />
        </Route>

        <Route path="/login" element={<AuthEntryRoute><Login /></AuthEntryRoute>} />
        <Route path="/signup" element={<AuthEntryRoute><Signup /></AuthEntryRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/plan-required" element={<ProtectedRoute><PlanRequired /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<AddProduct />} />
          <Route path="/products/:id" element={<ProductView />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/analytics" element={<PlanRoute feature="advancedAnalytics"><DashboardAnalytics /></PlanRoute>} />
          <Route path="/hypnate-x" element={<PlanRoute feature="hypnateX"><HypnateX /></PlanRoute>} />

        </Route>

        {/* Admin authentication is completely separate from seller authentication. */}
        <Route path="/admin/*" element={<AdminApp />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </Router>
  );
}

export default App;
