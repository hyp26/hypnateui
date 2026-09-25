import React from 'react';
import { Megaphone, MoreVertical } from 'lucide-react';
import type { Announcement } from '../../types';

interface AnnouncementsTableProps {
  announcements: Announcement[];
  isLoading: boolean;
}

const typeLabels: Record<string, string> = {
  FEATURE: 'Feature',
  MAINTENANCE: 'Maintenance',
  GENERAL: 'General',
  SECURITY: 'Security',
};

const AnnouncementsTable: React.FC<AnnouncementsTableProps> = ({
  announcements,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="content-state">
        <div className="content-spinner" />
        <span>Loading announcements...</span>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="content-state">
        <Megaphone size={46} />
        <h3>No announcements found</h3>
        <p>Try adjusting your filters or add a new announcement.</p>
      </div>
    );
  }

  return (
    <div className="content-table-scroll">
      <table className="content-table content-table--announcements">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Created</th>
            <th>Expires</th>
            <th className="content-table__actions" aria-label="Actions" />
          </tr>
        </thead>

        <tbody>
          {announcements.map((announcement) => (
            <tr key={announcement.id}>
              <td>
                <div className="content-table__title">
                  {announcement.title}
                </div>
                <div className="content-table__description">
                  {announcement.content}
                </div>
              </td>

              <td>
                <span
                  className={`content-badge content-badge--${announcement.type.toLowerCase()}`}
                >
                  {typeLabels[announcement.type] ?? announcement.type}
                </span>
              </td>

              <td>
                <span
                  className={`content-badge content-badge--${
                    announcement.status === 'PUBLISHED' ? 'published' : 'draft'
                  }`}
                >
                  {announcement.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </span>
              </td>

              <td className="content-table__date">
                {new Date(announcement.createdAt).toLocaleDateString('en-GB')}
              </td>

              <td className="content-table__date">
                {announcement.expiresAt
                  ? new Date(announcement.expiresAt).toLocaleDateString('en-GB')
                  : '—'}
              </td>

              <td className="content-table__actions">
                <button
                  type="button"
                  className="content-icon-button"
                  aria-label={`Actions for ${announcement.title}`}
                >
                  <MoreVertical size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnnouncementsTable;
