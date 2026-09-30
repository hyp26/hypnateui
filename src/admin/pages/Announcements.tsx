import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { adminAnnouncementsApi, getApiErrorMessage } from '../lib/adminApi';
import type { Announcement } from '../types';
import AnnouncementStats from '../components/Announcements/AnnouncementStats';
import AnnouncementFilters from '../components/Announcements/AnnouncementFilters';
import AnnouncementList from '../components/Announcements/AnnouncementList';
import '../styles/Announcements.css';

const typeOptions = ['All', 'Feature', 'Maintenance', 'General', 'Security'];
const statusOptions = ['All', 'Published', 'Draft', 'Expired'];

export const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;

    adminAnnouncementsApi
      .list({ limit: 100 })
      .then((response) => {
        if (cancelled) return;
        setAnnouncements(response.data);
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
        !!(announcement.expiresAt || announcement.endsAt) &&
        new Date((announcement.expiresAt || announcement.endsAt) as string) <= now;

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
          to="/admin/announcements"
          className="announcements-primary-button"
        >
          <Plus size={17} />
          Create Announcement
        </Link>
      </header>

      <AnnouncementStats announcements={announcements} />

      {loadError && (
        <div className="announcements-card announcements-card--filters">
          <span role="alert">{loadError}</span>
        </div>
      )}

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
