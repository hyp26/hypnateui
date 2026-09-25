import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  Store,
  CreditCard,
  ShoppingCart,
  DollarSign,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  Truck
} from 'lucide-react';
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
  DoughnutController
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

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
  DoughnutController
);

// Mock data
const dailyRevenueData = {
  labels: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }),
  datasets: [
    {
      label: 'Revenue',
      data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50000) + 10000),
      backgroundColor: 'rgba(13, 148, 136, 0.2)',
      borderColor: '#0d9488',
      borderWidth: 2,
    },
  ],
};

const monthlyRevenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: '2024',
      data: [120000, 150000, 180000, 210000, 240000, 270000, 300000, 330000, 360000, 390000, 420000, 450000],
      backgroundColor: 'rgba(13, 148, 136, 0.8)',
      borderRadius: 4,
    },
    {
      label: '2023',
      data: [80000, 95000, 110000, 130000, 150000, 170000, 190000, 210000, 230000, 250000, 270000, 290000],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 4,
    },
  ],
};

const sellerGrowthData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'New Sellers',
      data: [45, 67, 89, 120, 156, 189],
      borderColor: '#0d9488',
      backgroundColor: 'transparent',
      tension: 0.4,
      pointBackgroundColor: '#0d9488',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    },
  ],
};

const planDistributionData = {
  labels: ['Starter', 'Pro', 'Business'],
  datasets: [
    {
      data: [45, 35, 20],
      backgroundColor: ['#0d9488', '#3b82f6', '#8b5cf6'],
      borderWidth: 0,
    },
  ],
};

const channelUsageData = {
  labels: ['WhatsApp', 'Instagram', 'Facebook', 'Telegram'],
  datasets: [
    {
      data: [65, 45, 35, 25],
      backgroundColor: ['#25d366', '#e1306c', '#1877f2', '#26a5e4'],
      borderWidth: 0,
    },
  ],
};

const orderStatusData = {
  labels: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
  datasets: [
    {
      data: [12, 25, 38, 56, 89, 15],
      backgroundColor: [
        '#94a3b8',
        '#3b82f6',
        '#f59e0b',
        '#8b5cf6',
        '#10b981',
        '#ef4444'
      ],
      borderWidth: 0,
    },
  ],
};

const stats = [
  {
    id: 'total-revenue',
    title: 'Total Revenue',
    value: '₹12,45,678',
    change: 15.3,
    icon: <DollarSign size={24} />,
    color: '#0d9488',
  },
  {
    id: 'total-orders',
    title: 'Total Orders',
    value: '2,456',
    change: 12.5,
    icon: <ShoppingCart size={24} />,
    color: '#3b82f6',
  },
  {
    id: 'total-sellers',
    title: 'Total Sellers',
    value: '1,247',
    change: 8.2,
    icon: <Store size={24} />,
    color: '#8b5cf6',
  },
  {
    id: 'total-customers',
    title: 'Total Customers',
    value: '24,589',
    change: 18.7,
    icon: <Users size={24} />,
    color: '#f59e0b',
  },
];

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform performance and usage analytics</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <select
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last 12 months</option>
          </select>
          <button className="admin-btn admin-btn-secondary text-sm">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const isPositive = stat.change >= 0;
          return (
            <div
              key={stat.id}
              className="admin-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{stat.title}</div>
                  <div className={`text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '↑' : '↓'} {Math.abs(stat.change)}% from last period
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50">
                  {stat.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daily Revenue</h2>
            <div className="flex gap-1">
              <button className="admin-btn admin-btn-ghost text-xs px-2 py-1">7D</button>
              <button className="admin-btn admin-btn-primary text-xs px-2 py-1">30D</button>
              <button className="admin-btn admin-btn-ghost text-xs px-2 py-1">90D</button>
            </div>
          </div>
          <div className="h-64">
            <Bar
              data={dailyRevenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                      callback: (value: string | number) =>
                        formatCurrency(typeof value === 'number' ? value : Number(value)),
                    },
                  },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly Revenue Comparison</h2>
          </div>
          <div className="h-64">
            <Bar
              data={monthlyRevenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { usePointStyle: true } },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                      callback: (value: string | number) =>
                        formatCurrency(typeof value === 'number' ? value : Number(value)),
                    },
                  },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Seller Growth</h2>
          </div>
          <div className="h-64">
            <Line
              data={sellerGrowthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Plan Distribution</h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full max-w-xs">
              <Doughnut
                data={planDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Channel Usage</h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full max-w-xs">
              <Doughnut
                data={channelUsageData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Order Status Distribution</h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full max-w-xs">
              <Doughnut
                data={orderStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Performing Sellers</h3>
          <div className="space-y-3">
            {[
              { name: 'Priya Boutique', revenue: 3456789, orders: 2156 },
              { name: 'Rahul Fashion House', revenue: 1245678, orders: 892 },
              { name: 'Furniture World', revenue: 890123, orders: 345 },
            ].map((seller, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-300 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{seller.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{seller.orders} orders</div>
                </div>
                <div className="font-semibold text-green-600">{formatCurrency(seller.revenue)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'New order', entity: '#ORD-2024-001239', time: '2 min ago', type: 'order' },
              { action: 'Payment received', entity: '₹2,499', time: '15 min ago', type: 'payment' },
              { action: 'Seller registered', entity: 'New Boutique', time: '1 hour ago', type: 'seller' },
              { action: 'Order shipped', entity: '#ORD-2024-001238', time: '3 hours ago', type: 'shipping' },
            ].map((activity, index) => {
              const icons: Record<string, React.ReactNode> = {
                order: <ShoppingCart size={16} />,
                payment: <CreditCard size={16} />,
                seller: <Store size={16} />,
                shipping: <Truck size={16} />,
              };
              const colors: Record<string, string> = {
                order: 'bg-blue-100 text-blue-600',
                payment: 'bg-green-100 text-green-600',
                seller: 'bg-purple-100 text-purple-600',
                shipping: 'bg-amber-100 text-amber-600',
              };
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[activity.type]}`}>
                    {icons[activity.type]}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{activity.action}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{activity.entity}</div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};