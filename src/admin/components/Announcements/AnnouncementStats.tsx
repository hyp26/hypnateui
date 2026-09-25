import React from 'react';
import type { Announcement } from '../../types';

interface AnnouncementStatsProps {
  announcements: Announcement[];
}

const AnnouncementStats: React.FC<AnnouncementStatsProps> = ({
  announcements,
}) => {
  const now = new Date();

  const publishedCount = announcements.filter(
    (announcement) =>
      announcement.status === 'PUBLISHED' &&
      (!announcement.expiresAt || new Date(announcement.expiresAt) > now),
  ).length;

  const featureCount = announcements.filter(
    (announcement) => announcement.type === 'FEATURE',
  ).length;

  const maintenanceCount = announcements.filter(
    (announcement) => announcement.type === 'MAINTENANCE',
  ).length;

  const stats = [
    {
      label: 'Total Announcements',
      value: announcements.length,
      tone: 'default',
    },
    {
      label: 'Published',
      value: publishedCount,
      tone: 'green',
    },
    {
      label: 'Feature',
      value: featureCount,
      tone: 'purple',
    },
    {
      label: 'Maintenance',
      value: maintenanceCount,
      tone: 'amber',
    },
  ];

  return (
    <div className="announcements-stats">
      {stats.map((stat) => (
        <div className="announcement-stat" key={stat.label}>
          <div className="announcement-stat__label">{stat.label}</div>
          <div
            className={`announcement-stat__value announcement-stat__value--${stat.tone}`}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementStats;
