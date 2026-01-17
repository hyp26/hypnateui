import React from 'react';
import { CreditCard, Download, Filter, Search, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';

export const Payments = () => {
  const transactions = [
    { id: 'TXN-9821', customer: 'Rahul Sharma', amount: 1299, status: 'success', date: 'Today, 10:30 AM', type: 'credit' },
    { id: 'TXN-9820', customer: 'Priya Singh', amount: 450, status: 'success', date: 'Yesterday, 4:15 PM', type: 'credit' },
    { id: 'RFD-0021', customer: 'Amit Verma', amount: 899, status: 'processed', date: 'Oct 22, 2024', type: 'debit' },
    { id: 'TXN-9819', customer: 'Sneha Gupta', amount: 2100, status: 'failed', date: 'Oct 21, 2024', type: 'credit' },
    { id: 'TXN-9818', customer: 'Vikram Malhotra', amount: 1500, status: 'success', date: 'Oct 20, 2024', type: 'credit' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button>
            <CreditCard className="w-4 h-4 mr-2" /> Create Payment Link
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Collected</h3>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(45200)}</span>
            <span className="text-green-600 text-sm font-medium flex items-center">+12% <ArrowUpRight className="w-4 h-4" /></span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Pending Settlements</h3>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(3400)}</span>
            <span className="text-gray-500 text-sm">Next payout: Tomorrow</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Refunds Processed</h3>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(899)}</span>
            <span className="text-gray-500 text-sm">Last 30 days</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by transaction ID or customer..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>

        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{txn.id}</td>
                <td className="px-6 py-4">{txn.customer}</td>
                <td className="px-6 py-4 text-gray-500">{txn.date}</td>
                <td className="px-6 py-4">
                  <span className={txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                    {txn.type === 'credit' ? '+' : '-'} {formatCurrency(txn.amount)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    txn.status === 'success' ? 'bg-green-100 text-green-700' :
                    txn.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
