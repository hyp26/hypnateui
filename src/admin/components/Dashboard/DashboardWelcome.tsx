import React from 'react';

interface DashboardWelcomeProps {
  firstName: string;
}

export const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({ firstName }) => (
  <section className="dashboard-welcome">
    <div>
      <h1>Welcome back, {firstName}!</h1>
      <p>Here's what's happening on Hypnate today.</p>
    </div>
  </section>
);
