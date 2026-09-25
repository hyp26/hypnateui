import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface SellersFiltersProps {
  searchQuery: string;
  statusFilter: string;
  planFilter: string;
  sortBy: string;
  statusOptions: string[];
  planOptions: string[];
  sortOptions: Option[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPlanChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClear: () => void;
}

const SellersFilters: React.FC<SellersFiltersProps> = ({
  searchQuery,
  statusFilter,
  planFilter,
  sortBy,
  statusOptions,
  planOptions,
  sortOptions,
  onSearchChange,
  onStatusChange,
  onPlanChange,
  onSortChange,
  onClear,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <section className="sellers-filters">
      <div className="sellers-filters__search">
        <Search size={17} />
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, email, or phone..."
          aria-label="Search sellers"
        />
        {searchQuery && (
          <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      <div className="sellers-filters__menu-wrap">
        <button
          type="button"
          className={`sellers-filter-button${open ? ' sellers-filter-button--open' : ''}`}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <Filter size={16} />
          Filters
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {open && (
          <div className="sellers-filter-popover">
            <label>
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
                {statusOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label>
              <span>Plan</span>
              <select value={planFilter} onChange={(event) => onPlanChange(event.target.value)}>
                {planOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label>
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <div className="sellers-filter-popover__actions">
              <button type="button" className="sellers-secondary-button" onClick={onClear}>Clear</button>
              <button type="button" className="sellers-primary-button sellers-primary-button--small" onClick={() => setOpen(false)}>
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SellersFilters;
