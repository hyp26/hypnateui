import React from 'react';
import { HelpCircle, MoreVertical } from 'lucide-react';
import type { FAQItem } from '../../types';

interface FAQTableProps {
  faqs: FAQItem[];
  isLoading: boolean;
}

const FAQTable: React.FC<FAQTableProps> = ({ faqs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="content-state">
        <div className="content-spinner" />
        <span>Loading FAQs...</span>
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="content-state">
        <HelpCircle size={46} />
        <h3>No FAQs found</h3>
        <p>Try adjusting your filters or add a new FAQ.</p>
      </div>
    );
  }

  return (
    <div className="content-table-scroll">
      <table className="content-table content-table--faq">
        <thead>
          <tr>
            <th>Question</th>
            <th>Category</th>
            <th>Order</th>
            <th>Status</th>
            <th>Created</th>
            <th className="content-table__actions" aria-label="Actions" />
          </tr>
        </thead>

        <tbody>
          {faqs.map((faq) => (
            <tr key={faq.id}>
              <td>
                <div className="content-table__title">{faq.question}</div>
                <div className="content-table__description">
                  {faq.answer}
                </div>
              </td>

              <td>
                <span className="content-table__category">
                  {faq.category}
                </span>
              </td>

              <td>
                <span className="content-table__order">{faq.order}</span>
              </td>

              <td>
                <span
                  className={`content-badge content-badge--${
                    faq.isPublished ? 'published' : 'draft'
                  }`}
                >
                  {faq.isPublished ? 'Published' : 'Draft'}
                </span>
              </td>

              <td className="content-table__date">
                {faq.createdAt
                  ? new Date(faq.createdAt).toLocaleDateString('en-GB')
                  : '—'}
              </td>

              <td className="content-table__actions">
                <button
                  type="button"
                  className="content-icon-button"
                  aria-label={`Actions for ${faq.question}`}
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

export default FAQTable;