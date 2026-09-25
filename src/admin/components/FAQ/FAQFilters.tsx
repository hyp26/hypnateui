import React from 'react';
import { Search } from 'lucide-react';

interface FAQFiltersProps {
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
  categoryOptions: string[];
  statusOptions: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

const FAQFilters: React.FC<FAQFiltersProps> = ({
  searchQuery,
  categoryFilter,
  statusFilter,
  categoryOptions,
  statusOptions,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onClear,
}) => (
  <div className="faq-filters">
    <div className="faq-search">
      <Search size={17} />
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search FAQs..."
        aria-label="Search FAQs"
      />
      {searchQuery && (
        <button
          type="button"
          className="faq-search__clear"
          onClick={() => onSearchChange('')}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>

    <div className="faq-filter-control">
      <select
        value={categoryFilter}
        onChange={(event) => onCategoryChange(event.target.value)}
        aria-label="Filter by category"
      >
        {categoryOptions.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>

    <div className="faq-filter-control faq-filter-control--status">
      <select
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
        aria-label="Filter by status"
      >
        {statusOptions.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>

    <button type="button" className="faq-clear-button" onClick={onClear}>
      Clear Filters
    </button>
  </div>
);

export default FAQFilters;
