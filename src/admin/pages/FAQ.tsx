import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { FAQItem } from '../types';
import FAQStats from '../components/FAQ/FAQStats';
import FAQFilters from '../components/FAQ/FAQFilters';
import FAQList from '../components/FAQ/FAQList';
import '../styles/FAQ.css';

const mockFAQs: FAQItem[] = [
  {
    id: 1,
    question: 'How do I get started with Hypnate?',
    answer:
      'Sign up for a free 7-day trial, complete the onboarding process, and start managing your D2C business. You can create an account at hypnate.in/signup.',
    category: 'Getting Started',
    order: 1,
    isPublished: true,
    createdAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 2,
    question: 'What payment methods are supported?',
    answer:
      'We support Razorpay, Stripe, and Cash on Delivery (COD) payment gateways. You can configure these in your Settings > Payments section.',
    category: 'Payments',
    order: 2,
    isPublished: true,
    createdAt: '2024-01-20T09:00:00Z',
  },
  {
    id: 3,
    question: 'Can I upgrade my plan later?',
    answer:
      'Yes, you can upgrade your plan at any time from your dashboard. The new plan will be prorated based on your current billing cycle.',
    category: 'Billing',
    order: 3,
    isPublished: true,
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 4,
    question: 'How do I connect WhatsApp?',
    answer:
      'Go to Settings > Channels and follow the WhatsApp Business API integration steps. You will need a verified WhatsApp Business account.',
    category: 'Integrations',
    order: 4,
    isPublished: true,
    createdAt: '2024-01-20T11:00:00Z',
  },
  {
    id: 5,
    question: 'What is the pricing for Hypnate?',
    answer:
      'We offer three plans: Starter at ₹999/month, Pro at ₹1999/month, and Business at ₹5000/month. All plans include a 7-day free trial.',
    category: 'Billing',
    order: 5,
    isPublished: true,
    createdAt: '2024-01-20T12:00:00Z',
  },
  {
    id: 6,
    question: 'How do I add products to my catalog?',
    answer:
      'You can add products manually through the Products section, or bulk import using an Excel file. We support CSV and XLSX formats.',
    category: 'Products',
    order: 6,
    isPublished: true,
    createdAt: '2024-01-21T08:00:00Z',
  },
  {
    id: 7,
    question: 'Can I manage multiple stores?',
    answer:
      'Currently, each Hypnate account supports one store. If you need multiple stores, please contact our support team.',
    category: 'General',
    order: 7,
    isPublished: false,
    createdAt: '2024-01-21T09:00:00Z',
  },
];

const categoryOptions = [
  'All',
  'Getting Started',
  'Payments',
  'Billing',
  'Integrations',
  'Products',
  'Orders',
  'General',
  'Support',
];

const statusOptions = ['All', 'Published', 'Draft'];

export const FAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedFAQ, setExpandedFAQ] = useState<string | number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFaqs(mockFAQs);
      setIsLoading(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredFAQs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === 'All' || faq.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Published' ? faq.isPublished : !faq.isPublished);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [faqs, searchQuery, categoryFilter, statusFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="faq-page">
      <header className="faq-page__header">
        <div>
          <h1 className="faq-page__title">FAQ Management</h1>
          <p className="faq-page__subtitle">Manage frequently asked questions</p>
        </div>

        <Link to="/admin/faq/new" className="faq-primary-button">
          <Plus size={17} />
          Add FAQ
        </Link>
      </header>

      <FAQStats faqs={faqs} />

      <section className="faq-card faq-card--filters">
        <FAQFilters
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          categoryOptions={categoryOptions}
          statusOptions={statusOptions}
          onSearchChange={setSearchQuery}
          onCategoryChange={setCategoryFilter}
          onStatusChange={setStatusFilter}
          onClear={clearFilters}
        />
      </section>

      <FAQList
        faqs={faqs}
        filteredFAQs={filteredFAQs}
        isLoading={isLoading}
        expandedFAQ={expandedFAQ}
        onToggle={(id) => setExpandedFAQ(expandedFAQ === id ? null : id)}
      />
    </div>
  );
};

export default FAQ;
