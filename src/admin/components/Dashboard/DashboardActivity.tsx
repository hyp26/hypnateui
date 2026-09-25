import React from 'react';
import { Activity, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const activities = [
  { id: 1, action: 'New seller registered', entity: 'Rahul Fashion House', time: '2 min ago', type: 'success' },
  { id: 2, action: 'Subscription upgraded', entity: 'Priya Boutique', time: '15 min ago', type: 'info' },
  { id: 3, action: 'Support ticket created', entity: 'Ticket #1234', time: '1 hour ago', type: 'warning' },
  { id: 4, action: 'Payment received', entity: '₹2,499', time: '3 hours ago', type: 'success' },
  { id: 5, action: 'Announcement published', entity: 'New Feature Launch', time: '5 hours ago', type: 'info' },
] as const;

export const DashboardActivity: React.FC = () => (
  <section className="dashboard-panel dashboard-activity-panel">
    <header className="dashboard-panel__header">
      <h2>Recent Activity</h2>
      <Link to="/admin/audit-logs" className="dashboard-panel__link">View All <ArrowRight size={15} /></Link>
    </header>
    <div className="dashboard-activity-list">
      {activities.map((activity) => {
        const Icon = activity.type === 'success' ? TrendingUp : activity.type === 'warning' ? Clock : Activity;
        return (
          <div key={activity.id} className={`dashboard-activity dashboard-activity--${activity.type}`}>
            <span className="dashboard-activity__icon"><Icon size={16} /></span>
            <div className="dashboard-activity__body">
              <p><strong>{activity.action}</strong> <span>{activity.entity}</span></p>
              <small>{activity.time}</small>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);
