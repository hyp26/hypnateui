import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { AdminUserRole } from '../../types';

interface Props {
  searchQuery: string;
  roleFilter: 'ALL' | AdminUserRole;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  onSearchChange: (value: string) => void;
  onRoleChange: (value: 'ALL' | AdminUserRole) => void;
  onStatusChange: (value: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => void;
  onClear: () => void;
}

export const AdminUserFilters: React.FC<Props> = ({
  searchQuery,
  roleFilter,
  statusFilter,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onClear,
}) => {
  const hasFilters = Boolean(searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL');

  return (
    <div className="adminusers-filters">
      <div className="adminusers-search">
        <Search size={17} />
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name or email..."
          aria-label="Search admin users"
        />
        {searchQuery && (
          <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search">
            <X size={15} />
          </button>
        )}
      </div>

      <div className="adminusers-filter-select">
        <SlidersHorizontal size={15} />
        <select
          value={roleFilter}
          onChange={(event) => onRoleChange(event.target.value as 'ALL' | AdminUserRole)}
          aria-label="Filter by role"
        >
          <option value="ALL">All roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPPORT">Support</option>
        </select>
      </div>

      <select
        className="adminusers-filter-select plain"
        value={statusFilter}
        onChange={(event) =>
          onStatusChange(
            event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
          )
        }
        aria-label="Filter by status"
      >
        <option value="ALL">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="SUSPENDED">Suspended</option>
      </select>

      {hasFilters && (
        <button type="button" className="adminusers-clear-btn" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
};
