import React from 'react';
import { AlertCircle, Calendar, Clock, Edit, Eye, Info, Megaphone, MoreVertical, Plus, Trash2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Announcement } from '../../types';

interface AnnouncementListProps {
  announcements: Announcement[];
  filteredAnnouncements: Announcement[];
  isLoading: boolean;
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({
  announcements,
  filteredAnnouncements,
  isLoading,
}) => {
  const getTypeBadge = (type: string) => {
    const normalizedType = type.toUpperCase();

    if (normalizedType === 'FEATURE') {
      return (
        <span className="announcement-badge announcement-badge--feature">
          <Info size={11} /> Feature
        </span>
      );
    }

    if (normalizedType === 'MAINTENANCE') {
      return (
        <span className="announcement-badge announcement-badge--maintenance">
          <AlertCircle size={11} /> Maintenance
        </span>
      );
    }

    if (normalizedType === 'SECURITY') {
      return (
        <span className="announcement-badge announcement-badge--security">
          <XCircle size={11} /> Security
        </span>
      );
    }

    return (
      <span className="announcement-badge announcement-badge--general">
        <Info size={11} /> General
      </span>
    );
  };

  const getStatusBadge = (announcement: Announcement) => {
    const isExpired =
      announcement.status === 'PUBLISHED' &&
      !!announcement.expiresAt &&
      new Date(announcement.expiresAt) <= new Date();

    if (announcement.status === 'DRAFT') {
      return (
        <span className="announcement-status announcement-status--draft">
          Draft
        </span>
      );
    }

    if (isExpired) {
      return (
        <span className="announcement-status announcement-status--expired">
          <Clock size={11} /> Expired
        </span>
      );
    }

    return (
      <span className="announcement-status announcement-status--published">
        Published
      </span>
    );
  };

  if (isLoading) {
    return (
      <section className="announcements-card announcements-card--list">
        <div className="announcements-state">
          <div className="announcements-spinner" />
          <span>Loading announcements...</span>
        </div>
      </section>
    );
  }

  if (filteredAnnouncements.length === 0) {
    return (
      <section className="announcements-card announcements-card--list">
        <div className="announcements-state">
          <Megaphone size={48} />
          <h3>No announcements found</h3>
          <p>Try adjusting your filters or create a new announcement.</p>
          <Link
            to="/admin/announcements/new"
            className="announcements-primary-button"
          >
            <Plus size={16} />
            Create Announcement
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="announcements-card announcements-card--list">
      <div className="announcements-list">
        {filteredAnnouncements.map((announcement) => {
          const isActive =
            announcement.status === 'PUBLISHED' &&
            (!announcement.expiresAt ||
              new Date(announcement.expiresAt) > new Date());

          return (
            <article className="announcement-item" key={announcement.id}>
              <div
                className={`announcement-item__header ${
                  isActive ? 'announcement-item__header--active' : ''
                }`}
              >
                <div className="announcement-item__main">
                  <div className="announcement-item__identity">
                    <div className="announcement-item__icon">
                      <Megaphone size={19} />
                    </div>

                    <div className="announcement-item__heading">
                      <h2>{announcement.title}</h2>
                      <span>ID: {announcement.id}</span>
                    </div>
                  </div>
                </div>

                <div className="announcement-item__right">
                  <div className="announcement-item__badges">
                    {getTypeBadge(announcement.type)}
                    {getStatusBadge(announcement)}
                  </div>

                  <button
                    type="button"
                    className="announcement-more-button"
                    aria-label={`Actions for ${announcement.title}`}
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="announcement-item__body">
                <p className="announcement-item__content">
                  {announcement.content}
                </p>

                <div className="announcement-item__footer">
                  <div className="announcement-item__dates">
                    <span>
                      <Calendar size={14} />
                      Created:{' '}
                      {new Date(announcement.createdAt).toLocaleDateString(
                        'en-GB',
                      )}
                    </span>

                    {announcement.expiresAt && (
                      <span>
                        <Clock size={14} />
                        Expires:{' '}
                        {new Date(announcement.expiresAt).toLocaleDateString(
                          'en-GB',
                        )}
                      </span>
                    )}
                  </div>

                  <div className="announcement-item__actions">
                    <button type="button" className="announcement-action announcement-action--view">
                      <Eye size={14} /> View
                    </button>
                    <button type="button" className="announcement-action announcement-action--edit">
                      <Edit size={14} /> Edit
                    </button>
                    <button type="button" className="announcement-action announcement-action--delete">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="announcements-list-footer">
        Showing {filteredAnnouncements.length} of {announcements.length} announcements
      </div>
    </section>
  );
};

export default AnnouncementList;
