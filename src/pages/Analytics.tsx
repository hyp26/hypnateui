import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';

const revenueData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 6890 },
  { name: 'Sat', value: 8390 },
  { name: 'Sun', value: 6490 },
];

const sourceData = [
  { name: 'WhatsApp', value: 65, color: '#22c55e' },
  { name: 'Instagram', value: 25, color: '#ec4899' },
  { name: 'Facebook', value: 10, color: '#3b82f6' },
];

export const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" /> Last 7 Days
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3eb4c0" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3eb4c0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3eb4c0" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Source */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Sales by Channel</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="block text-3xl font-bold text-gray-900">100%</span>
                <span className="text-xs text-gray-500">Total Sales</span>
              </div>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {sourceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Conversation to Order Rate</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">18.5%</p>
          <p className="text-green-600 text-xs mt-1 flex items-center">↑ 2.1% vs last week</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Average Order Value</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹1,450</p>
          <p className="text-red-600 text-xs mt-1 flex items-center">↓ 1.2% vs last week</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Return Rate</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">2.4%</p>
          <p className="text-green-600 text-xs mt-1 flex items-center">↓ 0.5% (Good)</p>
        </div>
      </div>
    </div>
  );
};
