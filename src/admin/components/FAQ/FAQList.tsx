import React from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit,
  HelpCircle,
  MoreVertical,
  Plus,
  Tag,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FAQItem } from '../../types';

interface FAQListProps {
  faqs: FAQItem[];
  filteredFAQs: FAQItem[];
  isLoading: boolean;
  expandedFAQ: string | number | null;
  onToggle: (id: string | number) => void;
}

const FAQList: React.FC<FAQListProps> = ({
  faqs,
  filteredFAQs,
  isLoading,
  expandedFAQ,
  onToggle,
}) => {
  if (isLoading) {
    return (
      <section className="faq-card faq-card--list">
        <div className="faq-state">
          <div className="faq-spinner" />
          <span>Loading FAQs...</span>
        </div>
      </section>
    );
  }

  if (filteredFAQs.length === 0) {
    return (
      <section className="faq-card faq-card--list">
        <div className="faq-state">
          <HelpCircle size={48} />
          <h3>No FAQs found</h3>
          <p>Try adjusting your filters or add a new FAQ.</p>
          <Link to="/admin/faq/new" className="faq-primary-button">
            <Plus size={16} />
            Add FAQ
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="faq-card faq-card--list">
      <div className="faq-list">
        {filteredFAQs.map((faq, index) => {
          const isExpanded = expandedFAQ === faq.id;

          return (
            <article className={`faq-item${isExpanded ? ' faq-item--expanded' : ''}`} key={faq.id}>
              <div
                className="faq-item__header"
                onClick={() => onToggle(faq.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onToggle(faq.id);
                  }
                }}
              >
                <div className="faq-item__main">
                  <div className="faq-item__question-row">
                    <span className="faq-item__number">{index + 1}</span>
                    <h2 className="faq-item__question">{faq.question}</h2>
                  </div>

                  <div className="faq-item__meta">
                    <span className="faq-badge faq-badge--category">
                      {faq.category}
                    </span>
                    <span
                      className={`faq-badge ${
                        faq.isPublished
                          ? 'faq-badge--published'
                          : 'faq-badge--draft'
                      }`}
                    >
                      {faq.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                <div className="faq-item__controls">
                  <span className="faq-expand-button" aria-hidden="true">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                  <button
                    type="button"
                    className="faq-more-button"
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Actions for ${faq.question}`}
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="faq-item__answer">
                  <p>{faq.answer}</p>

                  <div className="faq-item__footer">
                    <div className="faq-item__details">
                      <span>
                        <Calendar size={14} />
                        Created:{' '}
                        {faq.createdAt
                          ? new Date(faq.createdAt).toLocaleDateString('en-GB')
                          : '—'}
                      </span>
                      <span>
                        <Tag size={14} />
                        Order: {faq.order}
                      </span>
                    </div>

                    <div className="faq-item__actions">
                      <button type="button" className="faq-edit-button">
                        <Edit size={14} />
                        Edit
                      </button>
                      <button type="button" className="faq-delete-button">
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="faq-list-footer">
        Showing {filteredFAQs.length} of {faqs.length} FAQs
      </div>
    </section>
  );
};

export default FAQList;
