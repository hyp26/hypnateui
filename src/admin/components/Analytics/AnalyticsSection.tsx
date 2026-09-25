import React from 'react';

interface AnalyticsSectionProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  chartClassName?: string;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  title,
  actions,
  children,
  chartClassName = '',
}) => (
  <section className="analytics-card">
    <div className="analytics-card__header">
      <h2>{title}</h2>
      {actions}
    </div>
    <div className={`analytics-card__chart ${chartClassName}`}>
      {children}
    </div>
  </section>
);

export default AnalyticsSection;
