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

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, ArcElement);

const revenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    { label: '2024', data: [120, 190, 300, 500, 700, 900, 1100, 1300, 1500, 1700, 1900, 2100], borderColor: '#159c91', backgroundColor: 'rgba(21,156,145,.08)', borderWidth: 2, tension: .35, pointRadius: 3, pointHoverRadius: 5 },
    { label: '2023', data: [100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.08)', borderWidth: 2, tension: .35, pointRadius: 3, pointHoverRadius: 5 },
  ],
};

const planData = {
  labels: ['Starter', 'Pro', 'Business'],
  datasets: [{ data: [45, 35, 20], backgroundColor: ['#159c91', '#3b82f6', '#8b5cf6'], borderWidth: 0, hoverOffset: 4 }],
};

const sellerGrowthData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{ label: 'New Sellers', data: [45, 67, 89, 120, 156, 189], backgroundColor: '#159c91', borderRadius: 5, maxBarThickness: 58 }],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 450 },
};

export const DashboardCharts: React.FC = () => (
  <section className="dashboard-chart-grid" aria-label="Dashboard charts">
    <article className="dashboard-panel dashboard-chart-panel">
      <header className="dashboard-panel__header">
        <h2>Revenue Overview</h2>
        <select aria-label="Revenue year" defaultValue="2024">
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
      </header>
      <div className="dashboard-chart dashboard-chart--line">
        <Line
          data={revenueData}
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
            data={planData}
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
          data={sellerGrowthData}
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
