import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminHeader } from './Header';
import { AdminSidebar } from './Sidebar';
import { useAdminStore } from '../stores/useAdminStore';

export const AdminLayout = () => {
  const sidebarCollapsed = useAdminStore((state) => state.sidebarCollapsed);

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className={`admin-content ${sidebarCollapsed ? 'admin-content--expanded' : ''}`}>
        <AdminHeader />
        <main className="admin-main">
          <div className="admin-main__inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
