import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';

interface OrdersFiltersProps {
  searchQuery: string;
  statusFilter: string;
  paymentFilter: string;
  statusOptions: string[];
  paymentOptions: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
  onClear: () => void;
}

const OrdersFilters: React.FC<OrdersFiltersProps> = ({
  searchQuery,
  statusFilter,
  paymentFilter,
  statusOptions,
  paymentOptions,
  onSearchChange,
  onStatusChange,
  onPaymentChange,
  onClear,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <section className="orders-filters">
      <div className="orders-filters__search">
        <Search size={17} />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by order ID, customer name..."
          aria-label="Search orders"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="orders-filters__menu-wrap">
        <button
          type="button"
          className={`orders-filter-button${open ? ' orders-filter-button--open' : ''}`}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <Filter size={16} />
          Filters
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {open && (
          <div className="orders-filter-popover">
            <label>
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => onStatusChange(event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Payment</span>
              <select
                value={paymentFilter}
                onChange={(event) => onPaymentChange(event.target.value)}
              >
                {paymentOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <div className="orders-filter-popover__actions">
              <button
                type="button"
                className="orders-secondary-button"
                onClick={onClear}
              >
                Clear
              </button>

              <button
                type="button"
                className="orders-primary-button orders-primary-button--small"
                onClick={() => setOpen(false)}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default OrdersFilters;
