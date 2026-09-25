import React from 'react';
import { Search } from 'lucide-react';

interface AnnouncementFiltersProps {
  searchQuery: string;
  typeFilter: string;
  statusFilter: string;
  typeOptions: string[];
  statusOptions: string[];
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

const AnnouncementFilters: React.FC<AnnouncementFiltersProps> = ({
  searchQuery,
  typeFilter,
  statusFilter,
  typeOptions,
  statusOptions,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onClear,
}) => (
  <div className="announcements-filters">
    <div className="announcements-search">
      <Search size={17} />
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search announcements..."
        aria-label="Search announcements"
      />
      {searchQuery && (
        <button
          type="button"
          className="announcements-search__clear"
          onClick={() => onSearchChange('')}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>

    <select
      className="announcements-filter-select announcements-filter-select--type"
      value={typeFilter}
      onChange={(event) => onTypeChange(event.target.value)}
      aria-label="Filter by type"
    >
      {typeOptions.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>

    <select
      className="announcements-filter-select"
      value={statusFilter}
      onChange={(event) => onStatusChange(event.target.value)}
      aria-label="Filter by status"
    >
      {statusOptions.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>

    <button type="button" className="announcements-clear-button" onClick={onClear}>
      Clear Filters
    </button>
  </div>
);

export default AnnouncementFilters;
