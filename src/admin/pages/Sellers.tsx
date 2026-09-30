import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAdminStore } from '../stores/useAdminStore';
import { adminSellersApi, getApiErrorMessage } from '../lib/adminApi';
import type { Seller } from '../types';
import SellersStats from '../components/Sellers/SellersStats';
import SellersFilters from '../components/Sellers/SellersFilters';
import SellersTable from '../components/Sellers/SellersTable';
import '../styles/Sellers.css';

const statusOptions = ['All', 'Active', 'Inactive', 'Suspended', 'Trialing'];
const planOptions = ['All', 'Free', 'Starter', 'Pro', 'Business'];
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
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSellers, setSelectedSellers] = useState<Array<string | number>>([]);

  useEffect(() => {
    let cancelled = false;

    adminSellersApi
      .list({ limit: 100 })
      .then((response) => {
        if (cancelled) return;
        setSellers(response.data as unknown as Seller[]);
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

      {loadError && (
        <div className="sellers-page__error" role="alert">
          {loadError}
        </div>
      )}

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
        allSellersCount={totalCount || sellers.length}
        isLoading={isLoading}
        selectedSellers={selectedSellers}
        selectedVisibleCount={selectedVisibleCount}
        onToggle={toggleSellerSelection}
        onSelectAll={selectAllVisible}
        formatRevenue={formatRevenue}
      />

      <div className="sellers-page__footer">
        <span>
          Showing {filteredSellers.length} of {totalCount || sellers.length} sellers
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
