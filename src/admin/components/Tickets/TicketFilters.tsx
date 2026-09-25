import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';

interface TicketFiltersProps {
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
  statusOptions: string[];
  priorityOptions: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onClear: () => void;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({
  searchQuery,
  statusFilter,
  priorityFilter,
  statusOptions,
  priorityOptions,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasFilters =
    searchQuery.length > 0 ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All';

  return (
    <div className="ticket-filters">
      <div className="ticket-search">
        <Search size={17} />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by ticket ID or subject..."
          aria-label="Search tickets"
        />

        {searchQuery && (
          <button
            type="button"
            className="ticket-search__clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="ticket-filter-wrap">
        <button
          type="button"
          className={`ticket-filter-button${
            hasFilters ? ' ticket-filter-button--active' : ''
          }`}
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
        >
          <Filter size={16} />
          Filters
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isOpen && (
          <div className="ticket-filter-menu">
            <div className="ticket-filter-field">
              <label htmlFor="ticket-status-filter">Status</label>
              <select
                id="ticket-status-filter"
                value={statusFilter}
                onChange={(event) => onStatusChange(event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="ticket-filter-field">
              <label htmlFor="ticket-priority-filter">Priority</label>
              <select
                id="ticket-priority-filter"
                value={priorityFilter}
                onChange={(event) => onPriorityChange(event.target.value)}
              >
                {priorityOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="ticket-filter-actions">
              <button
                type="button"
                className="ticket-filter-clear"
                onClick={() => {
                  onClear();
                  setIsOpen(false);
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="ticket-filter-apply"
                onClick={() => setIsOpen(false)}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketFilters;
