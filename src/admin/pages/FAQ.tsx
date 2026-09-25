import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  HelpCircle,
  Tag,
  Calendar,
  CheckCircle,
  XCircle,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { FAQItem } from '../types';

// Mock data
const mockFAQs: FAQItem[] = [
  {
    id: 1,
    question: 'How do I get started with Hypnate?',
    answer: 'Sign up for a free 7-day trial, complete the onboarding process, and start managing your D2C business. You can create an account at hypnate.in/signup.',
    category: 'Getting Started',
    order: 1,
    isPublished: true,
    createdAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 2,
    question: 'What payment methods are supported?',
    answer: 'We support Razorpay, Stripe, and Cash on Delivery (COD) payment gateways. You can configure these in your Settings > Payments section.',
    category: 'Payments',
    order: 2,
    isPublished: true,
    createdAt: '2024-01-20T09:00:00Z',
  },
  {
    id: 3,
    question: 'Can I upgrade my plan later?',
    answer: 'Yes, you can upgrade your plan at any time from your dashboard. The new plan will be prorated based on your current billing cycle.',
    category: 'Billing',
    order: 3,
    isPublished: true,
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 4,
    question: 'How do I connect WhatsApp?',
    answer: 'Go to Settings > Channels and follow the WhatsApp Business API integration steps. You will need a verified WhatsApp Business account.',
    category: 'Integrations',
    order: 4,
    isPublished: true,
    createdAt: '2024-01-20T11:00:00Z',
  },
  {
    id: 5,
    question: 'What is the pricing for Hypnate?',
    answer: 'We offer three plans: Starter at ₹999/month, Pro at ₹1999/month, and Business at ₹5000/month. All plans include a 7-day free trial.',
    category: 'Billing',
    order: 5,
    isPublished: true,
    createdAt: '2024-01-20T12:00:00Z',
  },
  {
    id: 6,
    question: 'How do I add products to my catalog?',
    answer: 'You can add products manually through the Products section, or bulk import using an Excel file. We support CSV and XLSX formats.',
    category: 'Products',
    order: 6,
    isPublished: true,
    createdAt: '2024-01-21T08:00:00Z',
  },
  {
    id: 7,
    question: 'Can I manage multiple stores?',
    answer: 'Currently, each Hypnate account supports one store. If you need multiple stores, please contact our support team.',
    category: 'General',
    order: 7,
    isPublished: false,
    createdAt: '2024-01-21T09:00:00Z',
  },
];

const categoryOptions = ['All', 'Getting Started', 'Payments', 'Billing', 'Integrations', 'Products', 'Orders', 'General', 'Support'];
const statusOptions = ['All', 'Published', 'Draft'];

export const FAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedFAQ, setExpandedFAQ] = useState<string | number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFaqs(mockFAQs);
      setFilteredFAQs(mockFAQs);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = [...faqs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter((faq) => faq.category === categoryFilter);
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(
        (faq) => statusFilter === 'Published' ? faq.isPublished : !faq.isPublished
      );
    }

    setFilteredFAQs(filtered);
  }, [faqs, searchQuery, categoryFilter, statusFilter]);

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? (
      <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded-full">
        Published
      </span>
    ) : (
      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
        Draft
      </span>
    );
  };

  const toggleFAQ = (id: string | number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">FAQ Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage frequently asked questions</p>
        </div>
        <Link to="/admin/faq/new" className="admin-btn admin-btn-primary mt-4 sm:mt-0">
          <Plus size={16} /> Add FAQ
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total FAQs</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{faqs.length}</div>
        </div>
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Published</div>
          <div className="text-2xl font-bold text-green-600">{faqs.filter((f) => f.isPublished).length}</div>
        </div>
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Categories</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {new Set(faqs.map((f) => f.category)).size}
          </div>
        </div>
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Order</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {faqs.length > 0 ? (faqs.reduce((sum, f) => sum + f.order, 0) / faqs.length).toFixed(1) : '0'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[240px]">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Search size={16} /> Search
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: 160 }}
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 140 }}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <button
              className="admin-btn admin-btn-secondary text-sm"
              onClick={() => {
                setCategoryFilter('All');
                setStatusFilter('All');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="admin-card">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle size={64} className="mx-auto text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No FAQs found</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters or add a new FAQ
            </p>
            <Link to="/admin/faq/new" className="admin-btn admin-btn-primary mt-6">
              <Plus size={16} /> Add FAQ
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFAQs.map((faq, index) => (
              <div
                key={faq.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 cursor-pointer"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-300 font-bold">
                        {index + 1}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{faq.question}</div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-medium rounded">
                        {faq.category}
                      </span>
                      {getStatusBadge(faq.isPublished)}
                    </div>
                  </div>
                  <button
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </div>

                {expandedFAQ === faq.id && (
                  <div className="p-4 bg-white dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {faq.answer}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          Created: {faq.createdAt
                            ? new Date(faq.createdAt).toLocaleDateString()
                            : '—'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag size={14} /> Order: {faq.order}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="admin-btn admin-btn-ghost text-xs">
                          <Edit size={14} /> Edit
                        </button>
                        <button className="admin-btn admin-btn-danger text-xs">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};