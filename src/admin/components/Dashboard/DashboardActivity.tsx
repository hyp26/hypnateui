import React from 'react';
import { Activity, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface DashboardActivityItem {
  id: string | number;
  action: string;
  entity: string;
  time: string;
  type: 'success' | 'warning' | 'info';
}

interface DashboardActivityProps {
  activities: DashboardActivityItem[];
}

export const DashboardActivity: React.FC<DashboardActivityProps> = ({ activities }) => (
  <section className="dashboard-panel dashboard-activity-panel">
    <header className="dashboard-panel__header">
      <h2>Recent Activity</h2>
      <Link to="/admin/audit-logs" className="dashboard-panel__link">View All <ArrowRight size={15} /></Link>
    </header>
    <div className="dashboard-activity-list">
      {activities.length === 0 && (
        <div className="dashboard-activity dashboard-activity--info">
          <span className="dashboard-activity__icon"><Activity size={16} /></span>
          <div className="dashboard-activity__body">
            <p><strong>No recent activity</strong> <span>Actions will appear here.</span></p>
          </div>
        </div>
      )}
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
