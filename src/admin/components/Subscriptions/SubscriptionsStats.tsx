import React from 'react';
interface Props{total:number;active:number;monthlyRevenue:string;yearlyRevenue:string}
const SubscriptionsStats:React.FC<Props>=({total,active,monthlyRevenue,yearlyRevenue})=><section className="subscriptions-stats" aria-label="Subscription statistics">
 <div className="subscriptions-stat-card"><span className="subscriptions-stat-card__label">Total Subscriptions</span><strong className="subscriptions-stat-card__value">{total}</strong></div>
 <div className="subscriptions-stat-card"><span className="subscriptions-stat-card__label">Active</span><strong className="subscriptions-stat-card__value subscriptions-stat-card__value--green">{active}</strong></div>
 <div className="subscriptions-stat-card"><span className="subscriptions-stat-card__label">Monthly Revenue</span><strong className="subscriptions-stat-card__value subscriptions-stat-card__value--revenue">{monthlyRevenue}</strong></div>
 <div className="subscriptions-stat-card"><span className="subscriptions-stat-card__label">Yearly Revenue</span><strong className="subscriptions-stat-card__value subscriptions-stat-card__value--revenue">{yearlyRevenue}</strong></div>
</section>;
export default SubscriptionsStats;
