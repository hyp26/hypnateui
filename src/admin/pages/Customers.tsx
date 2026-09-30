import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { adminCustomersApi, getApiErrorMessage } from '../lib/adminApi';
import type { Customer } from '../types';
import CustomersStats from '../components/Customers/CustomersStats';
import CustomersFilters from '../components/Customers/CustomersFilters';
import CustomersTable from '../components/Customers/CustomersTable';
import '../styles/Customers.css';

const statusOptions = ['All', 'Active', 'Blocked'];
const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most Orders', value: 'orders_desc' },
  { label: 'Most Spent', value: 'spent_desc' },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCustomers, setSelectedCustomers] = useState<Array<string | number>>([]);

  useEffect(() => {
    let cancelled = false;

    adminCustomersApi
      .list({ limit: 100 })
      .then((response) => {
        if (cancelled) return;
        setCustomers(response.data as unknown as Customer[]);
        setTotalCount(response.total);
        setIsLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(getApiErrorMessage(error));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...customers]
      .filter((customer) => {
        const matchesSearch =
          !query ||
          `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          (customer.phone ?? '').toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === 'All' ||
          customer.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'orders_desc':
            return b.totalOrders - a.totalOrders;
          case 'spent_desc':
            return b.totalSpent - a.totalSpent;
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [customers, searchQuery, statusFilter, sortBy]);

  const toggleCustomerSelection = (id: string | number) => {
    setSelectedCustomers((previous) =>
      previous.includes(id)
        ? previous.filter((customerId) => customerId !== id)
        : [...previous, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredCustomers.map((customer) => customer.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedCustomers.includes(id));

    setSelectedCustomers((previous) =>
      allSelected
        ? previous.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...previous, ...visibleIds]))
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSortBy('newest');
  };

  const activeCount = customers.filter((customer) => customer.status === 'ACTIVE').length;
  const totalOrders = customers.reduce((sum, customer) => sum + customer.totalOrders, 0);
  const totalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);

  return (
    <div className="customers-page">
      <header className="customers-page__header">
        <div>
          <h1 className="customers-page__title">Customers</h1>
          <p className="customers-page__subtitle">Manage all customers on the Hypnate platform</p>
        </div>

        <Link to="/admin/customers" className="customers-primary-button">
          <Plus size={17} strokeWidth={2.2} />
          Add Customer
        </Link>
      </header>

      <CustomersStats
        total={customers.length}
        active={activeCount}
        orders={totalOrders}
        spent={formatCurrency(totalSpent)}
      />

      {loadError && (
        <div className="customers-page__error" role="alert">
          {loadError}
        </div>
      )}

      <CustomersFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        sortBy={sortBy}
        statusOptions={statusOptions}
        sortOptions={sortOptions}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onSortChange={setSortBy}
        onClear={clearFilters}
      />

      <CustomersTable
        customers={filteredCustomers}
        allCustomersCount={totalCount || customers.length}
        isLoading={isLoading}
        selectedCustomers={selectedCustomers}
        onToggle={toggleCustomerSelection}
        onSelectAll={selectAllVisible}
        formatCurrency={formatCurrency}
      />

      <div className="customers-page__footer">
        <span>Showing {filteredCustomers.length} of {totalCount || customers.length} customers</span>
        <div className="customers-page__pagination">
          <button type="button" className="customers-secondary-button" disabled>Previous</button>
          <button type="button" className="customers-secondary-button" disabled>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Customers;
