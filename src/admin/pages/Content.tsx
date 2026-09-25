import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ContentTabs from '../components/Content/ContentTabs';
import ContentFilters from '../components/Content/ContentFilters';
import AnnouncementsTable from '../components/Content/AnnouncementsTable';
import FAQTable from '../components/Content/FAQTable';
import '../styles/Content.css';
import type { Announcement, FAQItem } from '../types';

const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'New Feature: Hypnate X',
    content:
      'We are excited to announce the launch of Hypnate X, our advanced AI-powered features for business plan users.',
    type: 'FEATURE',
    status: 'PUBLISHED',
    createdAt: '2024-01-20T10:00:00Z',
    expiresAt: '2024-02-20T00:00:00Z',
  },
  {
    id: 2,
    title: 'Scheduled Maintenance',
    content:
      'We will be performing maintenance on our servers this weekend. Expect brief downtime.',
    type: 'MAINTENANCE',
    status: 'PUBLISHED',
    createdAt: '2024-01-25T14:00:00Z',
    expiresAt: '2024-01-28T00:00:00Z',
  },
  {
    id: 3,
    title: 'Holiday Hours',
    content:
      'Our support team will have reduced hours during the Republic Day holiday.',
    type: 'GENERAL',
    status: 'DRAFT',
    createdAt: '2024-01-15T09:00:00Z',
    expiresAt: '2024-01-27T00:00:00Z',
  },
];

const mockFAQs: FAQItem[] = [
  {
    id: 1,
    question: 'How do I get started with Hypnate?',
    answer:
      'Sign up for a free 7-day trial, complete the onboarding process, and start managing your D2C business.',
    category: 'Getting Started',
    order: 1,
    isPublished: true,
  },
  {
    id: 2,
    question: 'What payment methods are supported?',
    answer:
      'We support Razorpay, Stripe, and Cash on Delivery (COD) payment gateways.',
    category: 'Payments',
    order: 2,
    isPublished: true,
  },
  {
    id: 3,
    question: 'Can I upgrade my plan later?',
    answer:
      'Yes, you can upgrade your plan at any time from your dashboard. The new plan will be prorated.',
    category: 'Billing',
    order: 3,
    isPublished: true,
  },
  {
    id: 4,
    question: 'How do I connect WhatsApp?',
    answer:
      'Go to Settings > Channels and follow the WhatsApp Business API integration steps.',
    category: 'Integrations',
    order: 4,
    isPublished: true,
  },
  {
    id: 5,
    question: 'Is there a mobile app?',
    answer:
      'Currently, Hypnate is web-only. We are working on mobile apps for iOS and Android.',
    category: 'General',
    order: 5,
    isPublished: false,
  },
];

const announcementTypeOptions = [
  'All',
  'Feature',
  'Maintenance',
  'General',
  'Security',
];

const faqCategoryOptions = [
  'All',
  'Getting Started',
  'Payments',
  'Billing',
  'Integrations',
  'General',
];

const statusOptions = ['All', 'Published', 'Draft'];

export const Content: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'announcements' | 'faq'>(
    'announcements',
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnnouncements(mockAnnouncements);
      setFaqs(mockFAQs);
      setIsLoading(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSearchQuery('');
    setTypeFilter('All');
    setStatusFilter('All');
    setCategoryFilter('All');
  }, [activeTab]);

  const filteredAnnouncements = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return announcements.filter((announcement) => {
      const matchesSearch =
        !query ||
        announcement.title.toLowerCase().includes(query) ||
        announcement.content.toLowerCase().includes(query);

      const matchesType =
        typeFilter === 'All' ||
        announcement.type.toLowerCase() === typeFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Published'
          ? announcement.status === 'PUBLISHED'
          : announcement.status === 'DRAFT');

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [announcements, searchQuery, typeFilter, statusFilter]);

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

  const isAnnouncements = activeTab === 'announcements';

  return (
    <div className="content-page">
      <header className="content-page__header">
        <div>
          <h1 className="content-page__title">Content Management</h1>
          <p className="content-page__subtitle">
            Manage announcements, FAQs, and other content
          </p>
        </div>

        <Link
          to={`/admin/${isAnnouncements ? 'announcements' : 'faq'}/new`}
          className="content-primary-button"
        >
          <Plus size={17} />
          Add {isAnnouncements ? 'Announcement' : 'FAQ'}
        </Link>
      </header>

      <section className="content-card">
        <ContentTabs activeTab={activeTab} onChange={setActiveTab} />

        <ContentFilters
          activeTab={activeTab}
          searchQuery={searchQuery}
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          typeOptions={announcementTypeOptions}
          categoryOptions={faqCategoryOptions}
          statusOptions={statusOptions}
          onSearchChange={setSearchQuery}
          onTypeChange={setTypeFilter}
          onStatusChange={setStatusFilter}
          onCategoryChange={setCategoryFilter}
        />

        {isAnnouncements ? (
          <AnnouncementsTable
            announcements={filteredAnnouncements}
            isLoading={isLoading}
          />
        ) : (
          <FAQTable faqs={filteredFAQs} isLoading={isLoading} />
        )}
      </section>
    </div>
  );
};

export default Content;
