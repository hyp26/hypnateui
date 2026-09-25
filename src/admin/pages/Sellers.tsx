import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAdminStore } from '../stores/useAdminStore';
import type { Seller } from '../types';
import SellersStats from '../components/Sellers/SellersStats';
import SellersFilters from '../components/Sellers/SellersFilters';
import SellersTable from '../components/Sellers/SellersTable';
import '../styles/Sellers.css';

const mockSellers: Seller[] = [
  {
    id: 1, businessName: 'Rahul Fashion House', email: 'rahul@fashionhouse.in',
    firstName: 'Rahul', lastName: 'Sharma', phone: '+91 98765 43210',
    plan: 'PRO', status: 'ACTIVE', onboardedAt: '2024-01-15T10:30:00Z',
    trialEndsAt: '', totalProducts: 145, totalOrders: 892, totalRevenue: 1245678,
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 2, businessName: 'Priya Boutique', email: 'priya@boutique.in',
    firstName: 'Priya', lastName: 'Patel', phone: '+91 98765 12345',
    plan: 'BUSINESS', status: 'ACTIVE', onboardedAt: '2024-01-20T14:00:00Z',
    trialEndsAt: '', totalProducts: 321, totalOrders: 2156, totalRevenue: 3456789,
    createdAt: '2024-01-12T09:30:00Z',
  },
  {
    id: 3, businessName: 'Tech Gadgets', email: 'contact@techgadgets.in',
    firstName: 'Amit', lastName: 'Kumar', phone: '+91 98765 54321',
    plan: 'STARTER', status: 'TRIALING', onboardedAt: '',
    trialEndsAt: '2024-02-15T00:00:00Z', totalProducts: 45, totalOrders: 123,
    totalRevenue: 234567, createdAt: '2024-01-25T11:00:00Z',
  },
  {
    id: 4, businessName: 'Green Groceries', email: 'info@greengroceries.in',
    firstName: 'Sneha', lastName: 'Singh', phone: '+91 98765 67890',
    plan: 'PRO', status: 'INACTIVE', onboardedAt: '2024-01-18T16:45:00Z',
    trialEndsAt: '', totalProducts: 89, totalOrders: 456, totalRevenue: 567890,
    createdAt: '2024-01-14T10:15:00Z',
  },
  {
    id: 5, businessName: 'Furniture World', email: 'sales@furnitureworld.in',
    firstName: 'Vikram', lastName: 'Rathod', phone: '+91 98765 78901',
    plan: 'BUSINESS', status: 'SUSPENDED', onboardedAt: '2024-01-05T12:00:00Z',
    trialEndsAt: '', totalProducts: 67, totalOrders: 345, totalRevenue: 890123,
    createdAt: '2024-01-01T09:00:00Z',
  },
];

const statusOptions = ['All', 'Active', 'Inactive', 'Suspended', 'Trialing'];
const planOptions = ['All', 'Starter', 'Pro', 'Business'];
const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Revenue (High to Low)', value: 'revenue_desc' },
  { label: 'Revenue (Low to High)', value: 'revenue_asc' },
  { label: 'Products (High to Low)', value: 'products_desc' },
];

const formatRevenue = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const Sellers: React.FC = () => {
  const adminUser = useAdminStore((state) => state.adminUser);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSellers, setSelectedSellers] = useState<Array<string | number>>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSellers(mockSellers);
      setIsLoading(false);
    }, 300);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredSellers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = sellers.filter((seller) => {
      const matchesSearch =
        !query ||
        seller.businessName.toLowerCase().includes(query) ||
        seller.email.toLowerCase().includes(query) ||
        (seller.phone ?? '').toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'All' ||
        seller.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesPlan =
        planFilter === 'All' ||
        seller.plan.toLowerCase() === planFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPlan;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'revenue_desc':
          return b.totalRevenue - a.totalRevenue;
        case 'revenue_asc':
          return a.totalRevenue - b.totalRevenue;
        case 'products_desc':
          return b.totalProducts - a.totalProducts;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [sellers, searchQuery, statusFilter, planFilter, sortBy]);

  const selectedVisibleCount = filteredSellers.filter((seller) =>
    selectedSellers.includes(seller.id)
  ).length;

  const toggleSellerSelection = (id: string | number) => {
    setSelectedSellers((previous) =>
      previous.includes(id)
        ? previous.filter((sellerId) => sellerId !== id)
        : [...previous, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredSellers.map((seller) => seller.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedSellers.includes(id));

    setSelectedSellers((previous) =>
      allSelected
        ? previous.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...previous, ...visibleIds]))
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPlanFilter('All');
    setSortBy('newest');
  };

  const totalRevenue = sellers.reduce((sum, seller) => sum + seller.totalRevenue, 0);
  const activeCount = sellers.filter((seller) => seller.status === 'ACTIVE').length;
  const trialingCount = sellers.filter((seller) => seller.status === 'TRIALING').length;

  return (
    <div className="sellers-page">
      <header className="sellers-page__header">
        <div>
          <h1 className="sellers-page__title">Sellers</h1>
          <p className="sellers-page__subtitle">Manage all sellers on the Hypnate platform</p>
        </div>
        <Link to="/admin/sellers/new" className="sellers-primary-button">
          <Plus size={17} strokeWidth={2.2} />
          Add Seller
        </Link>
      </header>

      <SellersStats
        total={sellers.length}
        active={activeCount}
        trialing={trialingCount}
        revenue={formatRevenue(totalRevenue)}
      />

      <SellersFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        planFilter={planFilter}
        sortBy={sortBy}
        statusOptions={statusOptions}
        planOptions={planOptions}
        sortOptions={sortOptions}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onPlanChange={setPlanFilter}
        onSortChange={setSortBy}
        onClear={clearFilters}
      />

      <SellersTable
        sellers={filteredSellers}
        allSellersCount={sellers.length}
        isLoading={isLoading}
        selectedSellers={selectedSellers}
        selectedVisibleCount={selectedVisibleCount}
        onToggle={toggleSellerSelection}
        onSelectAll={selectAllVisible}
        formatRevenue={formatRevenue}
      />

      <div className="sellers-page__footer">
        <span>
          Showing {filteredSellers.length} of {sellers.length} sellers
        </span>
        <div className="sellers-page__pagination">
          <button type="button" className="sellers-secondary-button" disabled>Previous</button>
          <button type="button" className="sellers-secondary-button" disabled>Next</button>
        </div>
      </div>

      <span className="sellers-page__admin-user" aria-hidden="true">
        {adminUser?.role ?? ''}
      </span>
    </div>
  );
};

export default Sellers;
