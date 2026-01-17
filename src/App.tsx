import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// Vercel
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Layouts
import { Layout } from './components/layout/layout';
import { PublicLayout } from './components/layout/PublicLayout';

// Auth & Store
import { useAuthStore } from './stores/useAuthStore';

// Auth Pages
import { Login } from './pages/Login';
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

// Public Website Pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Pricing } from './pages/public/Pricing';
import { Contact } from './pages/public/Contact';
import { Features } from './pages/public/Features';
import { Blog } from './pages/public/Blog';
import { BlogArticle } from './pages/public/BlogArticle';
import { Careers } from './pages/public/Careers';
import { FAQ } from './pages/public/FAQ';
import { Terms } from './pages/public/Term';
import { Privacy } from './pages/public/Privacy';
import { Refund } from './pages/public/Refund';
import { Changelog } from './pages/public/Changelog';

// i18n
import './i18n/config';

/* --------------------------------------------------
 * PROTECTED ROUTE
 * -------------------------------------------------- */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
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

          {/* Blog */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogArticle />} />

          {/* Company */}
          <Route path="/careers" element={<Careers />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/changelog" element={<Changelog />} />

          {/* Legal */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
        </Route>

        {/* ---------------- AUTH (NO LAYOUT) ---------------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ---------------- ONBOARDING ---------------- */}
        <Route path="/onboarding" element={<Onboarding />} />

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

          {/* Conversations */}
          <Route path="/conversations" element={<Conversations />} />

          {/* Orders */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* Payments */}
          <Route path="/payments" element={<Payments />} />

          {/* Analytics */}
          <Route path="/analytics" element={<DashboardAnalytics />} />

          {/* Customers (placeholder) */}
          <Route
            path="/customers"
            element={<div className="p-4">Customers Page (Coming Soon)</div>}
          />
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
