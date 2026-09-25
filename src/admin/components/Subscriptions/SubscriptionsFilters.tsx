import React,{useState} from 'react';
import {ChevronDown,ChevronUp,Filter,Search} from 'lucide-react';
interface Option{label?:string;value?:string}
interface Props{searchQuery:string;statusFilter:string;planFilter:string;billingFilter:string;statusOptions:string[];planOptions:string[];billingOptions:string[];onSearchChange:(v:string)=>void;onStatusChange:(v:string)=>void;onPlanChange:(v:string)=>void;onBillingChange:(v:string)=>void;onClear:()=>void}
const SubscriptionsFilters:React.FC<Props>=p=>{const[open,setOpen]=useState(false);return <section className="subscriptions-filters">
 <div className="subscriptions-filters__search"><Search size={17}/><input value={p.searchQuery} onChange={e=>p.onSearchChange(e.target.value)} placeholder="Search by subscription ID, seller ID..." aria-label="Search subscriptions"/>{p.searchQuery&&<button type="button" onClick={()=>p.onSearchChange('')} aria-label="Clear search">×</button>}</div>
 <div className="subscriptions-filters__menu-wrap"><button type="button" className={`subscriptions-filter-button${open?' subscriptions-filter-button--open':''}`} onClick={()=>setOpen(v=>!v)} aria-expanded={open}><Filter size={16}/>Filters{open?<ChevronUp size={15}/>:<ChevronDown size={15}/>}</button>
 {open&&<div className="subscriptions-filter-popover">
  <label><span>Status</span><select value={p.statusFilter} onChange={e=>p.onStatusChange(e.target.value)}>{p.statusOptions.map(o=><option key={o}>{o}</option>)}</select></label>
  <label><span>Plan</span><select value={p.planFilter} onChange={e=>p.onPlanChange(e.target.value)}>{p.planOptions.map(o=><option key={o}>{o}</option>)}</select></label>
  <label><span>Billing Cycle</span><select value={p.billingFilter} onChange={e=>p.onBillingChange(e.target.value)}>{p.billingOptions.map(o=><option key={o}>{o}</option>)}</select></label>
  <div className="subscriptions-filter-popover__actions"><button type="button" className="subscriptions-secondary-button" onClick={p.onClear}>Clear</button><button type="button" className="subscriptions-primary-button subscriptions-primary-button--small" onClick={()=>setOpen(false)}>Apply</button></div>
 </div>}</div>
 </section>};
export default SubscriptionsFilters;
