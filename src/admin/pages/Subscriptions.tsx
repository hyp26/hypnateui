import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Plus } from 'lucide-react';
import { adminSellersApi, adminSubscriptionsApi, getApiErrorMessage, type AdminSeller } from '../lib/adminApi';
import { useAdminStore } from '../stores/useAdminStore';
import type { Subscription } from '../types';
import SubscriptionsStats from '../components/Subscriptions/SubscriptionsStats';
import SubscriptionsFilters from '../components/Subscriptions/SubscriptionsFilters';
import SubscriptionsTable from '../components/Subscriptions/SubscriptionsTable';
import FreeAccessGrantsSection from '../components/Subscriptions/FreeAccessGrantsSection';
import GrantFreeAccessDialog from '../components/Subscriptions/GrantFreeAccessDialog';
import FreeAccessModal from '../components/Sellers/FreeAccessModal';
import '../styles/Subscriptions.css';

const statusOptions = ['All', 'Active', 'Cancelled', 'Past Due', 'Trialing', 'Expired'];
const planOptions = ['All', 'Free', 'Starter', 'Pro', 'Business'];
const billingOptions = ['All', 'Monthly', 'Yearly'];
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const Subscriptions: React.FC = () => {
  const adminUser = useAdminStore((state) => state.adminUser);

  // Free-access management is a SUPER_ADMIN-only capability.
  // This is a UI convenience only: the backend independently
  // rejects grant/change/revoke requests from ADMIN and SUPPORT
  // users with HTTP 403.
  const canManageFreeAccess = adminUser?.role === 'SUPER_ADMIN';

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [grantSellers, setGrantSellers] = useState<AdminSeller[]>([]);
  const [isGrantsLoading, setIsGrantsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [billingFilter, setBillingFilter] = useState('All');

  // Free-access workflow state: seller picker → shared grant modal.
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [grantModalSeller, setGrantModalSeller] = useState<AdminSeller | null>(null);

  const loadSubscriptions = () => {
    adminSubscriptionsApi
      .list({ limit: 100 })
      .then((response) => {
        setSubscriptions(response.data as unknown as Subscription[]);
        setIsLoading(false);
      })
      .catch((error) => {
        setLoadError(getApiErrorMessage(error));
        setIsLoading(false);
      });
  };

  // Grant data reuses the admin sellers list: accessSource /
  // adminGrant describe every active administrative grant.
  const loadGrantSellers = () => {
    adminSellersApi
      .list({ limit: 100 })
      .then((response) => {
        setGrantSellers(response.data);
        setIsGrantsLoading(false);
      })
      .catch(() => {
        // The grants section degrades to its empty state; the main
        // subscriptions view is unaffected.
        setIsGrantsLoading(false);
      });
  };

  useEffect(() => {
    let cancelled = false;

    adminSubscriptionsApi
      .list({ limit: 100 })
      .then((response) => {
        if (cancelled) return;
        setSubscriptions(response.data as unknown as Subscription[]);
        setIsLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(getApiErrorMessage(error));
        setIsLoading(false);
      });

    adminSellersApi
      .list({ limit: 100 })
      .then((response) => {
        if (cancelled) return;
        setGrantSellers(response.data);
        setIsGrantsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsGrantsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshAfterGrantChange = () => {
    setGrantModalSeller(null);
    setIsPickerOpen(false);
    // Effective access changed: refresh both the grants section
    // and the paid-subscriptions view.
    loadGrantSellers();
    loadSubscriptions();
  };

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return subscriptions.filter((sub) => {
      const matchesSearch =
        !query ||
        sub.id.toLowerCase().includes(query) ||
        sub.sellerId.toString().includes(query) ||
        (sub.paymentMethod ?? '').toLowerCase().includes(query) ||
        (sub.seller?.businessName ?? '').toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'All' || sub.status.toLowerCase() === statusFilter.toLowerCase().replace(' ', '_');
      const matchesPlan = planFilter === 'All' || sub.plan.toLowerCase() === planFilter.toLowerCase();
      const matchesBilling =
        billingFilter === 'All' || sub.billingCycle.toLowerCase() === billingFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesPlan && matchesBilling;
    });
  }, [subscriptions, searchQuery, statusFilter, planFilter, billingFilter]);

  const monthlyRevenue = subscriptions
    .filter((s) => s.billingCycle === 'MONTHLY' && s.status === 'ACTIVE')
    .reduce((sum, s) => sum + s.amount, 0);
  const yearlyRevenue = subscriptions
    .filter((s) => s.billingCycle === 'YEARLY' && s.status === 'ACTIVE')
    .reduce((sum, s) => sum + s.amount, 0);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPlanFilter('All');
    setBillingFilter('All');
  };

  return (
    <div className="subscriptions-page">
      <header className="subscriptions-page__header">
        <div>
          <h1 className="subscriptions-page__title">Subscriptions</h1>
          <p className="subscriptions-page__subtitle">Manage all subscriptions and billing</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {canManageFreeAccess && (
            <button
              type="button"
              className="subscriptions-secondary-button"
              onClick={() => setIsPickerOpen(true)}
              aria-label="Grant free access to a seller"
            >
              <Gift size={15} /> Grant Free Access
            </button>
          )}
          <Link to="/admin/subscriptions" className="subscriptions-primary-button"><Plus size={17} />Add Subscription</Link>
        </div>
      </header>
      <SubscriptionsStats
        total={subscriptions.length}
        active={subscriptions.filter((s) => s.status === 'ACTIVE').length}
        monthlyRevenue={formatCurrency(monthlyRevenue)}
        yearlyRevenue={formatCurrency(yearlyRevenue)}
      />
      {loadError && (
        <div className="subscriptions-page__error" role="alert">
          {loadError}
        </div>
      )}
      <SubscriptionsFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        planFilter={planFilter}
        billingFilter={billingFilter}
        statusOptions={statusOptions}
        planOptions={planOptions}
        billingOptions={billingOptions}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onPlanChange={setPlanFilter}
        onBillingChange={setBillingFilter}
        onClear={clearFilters}
      />
      <SubscriptionsTable subscriptions={filteredSubscriptions} isLoading={isLoading} formatCurrency={formatCurrency} />
      {!isLoading && (
        <footer className="subscriptions-page__footer">
          <span>Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions</span>
          <div className="subscriptions-page__pagination">
            <button type="button" className="subscriptions-secondary-button" disabled>Previous</button>
            <button type="button" className="subscriptions-secondary-button" disabled>Next</button>
          </div>
        </footer>
      )}
      <FreeAccessGrantsSection
        sellers={grantSellers}
        isLoading={isGrantsLoading}
        canManageFreeAccess={canManageFreeAccess}
        onManageGrant={setGrantModalSeller}
      />
      <span className="subscriptions-page__admin-user" aria-hidden="true">
        {adminUser?.role ?? ''}
      </span>
      {isPickerOpen && (
        <GrantFreeAccessDialog
          onClose={() => setIsPickerOpen(false)}
          onSellerSelected={(seller) => {
            setIsPickerOpen(false);
            setGrantModalSeller(seller);
          }}
        />
      )}
      {canManageFreeAccess && grantModalSeller && (
        <FreeAccessModal
          seller={grantModalSeller}
          onClose={() => setGrantModalSeller(null)}
          onSuccess={refreshAfterGrantChange}
        />
      )}
    </div>
  );
};

export default Subscriptions;
