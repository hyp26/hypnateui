import React from 'react';
import './styles/index.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/Layout';
import { useAdminStore } from './stores/useAdminStore';
import {
  Dashboard,
  Sellers,
  Customers,
  Subscriptions,
  Orders,
  Content,
  Tickets,
  FAQ,
  Announcements,
  Analytics,
  Settings,
  AuditLogs,
  AdminUsers,
  Login,
} from './pages';

const AdminAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
  const isInitialized = useAdminStore((state) => state.isInitialized);

  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const AdminLoginGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
  const isInitialized = useAdminStore((state) => state.isInitialized);

  if (!isInitialized) return null;
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
};

const AdminUsersGuard = ({ children }: { children: React.ReactNode }) => {
  const adminUser = useAdminStore((state) => state.adminUser);
  const hasPermission = useAdminStore((state) => state.hasPermission);

  if (!adminUser || !hasPermission('VIEW_ADMIN_USERS')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AdminApp = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <AdminLoginGuard>
          <Login />
        </AdminLoginGuard>
      }
    />

    <Route
      path="/*"
      element={
        <AdminAuthGuard>
          <AdminLayout />
        </AdminAuthGuard>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="sellers" element={<Sellers />} />
      <Route path="customers" element={<Customers />} />
      <Route path="subscriptions" element={<Subscriptions />} />
      <Route path="orders" element={<Orders />} />
      <Route path="content" element={<Content />} />
      <Route path="tickets" element={<Tickets />} />
      <Route path="faq" element={<FAQ />} />
      <Route path="announcements" element={<Announcements />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="settings" element={<Settings />} />
      <Route path="audit-logs" element={<AuditLogs />} />
      <Route
        path="admin-users"
        element={
          <AdminUsersGuard>
            <AdminUsers />
          </AdminUsersGuard>
        }
      />
    </Route>
  </Routes>
);
