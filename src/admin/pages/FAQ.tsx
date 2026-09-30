import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { adminFaqApi, getApiErrorMessage } from '../lib/adminApi';
import type { FAQItem } from '../types';
import FAQStats from '../components/FAQ/FAQStats';
import FAQFilters from '../components/FAQ/FAQFilters';
import FAQList from '../components/FAQ/FAQList';
import '../styles/FAQ.css';

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedFAQ, setExpandedFAQ] = useState<string | number | null>(null);

  useEffect(() => {
    let cancelled = false;

    adminFaqApi
      .list({ limit: 100 })
      .then((response) => {
        if (cancelled) return;
        setFaqs(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(getApiErrorMessage(error));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
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

        <Link to="/admin/faq" className="faq-primary-button">
          <Plus size={17} />
          Add FAQ
        </Link>
      </header>

      <FAQStats faqs={faqs} />

      {loadError && (
        <div className="faq-card faq-card--filters">
          <span role="alert">{loadError}</span>
        </div>
      )}

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
