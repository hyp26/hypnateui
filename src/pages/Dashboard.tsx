import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  ShoppingBag, 
  MessageCircle, 
  Users,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-primary-50 rounded-lg">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      {trend && (
        <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
          {trendUp ? '+' : '-'}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

export const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <div className="text-sm text-gray-500">Last updated: Just now</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('dashboard.revenue')} 
          value={formatCurrency(12450)} 
          icon={TrendingUp} 
          trend="12.5" 
          trendUp={true} 
        />
        <StatCard 
          title={t('dashboard.orders')} 
          value="24" 
          icon={ShoppingBag} 
          trend="4.2" 
          trendUp={true} 
        />
        <StatCard 
          title={t('dashboard.active_chats')} 
          value="8" 
          icon={MessageCircle} 
        />
        <StatCard 
          title="Total Customers" 
          value="1,240" 
          icon={Users} 
          trend="2.1" 
          trendUp={false} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3eb4c0" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3eb4c0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3eb4c0" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('dashboard.setup_checklist')}</h3>
          <div className="space-y-4">
            {[
              { label: 'Verify Business Details', done: true },
              { label: 'Connect Sales Channels', done: true },
              { label: 'Upload Product Catalog', done: true },
              { label: 'Setup Payment Gateway', done: false },
              { label: 'Configure Auto-replies', done: false },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {item.done ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span className={`text-sm ${item.done ? 'text-gray-500 line-through' : 'text-gray-700 font-medium'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-colors">
            Complete Setup
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{t('dashboard.recent_orders')}</h3>
          <button className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">#ORD-2024-{100 + i}</td>
                  <td className="px-6 py-4">Rahul Sharma</td>
                  <td className="px-6 py-4">Cotton Kurta (Blue)</td>
                  <td className="px-6 py-4">₹1,299</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
