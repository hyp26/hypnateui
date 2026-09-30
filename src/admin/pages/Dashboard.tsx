import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../stores/useAdminStore';
import {
  adminAnalyticsApi,
  adminAuditLogsApi,
  adminStatsApi,
  type AdminAuditLog,
} from '../lib/adminApi';
import { DashboardWelcome } from '../components/Dashboard/DashboardWelcome';
import { DashboardStats } from '../components/Dashboard/DashboardStats';
import { DashboardCharts } from '../components/Dashboard/DashboardCharts';
import { DashboardActivity, type DashboardActivityItem } from '../components/Dashboard/DashboardActivity';
import { DashboardQuickActions } from '../components/Dashboard/DashboardQuickActions';
import type { ChartData, Stats } from '../types';
import '../styles/Dashboard.css';

const actionLabels: Record<string, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  SETTINGS: 'Settings change',
};

const actionTypes: Record<string, DashboardActivityItem['type']> = {
  CREATE: 'success',
  DELETE: 'warning',
};

const formatRelativeTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
};

const mapLogToActivity = (log: AdminAuditLog): DashboardActivityItem => {
  const entity = [log.entityType, log.entityId].filter(Boolean).join(' ');
  const action = log.action || 'UPDATE';
  return {
    id: log.id,
    action:
      actionLabels[action] ??
      (action ? action.charAt(0) + action.slice(1).toLowerCase() : 'Activity'),
    entity: entity || '—',
    time: formatRelativeTime(log.createdAt),
    type: actionTypes[action] ?? 'info',
  };
};

export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueChart, setRevenueChart] = useState<ChartData | null>(null);
  const [planDistribution, setPlanDistribution] = useState<ChartData | null>(null);
  const [sellerGrowth, setSellerGrowth] = useState<ChartData | null>(null);
  const [activities, setActivities] = useState<DashboardActivityItem[]>([]);
  const user = useAdminStore((state) => state.adminUser);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [statsResult, chartsResult, analyticsResult, logsResult] = await Promise.allSettled([
        adminStatsApi.get(),
        adminStatsApi.charts(30),
        adminAnalyticsApi.get(),
        adminAuditLogsApi.list({ page: 1, limit: 5 }),
      ]);

      if (cancelled) return;

      if (statsResult.status === 'fulfilled') setStats(statsResult.value);
      if (chartsResult.status === 'fulfilled') setRevenueChart(chartsResult.value.chartData);
      if (analyticsResult.status === 'fulfilled') {
        const analytics = analyticsResult.value;
        const distribution = analytics.planDistribution;
        setPlanDistribution(
          distribution && 'labels' in distribution && Array.isArray((distribution as ChartData).labels)
            ? (distribution as ChartData)
            : {
                labels: Object.keys(distribution ?? {}),
                datasets: [{ data: Object.values(distribution ?? {}) }],
              }
        );
        const growth = analytics.growth;
        const sellersDataset = growth?.datasets?.find((dataset) => dataset.label === 'Sellers');
        if (growth && sellersDataset) {
          setSellerGrowth({ labels: growth.labels, datasets: [sellersDataset] });
        }
      }
      if (logsResult.status === 'fulfilled') {
        setActivities(logsResult.value.data.map(mapLogToActivity));
      }

      setIsLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
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
      <DashboardStats stats={stats} />
      <DashboardCharts
        revenueChart={revenueChart}
        planDistribution={planDistribution}
        sellerGrowth={sellerGrowth}
      />
      <DashboardActivity activities={activities} />
      <DashboardQuickActions />
    </main>
  );
};

export default Dashboard;
