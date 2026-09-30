import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  adminAnnouncementsApi,
  adminFaqApi,
  getApiErrorMessage,
} from '../lib/adminApi';
import ContentTabs from '../components/Content/ContentTabs';
import ContentFilters from '../components/Content/ContentFilters';
import AnnouncementsTable from '../components/Content/AnnouncementsTable';
import FAQTable from '../components/Content/FAQTable';
import '../styles/Content.css';
import type { Announcement, FAQItem } from '../types';

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      adminAnnouncementsApi.list({ limit: 100 }),
      adminFaqApi.list({ limit: 100 }),
    ]).then(([announcementsResult, faqsResult]) => {
      if (cancelled) return;

      if (announcementsResult.status === 'fulfilled') {
        setAnnouncements(announcementsResult.value.data);
      } else {
        setLoadError(getApiErrorMessage(announcementsResult.reason));
      }

      if (faqsResult.status === 'fulfilled') {
        setFaqs(faqsResult.value.data);
      } else if (!loadError) {
        setLoadError(getApiErrorMessage(faqsResult.reason));
      }

      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          to={isAnnouncements ? '/admin/announcements' : '/admin/faq'}
          className="content-primary-button"
        >
          <Plus size={17} />
          Add {isAnnouncements ? 'Announcement' : 'FAQ'}
        </Link>
      </header>

      {loadError && (
        <div className="content-page__error" role="alert">
          {loadError}
        </div>
      )}

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
