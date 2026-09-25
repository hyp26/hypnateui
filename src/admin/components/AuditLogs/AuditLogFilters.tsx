import React from 'react';
import { Search } from 'lucide-react';

interface AuditLogFiltersProps {
  searchQuery: string;
  actionFilter: string;
  entityFilter: string;
  dateRange: string;
  actionOptions: string[];
  entityOptions: string[];
  onSearchChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onEntityChange: (value: string) => void;
  onDateRangeChange: (value: string) => void;
  onClear: () => void;
}

const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  searchQuery,
  actionFilter,
  entityFilter,
  dateRange,
  actionOptions,
  entityOptions,
  onSearchChange,
  onActionChange,
  onEntityChange,
  onDateRangeChange,
  onClear,
}) => (
  <div className="auditlogs-filters">
    <div className="auditlogs-search">
      <Search size={16} />
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by user email, entity ID, or IP..."
        aria-label="Search audit logs"
      />
      {searchQuery && (
        <button
          type="button"
          className="auditlogs-search__clear"
          onClick={() => onSearchChange('')}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>

    <select
      className="auditlogs-select"
      value={actionFilter}
      onChange={(event) => onActionChange(event.target.value)}
      aria-label="Filter by action"
    >
      {actionOptions.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>

    <select
      className="auditlogs-select"
      value={entityFilter}
      onChange={(event) => onEntityChange(event.target.value)}
      aria-label="Filter by entity"
    >
      {entityOptions.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>

    <select
      className="auditlogs-select"
      value={dateRange}
      onChange={(event) => onDateRangeChange(event.target.value)}
      aria-label="Filter by date range"
    >
      <option value="All">All Time</option>
      <option value="today">Today</option>
      <option value="7d">Last 7 Days</option>
      <option value="30d">Last 30 Days</option>
    </select>

    <button type="button" className="auditlogs-clear-button" onClick={onClear}>
      Clear Filters
    </button>
  </div>
);

export default AuditLogFilters;
