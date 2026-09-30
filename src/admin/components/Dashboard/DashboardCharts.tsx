import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import type { ChartData } from '../../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, ArcElement);

interface DashboardChartsProps {
  revenueChart: ChartData | null;
  planDistribution: ChartData | null;
  sellerGrowth: ChartData | null;
}

const emptyChart: ChartData = { labels: [], datasets: [] };

const buildLineData = (chart: ChartData | null): ChartData =>
  chart
    ? {
        labels: chart.labels,
        datasets: chart.datasets.map((dataset) => ({
          ...dataset,
          label: dataset.label || 'Revenue',
          borderColor: dataset.borderColor || '#159c91',
          backgroundColor: dataset.backgroundColor || 'rgba(21,156,145,.08)',
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5,
        })),
      }
    : emptyChart;

const buildDoughnutData = (chart: ChartData | null): ChartData =>
  chart && chart.labels.length > 0
    ? {
        labels: chart.labels,
        datasets: [
          {
            data: chart.datasets[0]?.data ?? [],
            backgroundColor: chart.datasets[0]?.backgroundColor ?? ['#159c91', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      }
    : emptyChart;

const buildBarData = (chart: ChartData | null): ChartData =>
  chart && chart.labels.length > 0
    ? {
        labels: chart.labels,
        datasets: [
          {
            label: chart.datasets[0]?.label || 'New Sellers',
            data: chart.datasets[0]?.data ?? [],
            backgroundColor: '#159c91',
            borderRadius: 5,
            maxBarThickness: 58,
          },
        ],
      }
    : emptyChart;

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 450 },
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  revenueChart,
  planDistribution,
  sellerGrowth,
}) => (
  <section className="dashboard-chart-grid" aria-label="Dashboard charts">
    <article className="dashboard-panel dashboard-chart-panel">
      <header className="dashboard-panel__header">
        <h2>Revenue Overview</h2>
      </header>
      <div className="dashboard-chart dashboard-chart--line">
        <Line
          data={buildLineData(revenueChart)}
          options={{
            ...chartOptions,
            plugins: { legend: { position: 'top', labels: { color: '#52627a', usePointStyle: true, boxWidth: 9, padding: 18 } } },
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(82,98,122,.12)' }, ticks: { color: '#66758c' } },
              x: { grid: { display: false }, ticks: { color: '#66758c' } },
            },
          }}
        />
      </div>
    </article>

    <article className="dashboard-panel dashboard-chart-panel">
      <header className="dashboard-panel__header">
        <h2>Plan Distribution</h2>
      </header>
      <div className="dashboard-chart dashboard-chart--donut">
        <div className="dashboard-donut-wrap">
          <Doughnut
            data={buildDoughnutData(planDistribution)}
            options={{
              ...chartOptions,
              cutout: '62%',
              plugins: { legend: { position: 'bottom', labels: { color: '#52627a', usePointStyle: true, boxWidth: 9, padding: 18 } } },
            }}
          />
        </div>
      </div>
    </article>

    <article className="dashboard-panel dashboard-chart-panel">
      <header className="dashboard-panel__header">
        <h2>Seller Growth</h2>
        <Link to="/admin/sellers" className="dashboard-panel__link">View All <ArrowRight size={15} /></Link>
      </header>
      <div className="dashboard-chart dashboard-chart--bar">
        <Bar
          data={buildBarData(sellerGrowth)}
          options={{
            ...chartOptions,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(82,98,122,.12)' }, ticks: { color: '#66758c' } },
              x: { grid: { display: false }, ticks: { color: '#66758c' } },
            },
          }}
        />
      </div>
    </article>
  </section>
);
