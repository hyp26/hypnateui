import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// vercel
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Layouts
import { Layout } from './components/layout/layout';
import { PublicLayout } from './components/layout/PublicLayout';

// Auth & Store
import { useAuthStore } from './stores/useAuthStore';

// Dashboard Pages
import { Login } from './pages/Login';
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
import { EditProduct } from './pages/EditProduct';
import { ProductView } from './pages/ProductView';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Marketing Website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/features" element={<Features />} />

          {/* Content / Blog */}
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

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected Dashboard */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          {/* products routes */}
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<AddProduct />} />
          <Route path="/products/:id" element={<ProductView />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />

          {/* conversations routes */}
          <Route path="/conversations" element={<Conversations />} />

          {/* orders routes */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          {/* settings routes */}
          <Route path="/settings" element={<Settings />} />

          {/* payments routes */}
          <Route path="/payments" element={<Payments />} />

          {/* analytics routes */}
          <Route path="/analytics" element={<DashboardAnalytics />} />

          {/* customers routes */}
          <Route
            path="/customers"
            element={<div className="p-4">Customers Page (Coming Soon)</div>}
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Vercel Analytics */}
      <Analytics />

      {/* Global Vercel Speed Insights */}
      <SpeedInsights />
    </Router>
  );
}

export default App;
