import React from 'react';
import type { FAQItem } from '../../types';

interface FAQStatsProps {
  faqs: FAQItem[];
}

const FAQStats: React.FC<FAQStatsProps> = ({ faqs }) => {
  const categories = new Set(faqs.map((faq) => faq.category)).size;
  const averageOrder =
    faqs.length > 0
      ? (faqs.reduce((sum, faq) => sum + faq.order, 0) / faqs.length).toFixed(1)
      : '0';

  const stats = [
    { label: 'Total FAQs', value: faqs.length, className: 'default' },
    {
      label: 'Published',
      value: faqs.filter((faq) => faq.isPublished).length,
      className: 'green',
    },
    { label: 'Categories', value: categories, className: 'default' },
    { label: 'Avg. Order', value: averageOrder, className: 'default' },
  ];

  return (
    <div className="faq-stats">
      {stats.map((stat) => (
        <div className="faq-stat" key={stat.label}>
          <div className="faq-stat__label">{stat.label}</div>
          <div className={`faq-stat__value faq-stat__value--${stat.className}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQStats;
