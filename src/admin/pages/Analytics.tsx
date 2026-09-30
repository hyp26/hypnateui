import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  adminAnalyticsApi,
  adminAuditLogsApi,
  adminSellersApi,
  adminStatsApi,
  getApiErrorMessage,
  type AdminAuditLog,
} from '../lib/adminApi';
import AnalyticsStats from '../components/Analytics/AnalyticsStats';
import AnalyticsSection from '../components/Analytics/AnalyticsSection';
import AnalyticsSummary, {
  type SummaryActivity,
  type SummaryActivityType,
  type TopSeller,
} from '../components/Analytics/AnalyticsSummary';
import type { ChartData, Stats } from '../types';
import '../styles/Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController,
);

const planColors = ['#2aa39a', '#4d82e8', '#8057df', '#f5a623', '#df555b', '#94a3b8'];
const orderStatusColors: Record<string, string> = {
  PENDING: '#94a3b8',
  PROCESSING: '#e39a21',
  SHIPPED: '#8057df',
  DELIVERED: '#22a56b',
  CANCELLED: '#df555b',
  REFUNDED: '#667b92',
};

const rangeToDays: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };

const actionLabels: Record<string, string> = {
  CREATE: 'New record created',
  UPDATE: 'Record updated',
  DELETE: 'Record deleted',
  LOGIN: 'Admin login',
  LOGOUT: 'Admin logout',
  SETTINGS: 'Settings change',
};

const activityTypes: Record<string, SummaryActivityType> = {
  CREATE: 'order',
  UPDATE: 'seller',
  DELETE: 'shipping',
  LOGIN: 'payment',
  LOGOUT: 'payment',
  SETTINGS: 'seller',
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

// Accepts either a ChartData payload or a plain { label: count } breakdown map.
const normalizeDistribution = (
  distribution: Record<string, number> | ChartData | undefined,
  colorMap?: Record<string, string>
): ChartData => {
  if (!distribution) return { labels: [], datasets: [] };

  if ('labels' in distribution && Array.isArray(distribution.labels)) {
    const chart = distribution as ChartData;
    return {
      labels: chart.labels,
      datasets: [
        {
          data: chart.datasets[0]?.data ?? [],
          backgroundColor:
            chart.labels.map((label) => colorMap?.[label] ?? undefined).every(Boolean)
              ? chart.labels.map((label) => colorMap![label])
              : chart.datasets[0]?.backgroundColor ?? planColors,
          borderWidth: 0,
        },
      ],
    };
  }

  const record = distribution as Record<string, number>;
  const labels = Object.keys(record);
  return {
    labels,
    datasets: [
      {
        data: Object.values(record),
        backgroundColor: labels.map((label) => colorMap?.[label] ?? undefined).every(Boolean)
          ? labels.map((label) => colorMap![label])
          : planColors,
        borderWidth: 0,
      },
    ],
  };
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  color: '#5f7289',
  plugins: {
    legend: {
      labels: {
        color: '#52677e',
        usePointStyle: true,
        padding: 14,
        font: { size: 12 },
      },
    },
    tooltip: {
      backgroundColor: '#1d2b3d',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      padding: 10,
      displayColors: true,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#e8edf2' },
      border: { display: false },
      ticks: {
        color: '#667b92',
        font: { size: 11 },
      },
    },
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: '#667b92',
        font: { size: 11 },
      },
    },
  },
};

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<ChartData | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<ChartData | null>(null);
  const [sellerGrowth, setSellerGrowth] = useState<ChartData | null>(null);
  const [planDistribution, setPlanDistribution] = useState<ChartData | null>(null);
  const [orderStatus, setOrderStatus] = useState<ChartData | null>(null);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [activities, setActivities] = useState<SummaryActivity[]>([]);

  const loadCharts = useCallback(async (days: number) => {
    try {
      const response = await adminStatsApi.charts(days);
      const chartData = response.chartData;
      const revenue = chartData.datasets.find((d) => d.label === 'Revenue') ?? chartData.datasets[0];
      setDailyRevenue({
        labels: chartData.labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenue?.data ?? [],
            backgroundColor: 'rgba(42, 174, 184, 0.18)',
            borderColor: '#1999a3',
            borderWidth: 2,
            borderRadius: 5,
          },
        ],
      });
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [statsResult, chartsResult, analyticsResult, sellersResult, logsResult] =
        await Promise.allSettled([
          adminStatsApi.get(),
          adminStatsApi.charts(rangeToDays[timeRange] ?? 30),
          adminAnalyticsApi.get(),
          adminSellersApi.list({ sort: 'revenue_desc', limit: 5 }),
          adminAuditLogsApi.list({ page: 1, limit: 5 }),
        ]);

      if (cancelled) return;

      if (statsResult.status === 'fulfilled') setStats(statsResult.value);
      else setLoadError(getApiErrorMessage(statsResult.reason));

      if (chartsResult.status === 'fulfilled') {
        const chartData = chartsResult.value.chartData;
        const revenue =
          chartData.datasets.find((d) => d.label === 'Revenue') ?? chartData.datasets[0];
        setDailyRevenue({
          labels: chartData.labels,
          datasets: [
            {
              label: 'Revenue',
              data: revenue?.data ?? [],
              backgroundColor: 'rgba(42, 174, 184, 0.18)',
              borderColor: '#1999a3',
              borderWidth: 2,
              borderRadius: 5,
            },
          ],
        });
      }

      if (analyticsResult.status === 'fulfilled') {
        const analytics = analyticsResult.value;
        const growth = analytics.growth;
        const revenueDataset =
          growth?.datasets?.find((d) => d.label === 'Revenue') ?? growth?.datasets?.[0];
        if (growth && revenueDataset) {
          setMonthlyRevenue({
            labels: growth.labels,
            datasets: [
              {
                label: 'Revenue',
                data: revenueDataset.data,
                backgroundColor: '#2aaeb8',
                borderRadius: 5,
              },
            ],
          });
        }
        const sellersDataset = growth?.datasets?.find((d) => d.label === 'Sellers');
        if (growth && sellersDataset) {
          setSellerGrowth({
            labels: growth.labels,
            datasets: [
              {
                label: 'New Sellers',
                data: sellersDataset.data,
                borderColor: '#1999a3',
                backgroundColor: 'rgba(42, 174, 184, 0.10)',
                tension: 0.4,
                pointBackgroundColor: '#1999a3',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                fill: true,
              },
            ],
          });
        }
        setPlanDistribution(normalizeDistribution(analytics.planDistribution));
        setOrderStatus(normalizeDistribution(analytics.orderStatusBreakdown, orderStatusColors));
      } else {
        setLoadError(getApiErrorMessage(analyticsResult.reason));
      }

      if (sellersResult.status === 'fulfilled') {
        setTopSellers(
          sellersResult.value.data.map((seller) => ({
            name: seller.businessName,
            revenue: seller.totalRevenue,
            orders: seller.totalOrders,
          }))
        );
      }

      if (logsResult.status === 'fulfilled') {
        setActivities(
          logsResult.value.data.map((log: AdminAuditLog) => ({
            id: log.id,
            action: actionLabels[log.action ?? ''] ?? (log.action || 'Activity'),
            entity: [log.entityType, log.entityId].filter(Boolean).join(' ') || '—',
            time: formatRelativeTime(log.createdAt),
            type: activityTypes[log.action ?? ''] ?? 'seller',
          }))
        );
      }

      setIsLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    void loadCharts(rangeToDays[value] ?? 30);
  };

  const emptyChart = useMemo<ChartData>(() => ({ labels: [], datasets: [] }), []);

  if (isLoading) {
    return (
      <div className="analytics-page analytics-page--loading">
        <div className="analytics-spinner" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <header className="analytics-page__header">
        <div>
          <h1 className="analytics-page__title">Analytics</h1>
          <p className="analytics-page__subtitle">
            Platform performance and usage analytics
          </p>
        </div>

        <div className="analytics-page__controls">
          <select
            className="analytics-select"
            value={timeRange}
            onChange={(event) => handleTimeRangeChange(event.target.value)}
            aria-label="Analytics time range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last 12 months</option>
          </select>

          <button type="button" className="analytics-export-button">
            <Download size={16} />
            Export
          </button>
        </div>
      </header>

      {loadError && (
        <div className="analytics-page__error" role="alert">
          {loadError}
        </div>
      )}

      <AnalyticsStats stats={stats} />

      <div className="analytics-grid analytics-grid--two">
        <AnalyticsSection
          title="Daily Revenue"
          actions={
            <div className="analytics-period-buttons">
              <button type="button">7D</button>
              <button type="button" className="is-active">30D</button>
              <button type="button">90D</button>
            </div>
          }
        >
          <Bar
            data={dailyRevenue ?? emptyChart}
            options={{
              ...chartOptions,
              plugins: { ...chartOptions.plugins, legend: { display: false } },
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  ticks: {
                    ...chartOptions.scales.y.ticks,
                    callback: (value) =>
                      formatCurrency(Number(value)).replace('.00', ''),
                  },
                },
              },
            }}
          />
        </AnalyticsSection>

        <AnalyticsSection title="Monthly Revenue">
          <Bar
            data={monthlyRevenue ?? emptyChart}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  ticks: {
                    ...chartOptions.scales.y.ticks,
                    callback: (value) =>
                      formatCurrency(Number(value)).replace('.00', ''),
                  },
                },
              },
            }}
          />
        </AnalyticsSection>
      </div>

      <div className="analytics-grid analytics-grid--two">
        <AnalyticsSection title="Seller Growth">
          <Line
            data={sellerGrowth ?? emptyChart}
            options={{
              ...chartOptions,
              plugins: { ...chartOptions.plugins, legend: { display: false } },
            }}
          />
        </AnalyticsSection>

        <AnalyticsSection title="Plan Distribution" chartClassName="analytics-donut">
          <Doughnut
            data={planDistribution ?? emptyChart}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'bottom',
                  labels: chartOptions.plugins.legend.labels,
                },
              },
              cutout: '62%',
            }}
          />
        </AnalyticsSection>
      </div>

      <div className="analytics-grid analytics-grid--two">
        <AnalyticsSection title="Order Status Distribution" chartClassName="analytics-donut">
          <Doughnut
            data={orderStatus ?? emptyChart}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'bottom',
                  labels: chartOptions.plugins.legend.labels,
                },
              },
              cutout: '62%',
            }}
          />
        </AnalyticsSection>
      </div>

      <AnalyticsSummary
        formatCurrency={formatCurrency}
        topSellers={topSellers}
        activities={activities}
      />
    </div>
  );
};

export default Analytics;
