import React from 'react';
import { MoreVertical, Trash2, Users } from 'lucide-react';
import type { Customer } from '../../types';

interface CustomersTableProps {
  customers: Customer[];
  allCustomersCount: number;
  isLoading: boolean;
  selectedCustomers: Array<string | number>;
  onToggle: (id: string | number) => void;
  onSelectAll: () => void;
  formatCurrency: (amount: number) => string;
}

const getStatusClass = (status: string) =>
  status.toLowerCase() === 'blocked'
    ? 'customers-badge customers-badge--blocked'
    : 'customers-badge customers-badge--active';

const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  isLoading,
  selectedCustomers,
  onToggle,
  onSelectAll,
  formatCurrency,
}) => {
  const allVisibleSelected =
    customers.length > 0 &&
    customers.every((customer) => selectedCustomers.includes(customer.id));

  if (isLoading) {
    return (
      <section className="customers-table-card">
        <div className="customers-empty-state">
          <div className="customers-spinner" />
          <span>Loading customers...</span>
        </div>
      </section>
    );
  }

  if (customers.length === 0) {
    return (
      <section className="customers-table-card">
        <div className="customers-empty-state">
          <Users size={48} />
          <h3>No customers found</h3>
          <p>Try adjusting your filters or add a new customer.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="customers-table-card">
      <div className="customers-table-toolbar">
        <label className="customers-selection">
          <input type="checkbox" checked={allVisibleSelected} onChange={onSelectAll} />
          <span>{selectedCustomers.length} selected</span>
        </label>

        <div className="customers-table-toolbar__actions">
          <button type="button" className="customers-secondary-button">Export CSV</button>
          <button
            type="button"
            className="customers-danger-button"
            disabled={selectedCustomers.length === 0}
          >
            <Trash2 size={15} />
            Delete Selected
          </button>
        </div>
      </div>

      <div className="customers-table-scroll">
        <table className="customers-table">
          <thead>
            <tr>
              <th className="customers-table__check">
                <input type="checkbox" checked={allVisibleSelected} onChange={onSelectAll} />
              </th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Last Order</th>
              <th>Status</th>
              <th>Joined</th>
              <th className="customers-table__actions" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="customers-table__check">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => onToggle(customer.id)}
                  />
                </td>
                <td>
                  <div className="customers-table__primary">
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div className="customers-table__secondary">ID: {customer.id}</div>
                </td>
                <td>
                  <div className="customers-table__primary customers-table__primary--normal">
                    {customer.email}
                  </div>
                  <div className="customers-table__secondary">{customer.phone || '—'}</div>
                </td>
                <td className="customers-table__number">{customer.totalOrders}</td>
                <td className="customers-table__revenue">{formatCurrency(customer.totalSpent)}</td>
                <td className="customers-table__date">
                  {customer.lastOrderAt
                    ? new Date(customer.lastOrderAt).toLocaleDateString('en-GB')
                    : 'N/A'}
                </td>
                <td>
                  <span className={getStatusClass(customer.status)}>
                    {customer.status.charAt(0) + customer.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="customers-table__date">
                  {new Date(customer.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="customers-table__actions">
                  <button
                    type="button"
                    className="customers-icon-button"
                    aria-label={`Actions for ${customer.firstName} ${customer.lastName}`}
                  >
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CustomersTable;
