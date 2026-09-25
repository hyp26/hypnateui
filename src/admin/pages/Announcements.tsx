import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Announcement } from '../types';
import AnnouncementStats from '../components/Announcements/AnnouncementStats';
import AnnouncementFilters from '../components/Announcements/AnnouncementFilters';
import AnnouncementList from '../components/Announcements/AnnouncementList';
import '../styles/Announcements.css';

const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'New Feature: Hypnate X',
    content:
      'We are excited to announce the launch of Hypnate X, our advanced AI-powered features for business plan users. This includes automated responses, advanced analytics, and priority support.',
    type: 'FEATURE',
    status: 'PUBLISHED',
    createdAt: '2024-01-20T10:00:00Z',
    expiresAt: '2024-02-20T00:00:00Z',
  },
  {
    id: 2,
    title: 'Scheduled Maintenance',
    content:
      'We will be performing maintenance on our servers this weekend from 2:00 AM to 4:00 AM IST. Expect brief downtime during this period.',
    type: 'MAINTENANCE',
    status: 'PUBLISHED',
    createdAt: '2024-01-25T14:00:00Z',
    expiresAt: '2024-01-28T00:00:00Z',
  },
  {
    id: 3,
    title: 'Holiday Hours',
    content:
      'Our support team will have reduced hours during the Republic Day holiday on January 26th. We will resume normal operations on January 27th.',
    type: 'GENERAL',
    status: 'DRAFT',
    createdAt: '2024-01-15T09:00:00Z',
    expiresAt: '2024-01-27T00:00:00Z',
  },
  {
    id: 4,
    title: 'Security Update',
    content:
      'We have implemented enhanced security measures to protect your data. All users are required to update their passwords within the next 7 days.',
    type: 'SECURITY',
    status: 'PUBLISHED',
    createdAt: '2024-01-22T16:00:00Z',
    expiresAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 5,
    title: 'New Integration: Instagram Shopping',
    content:
      'You can now connect your Instagram Shopping account directly to Hypnate. This allows you to sync products and manage orders seamlessly.',
    type: 'FEATURE',
    status: 'PUBLISHED',
    createdAt: '2024-01-18T11:00:00Z',
    expiresAt: '2024-03-01T00:00:00Z',
  },
];

const typeOptions = ['All', 'Feature', 'Maintenance', 'General', 'Security'];
const statusOptions = ['All', 'Published', 'Draft', 'Expired'];

export const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnnouncements(mockAnnouncements);
      setIsLoading(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredAnnouncements = useMemo(() => {
    const now = new Date();
    const query = searchQuery.trim().toLowerCase();

    return announcements.filter((announcement) => {
      const matchesSearch =
        !query ||
        announcement.title.toLowerCase().includes(query) ||
        announcement.content.toLowerCase().includes(query);

      const matchesType =
        typeFilter === 'All' ||
        announcement.type === typeFilter.toUpperCase();

      const isExpired =
        announcement.status === 'PUBLISHED' &&
        !!announcement.expiresAt &&
        new Date(announcement.expiresAt) <= now;

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Published' &&
          announcement.status === 'PUBLISHED' &&
          !isExpired) ||
        (statusFilter === 'Draft' && announcement.status === 'DRAFT') ||
        (statusFilter === 'Expired' && isExpired);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [announcements, searchQuery, typeFilter, statusFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="announcements-page">
      <header className="announcements-page__header">
        <div>
          <h1 className="announcements-page__title">Announcements</h1>
          <p className="announcements-page__subtitle">
            Manage platform-wide announcements
          </p>
        </div>

        <Link
          to="/admin/announcements/new"
          className="announcements-primary-button"
        >
          <Plus size={17} />
          Create Announcement
        </Link>
      </header>

      <AnnouncementStats announcements={announcements} />

      <section className="announcements-card announcements-card--filters">
        <AnnouncementFilters
          searchQuery={searchQuery}
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          typeOptions={typeOptions}
          statusOptions={statusOptions}
          onSearchChange={setSearchQuery}
          onTypeChange={setTypeFilter}
          onStatusChange={setStatusFilter}
          onClear={clearFilters}
        />
      </section>

      <AnnouncementList
        announcements={announcements}
        filteredAnnouncements={filteredAnnouncements}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Announcements;
