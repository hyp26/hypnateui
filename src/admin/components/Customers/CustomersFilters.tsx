import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface CustomersFiltersProps {
  searchQuery: string;
  statusFilter: string;
  sortBy: string;
  statusOptions: string[];
  sortOptions: Option[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClear: () => void;
}

const CustomersFilters: React.FC<CustomersFiltersProps> = ({
  searchQuery,
  statusFilter,
  sortBy,
  statusOptions,
  sortOptions,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onClear,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <section className="customers-filters">
      <div className="customers-filters__search">
        <Search size={17} />
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, email, or phone..."
          aria-label="Search customers"
        />
        {searchQuery && (
          <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      <div className="customers-filters__menu-wrap">
        <button
          type="button"
          className={`customers-filter-button${open ? ' customers-filter-button--open' : ''}`}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <Filter size={16} />
          Filters
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {open && (
          <div className="customers-filter-popover">
            <label>
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
                {statusOptions.map((option) => <option key={option}>{option}</option>)}
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

            <div className="customers-filter-popover__actions">
              <button type="button" className="customers-secondary-button" onClick={onClear}>Clear</button>
              <button type="button" className="customers-primary-button customers-primary-button--small" onClick={() => setOpen(false)}>
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomersFilters;
