import React from 'react';
import { Activity, Clock, Plus, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  { id: 'seller', title: 'Add Seller', description: 'Manually add a new seller', path: '/admin/sellers', icon: Store, tone: 'teal' },
  { id: 'announcement', title: 'Create Announcement', description: 'Broadcast to all users', path: '/admin/announcements', icon: Plus, tone: 'purple' },
  { id: 'tickets', title: 'View Tickets', description: 'Check pending support tickets', path: '/admin/tickets', icon: Activity, tone: 'orange' },
  { id: 'settings', title: 'System Settings', description: 'Configure platform settings', path: '/admin/settings', icon: Clock, tone: 'red' },
] as const;

export const DashboardQuickActions: React.FC = () => (
  <section className="dashboard-panel dashboard-quick-actions">
    <header className="dashboard-panel__header">
      <h2>Quick Actions</h2>
    </header>
    <div className="dashboard-actions-grid">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.id} to={action.path} className={`dashboard-action dashboard-action--${action.tone}`}>
            <span className="dashboard-action__icon"><Icon size={21} /></span>
            <span className="dashboard-action__title">{action.title}</span>
            <span className="dashboard-action__description">{action.description}</span>
          </Link>
        );
      })}
    </div>
  </section>
);
