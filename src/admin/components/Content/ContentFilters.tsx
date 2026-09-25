import React from 'react';
import { Search } from 'lucide-react';

type ContentTab = 'announcements' | 'faq';

interface ContentFiltersProps {
  activeTab: ContentTab;
  searchQuery: string;
  typeFilter: string;
  statusFilter: string;
  categoryFilter: string;
  typeOptions: string[];
  categoryOptions: string[];
  statusOptions: string[];
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const ContentFilters: React.FC<ContentFiltersProps> = ({
  activeTab,
  searchQuery,
  typeFilter,
  statusFilter,
  categoryFilter,
  typeOptions,
  categoryOptions,
  statusOptions,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onCategoryChange,
}) => {
  const isAnnouncements = activeTab === 'announcements';

  return (
    <div className="content-filters">
      <div className="content-search">
        <Search size={17} />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={
            isAnnouncements ? 'Search announcements...' : 'Search FAQs...'
          }
          aria-label={
            isAnnouncements ? 'Search announcements' : 'Search FAQs'
          }
        />

        {searchQuery && (
          <button
            type="button"
            className="content-search__clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="content-filter-selects">
        {isAnnouncements ? (
          <select
            value={typeFilter}
            onChange={(event) => onTypeChange(event.target.value)}
            aria-label="Announcement type"
          >
            {typeOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        ) : (
          <select
            value={categoryFilter}
            onChange={(event) => onCategoryChange(event.target.value)}
            aria-label="FAQ category"
          >
            {categoryOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        )}

        <select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
          aria-label="Content status"
        >
          {statusOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ContentFilters;
