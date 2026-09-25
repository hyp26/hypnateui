import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Subscription } from '../types';
import SubscriptionsStats from '../components/Subscriptions/SubscriptionsStats';
import SubscriptionsFilters from '../components/Subscriptions/SubscriptionsFilters';
import SubscriptionsTable from '../components/Subscriptions/SubscriptionsTable';
import '../styles/Subscriptions.css';

const mockSubscriptions: Subscription[] = [
  { id:'sub_123456789', sellerId:1, seller:{id:1,businessName:'Rahul Fashion House',email:'rahul@fashionhouse.in'}, plan:'PRO', status:'ACTIVE', currentPeriodEnd:'2024-02-15T00:00:00Z', billingCycle:'MONTHLY', amount:1999, paymentMethod:'razorpay', createdAt:'2024-01-15T10:30:00Z' },
  { id:'sub_987654321', sellerId:2, seller:{id:2,businessName:'Priya Boutique',email:'priya@boutique.in'}, plan:'BUSINESS', status:'ACTIVE', currentPeriodEnd:'2024-02-20T00:00:00Z', billingCycle:'YEARLY', amount:47988, paymentMethod:'razorpay', createdAt:'2024-01-20T14:00:00Z' },
  { id:'sub_456789123', sellerId:3, seller:{id:3,businessName:'Tech Gadgets',email:'contact@techgadgets.in'}, plan:'STARTER', status:'TRIALING', currentPeriodEnd:'2024-02-15T00:00:00Z', billingCycle:'MONTHLY', amount:999, paymentMethod:'none', createdAt:'2024-01-25T11:00:00Z' },
  { id:'sub_789123456', sellerId:4, seller:{id:4,businessName:'Green Groceries',email:'info@greengroceries.in'}, plan:'PRO', status:'CANCELLED', currentPeriodEnd:'2024-01-31T00:00:00Z', billingCycle:'MONTHLY', amount:1999, paymentMethod:'razorpay', createdAt:'2024-01-14T10:15:00Z' },
  { id:'sub_321654987', sellerId:5, seller:{id:5,businessName:'Furniture World',email:'sales@furnitureworld.in'}, plan:'BUSINESS', status:'PAST_DUE', currentPeriodEnd:'2024-01-30T00:00:00Z', billingCycle:'MONTHLY', amount:5000, paymentMethod:'razorpay', createdAt:'2024-01-01T09:00:00Z' },
];
const statusOptions=['All','Active','Cancelled','Past Due','Trialing'];
const planOptions=['All','Starter','Pro','Business'];
const billingOptions=['All','Monthly','Yearly'];
const formatCurrency=(amount:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(amount);

export const Subscriptions:React.FC=()=>{
 const [subscriptions,setSubscriptions]=useState<Subscription[]>([]);
 const [isLoading,setIsLoading]=useState(true);
 const [searchQuery,setSearchQuery]=useState('');
 const [statusFilter,setStatusFilter]=useState('All');
 const [planFilter,setPlanFilter]=useState('All');
 const [billingFilter,setBillingFilter]=useState('All');
 useEffect(()=>{const timer=window.setTimeout(()=>{setSubscriptions(mockSubscriptions);setIsLoading(false)},300);return()=>window.clearTimeout(timer)},[]);
 const filteredSubscriptions=useMemo(()=>{const query=searchQuery.trim().toLowerCase();return subscriptions.filter(sub=>{
  const matchesSearch=!query||sub.id.toLowerCase().includes(query)||sub.sellerId.toString().includes(query)||(sub.paymentMethod??'').toLowerCase().includes(query)||(sub.seller?.businessName??'').toLowerCase().includes(query);
  const matchesStatus=statusFilter==='All'||sub.status.toLowerCase()===statusFilter.toLowerCase().replace(' ','_');
  const matchesPlan=planFilter==='All'||sub.plan.toLowerCase()===planFilter.toLowerCase();
  const matchesBilling=billingFilter==='All'||sub.billingCycle.toLowerCase()===billingFilter.toLowerCase();
  return matchesSearch&&matchesStatus&&matchesPlan&&matchesBilling;
 })},[subscriptions,searchQuery,statusFilter,planFilter,billingFilter]);
 const monthlyRevenue=subscriptions.filter(s=>s.billingCycle==='MONTHLY'&&s.status==='ACTIVE').reduce((sum,s)=>sum+s.amount,0);
 const yearlyRevenue=subscriptions.filter(s=>s.billingCycle==='YEARLY'&&s.status==='ACTIVE').reduce((sum,s)=>sum+s.amount,0);
 const clearFilters=()=>{setSearchQuery('');setStatusFilter('All');setPlanFilter('All');setBillingFilter('All')};
 return <div className="subscriptions-page">
  <header className="subscriptions-page__header"><div><h1 className="subscriptions-page__title">Subscriptions</h1><p className="subscriptions-page__subtitle">Manage all subscriptions and billing</p></div><Link to="/admin/subscriptions/new" className="subscriptions-primary-button"><Plus size={17}/>Add Subscription</Link></header>
  <SubscriptionsStats total={subscriptions.length} active={subscriptions.filter(s=>s.status==='ACTIVE').length} monthlyRevenue={formatCurrency(monthlyRevenue)} yearlyRevenue={formatCurrency(yearlyRevenue)}/>
  <SubscriptionsFilters searchQuery={searchQuery} statusFilter={statusFilter} planFilter={planFilter} billingFilter={billingFilter} statusOptions={statusOptions} planOptions={planOptions} billingOptions={billingOptions} onSearchChange={setSearchQuery} onStatusChange={setStatusFilter} onPlanChange={setPlanFilter} onBillingChange={setBillingFilter} onClear={clearFilters}/>
  <SubscriptionsTable subscriptions={filteredSubscriptions} isLoading={isLoading} formatCurrency={formatCurrency}/>
  {!isLoading&&<footer className="subscriptions-page__footer"><span>Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions</span><div className="subscriptions-page__pagination"><button type="button" className="subscriptions-secondary-button" disabled>Previous</button><button type="button" className="subscriptions-secondary-button" disabled>Next</button></div></footer>}
 </div>;
};
export default Subscriptions;
