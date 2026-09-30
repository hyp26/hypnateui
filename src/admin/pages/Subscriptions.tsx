import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { adminSubscriptionsApi, getApiErrorMessage } from '../lib/adminApi';
import type { Subscription } from '../types';
import SubscriptionsStats from '../components/Subscriptions/SubscriptionsStats';
import SubscriptionsFilters from '../components/Subscriptions/SubscriptionsFilters';
import SubscriptionsTable from '../components/Subscriptions/SubscriptionsTable';
import '../styles/Subscriptions.css';

const statusOptions = ['All', 'Active', 'Cancelled', 'Past Due', 'Trialing', 'Expired'];
const planOptions = ['All', 'Free', 'Starter', 'Pro', 'Business'];
const billingOptions = ['All', 'Monthly', 'Yearly'];
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [billingFilter, setBillingFilter] = useState('All');

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

    return () => {
      cancelled = true;
    };
  }, []);

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
        <Link to="/admin/subscriptions" className="subscriptions-primary-button"><Plus size={17} />Add Subscription</Link>
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
    </div>
  );
};

export default Subscriptions;
