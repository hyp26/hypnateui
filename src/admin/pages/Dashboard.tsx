import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../stores/useAdminStore';
import { DashboardWelcome } from '../components/Dashboard/DashboardWelcome';
import { DashboardStats } from '../components/Dashboard/DashboardStats';
import { DashboardCharts } from '../components/Dashboard/DashboardCharts';
import { DashboardActivity } from '../components/Dashboard/DashboardActivity';
import { DashboardQuickActions } from '../components/Dashboard/DashboardQuickActions';
import '../styles/Dashboard.css';

export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const user = useAdminStore((state) => state.adminUser);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="admin-dashboard__loading" aria-label="Loading dashboard">
        <div className="admin-dashboard__spinner" />
      </div>
    );
  }

  return (
    <main className="admin-dashboard" aria-label="Admin dashboard">
      <DashboardWelcome firstName={user?.firstName || 'Admin'} />
      <DashboardStats />
      <DashboardCharts />
      <DashboardActivity />
      <DashboardQuickActions />
    </main>
  );
};

export default Dashboard;
