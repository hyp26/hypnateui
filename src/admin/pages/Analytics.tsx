import React, { useEffect, useState } from 'react';
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
import AnalyticsStats from '../components/Analytics/AnalyticsStats';
import AnalyticsSection from '../components/Analytics/AnalyticsSection';
import AnalyticsSummary from '../components/Analytics/AnalyticsSummary';
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

const dailyRevenueData = {
  labels: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }),
  datasets: [
    {
      label: 'Revenue',
      data: [
        18000, 24000, 21000, 31000, 28000, 35000, 39000, 32000, 44000, 41000,
        46000, 38000, 49000, 52000, 47000, 56000, 51000, 58000, 54000, 62000,
        59000, 65000, 61000, 68000, 64000, 71000, 69000, 76000, 73000, 80000,
      ],
      backgroundColor: 'rgba(42, 174, 184, 0.18)',
      borderColor: '#1999a3',
      borderWidth: 2,
      borderRadius: 5,
    },
  ],
};

const monthlyRevenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: '2024',
      data: [120000, 150000, 180000, 210000, 240000, 270000, 300000, 330000, 360000, 390000, 420000, 450000],
      backgroundColor: '#2aaeb8',
      borderRadius: 5,
    },
    {
      label: '2023',
      data: [80000, 95000, 110000, 130000, 150000, 170000, 190000, 210000, 230000, 250000, 270000, 290000],
      backgroundColor: '#4d82e8',
      borderRadius: 5,
    },
  ],
};

const sellerGrowthData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'New Sellers',
      data: [45, 67, 89, 120, 156, 189],
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
};

const planDistributionData = {
  labels: ['Starter', 'Pro', 'Business'],
  datasets: [
    {
      data: [45, 35, 20],
      backgroundColor: ['#2aa39a', '#4d82e8', '#8057df'],
      borderWidth: 0,
    },
  ],
};

const channelUsageData = {
  labels: ['WhatsApp', 'Instagram', 'Facebook', 'Telegram'],
  datasets: [
    {
      data: [65, 45, 35, 25],
      backgroundColor: ['#28a96b', '#d94c79', '#4a78d8', '#3699c5'],
      borderWidth: 0,
    },
  ],
};

const orderStatusData = {
  labels: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
  datasets: [
    {
      data: [12, 25, 38, 56, 89, 15],
      backgroundColor: ['#94a3b8', '#4d82e8', '#e39a21', '#8057df', '#22a56b', '#df555b'],
      borderWidth: 0,
    },
  ],
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

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 300);
    return () => window.clearTimeout(timer);
  }, []);

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
            onChange={(event) => setTimeRange(event.target.value)}
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

      <AnalyticsStats />

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
            data={dailyRevenueData}
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

        <AnalyticsSection title="Monthly Revenue Comparison">
          <Bar
            data={monthlyRevenueData}
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
            data={sellerGrowthData}
            options={{
              ...chartOptions,
              plugins: { ...chartOptions.plugins, legend: { display: false } },
            }}
          />
        </AnalyticsSection>

        <AnalyticsSection title="Plan Distribution" chartClassName="analytics-donut">
          <Doughnut
            data={planDistributionData}
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
        <AnalyticsSection title="Channel Usage" chartClassName="analytics-donut">
          <Doughnut
            data={channelUsageData}
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

        <AnalyticsSection title="Order Status Distribution" chartClassName="analytics-donut">
          <Doughnut
            data={orderStatusData}
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

      <AnalyticsSummary formatCurrency={formatCurrency} />
    </div>
  );
};

export default Analytics;
