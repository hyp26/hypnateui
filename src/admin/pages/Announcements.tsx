import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Megaphone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info
} from 'lucide-react';
import type { Announcement } from '../types';

// Mock data
const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'New Feature: Hypnate X',
    content: 'We are excited to announce the launch of Hypnate X, our advanced AI-powered features for business plan users. This includes automated responses, advanced analytics, and priority support.',
    type: 'FEATURE',
    status: 'PUBLISHED',
    createdAt: '2024-01-20T10:00:00Z',
    expiresAt: '2024-02-20T00:00:00Z',
  },
  {
    id: 2,
    title: 'Scheduled Maintenance',
    content: 'We will be performing maintenance on our servers this weekend from 2:00 AM to 4:00 AM IST. Expect brief downtime during this period.',
    type: 'MAINTENANCE',
    status: 'PUBLISHED',
    createdAt: '2024-01-25T14:00:00Z',
    expiresAt: '2024-01-28T00:00:00Z',
  },
  {
    id: 3,
    title: 'Holiday Hours',
    content: 'Our support team will have reduced hours during the Republic Day holiday on January 26th. We will resume normal operations on January 27th.',
    type: 'GENERAL',
    status: 'DRAFT',
    createdAt: '2024-01-15T09:00:00Z',
    expiresAt: '2024-01-27T00:00:00Z',
  },
  {
    id: 4,
    title: 'Security Update',
    content: 'We have implemented enhanced security measures to protect your data. All users are required to update their passwords within the next 7 days.',
    type: 'SECURITY',
    status: 'PUBLISHED',
    createdAt: '2024-01-22T16:00:00Z',
    expiresAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 5,
    title: 'New Integration: Instagram Shopping',
    content: 'You can now connect your Instagram Shopping account directly to Hypnate. This allows you to sync products and manage orders seamlessly.',
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
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnouncements(mockAnnouncements);
      setFilteredAnnouncements(mockAnnouncements);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = [...announcements];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter((a) => a.type === typeFilter.toUpperCase());
    }

    if (statusFilter !== 'All') {
      const now = new Date();
      filtered = filtered.filter((a) => {
        if (statusFilter === 'Published') return a.status === 'PUBLISHED' && (!a.expiresAt || new Date(a.expiresAt) > now);
        if (statusFilter === 'Draft') return a.status === 'DRAFT';
        if (statusFilter === 'Expired') return a.status === 'PUBLISHED' && a.expiresAt && new Date(a.expiresAt) <= now;
        return true;
      });
    }

    setFilteredAnnouncements(filtered);
  }, [announcements, searchQuery, typeFilter, statusFilter]);

  const getTypeBadge = (type: string) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1';
    switch (type.toUpperCase()) {
      case 'FEATURE': return <span className={`${baseClasses} bg-purple-100 text-purple-600`}><Info size={10} /> Feature</span>;
      case 'MAINTENANCE': return <span className={`${baseClasses} bg-amber-100 text-amber-600`}><AlertCircle size={10} /> Maintenance</span>;
      case 'GENERAL': return <span className={`${baseClasses} bg-blue-100 text-blue-600`}><Info size={10} /> General</span>;
      case 'SECURITY': return <span className={`${baseClasses} bg-red-100 text-red-600`}><XCircle size={10} /> Security</span>;
      default: return <span className={baseClasses}>{type}</span>;
    }
  };

  const getStatusBadge = (announcement: Announcement) => {
    const now = new Date();
    if (announcement.status === 'DRAFT') {
      return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Draft</span>;
    }
    if (announcement.expiresAt && new Date(announcement.expiresAt) <= now) {
      return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex items-center gap-1"><Clock size={10} /> Expired</span>;
    }
    return <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded-full">Published</span>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Announcements</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage platform-wide announcements</p>
        </div>
        <Link to="/admin/announcements/new" className="admin-btn admin-btn-primary mt-4 sm:mt-0">
          <Plus size={16} /> Create Announcement
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Announcements</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{announcements.length}</div>
        </div>
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Published</div>
          <div className="text-2xl font-bold text-green-600">
            {announcements.filter((a) => a.status === 'PUBLISHED' && (!a.expiresAt || new Date(a.expiresAt) > new Date())).length}
          </div>
        </div>
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Feature</div>
          <div className="text-2xl font-bold text-purple-600">
            {announcements.filter((a) => a.type === 'FEATURE').length}
          </div>
        </div>
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Maintenance</div>
          <div className="text-2xl font-bold text-amber-600">
            {announcements.filter((a) => a.type === 'MAINTENANCE').length}
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
                placeholder="Search announcements..."
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: 140 }}
            >
              {typeOptions.map((option) => (
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
                setTypeFilter('All');
                setStatusFilter('All');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="admin-card">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone size={64} className="mx-auto text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No announcements found</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters or create a new announcement
            </p>
            <Link to="/admin/announcements/new" className="admin-btn admin-btn-primary mt-6">
              <Plus size={16} /> Create Announcement
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
              >
                <div
                  className={`flex items-center justify-between p-4 ${
                    announcement.status === 'PUBLISHED' && (!announcement.expiresAt || new Date(announcement.expiresAt) > new Date())
                      ? 'bg-green-50 dark:bg-green-900/10'
                      : 'bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Megaphone size={20} className="text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{announcement.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">ID: {announcement.id}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-2">
                      {getTypeBadge(announcement.type)}
                      {getStatusBadge(announcement)}
                    </div>
                    <button className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                      <MoreVertical size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {announcement.content}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} /> Created: {new Date(announcement.createdAt).toLocaleDateString()}
                      </div>
                      {announcement.expiresAt && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} /> Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="admin-btn admin-btn-ghost text-xs">
                        <Eye size={14} /> View
                      </button>
                      <button className="admin-btn admin-btn-secondary text-xs">
                        <Edit size={14} /> Edit
                      </button>
                      <button className="admin-btn admin-btn-danger text-xs">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};