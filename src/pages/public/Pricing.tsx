import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Check, X, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Pricing = () => {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      price: 499,
      desc: 'Perfect for side hustles and new sellers.',
      features: ['1 WhatsApp Number', '500 AI Conversations/mo', 'Basic Analytics', 'Email Support', 'Manual Catalog'],
      highlight: false
    },
    {
      name: 'Pro',
      price: 1499,
      desc: 'For growing businesses scaling up.',
      features: ['3 Team Members', 'Unlimited AI Conversations', 'Advanced Analytics', 'Priority Support', 'Auto-sync Catalog', 'Instagram Integration'],
      highlight: true
    },
    {
      name: 'Business',
      price: 4999,
      desc: 'Enterprise power for large teams.',
      features: ['Unlimited Team Members', 'Custom AI Training', 'Dedicated Account Manager', 'API Access', 'Custom Integrations', 'SLA Support'],
      highlight: false
    }
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="pt-20 pb-12 px-6 text-center bg-gray-50">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Simple, transparent pricing</h1>
        <p className="text-xl text-gray-600 mb-8">Choose the plan that fits your business stage.</p>
        
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={cn("text-sm font-medium", !annual ? "text-gray-900" : "text-gray-500")}>Monthly</span>
          <button 
            onClick={() => setAnnual(!annual)}
            className="w-12 h-6 bg-primary-600 rounded-full relative transition-colors focus:outline-none"
          >
            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300", annual ? "left-7" : "left-1")} />
          </button>
          <span className={cn("text-sm font-medium", annual ? "text-gray-900" : "text-gray-500")}>
            Yearly <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-0.5 rounded-full ml-1">SAVE 20%</span>
          </span>
        </div>
      </section>

      {/* Cards */}
      <section className="pb-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={cn(
                "bg-white rounded-2xl p-8 border transition-all duration-300 relative",
                plan.highlight 
                  ? "border-primary-500 shadow-xl scale-105 z-10" 
                  : "border-gray-200 shadow-sm hover:border-primary-200"
              )}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-gray-500 text-sm mt-2 h-10">{plan.desc}</p>
              <div className="my-6">
                <span className="text-4xl font-bold text-gray-900">₹{annual ? Math.round(plan.price * 0.8) : plan.price}</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <Link to="/signup">
                <Button 
                  variant={plan.highlight ? 'primary' : 'outline'} 
                  className="w-full mb-8"
                >
                  Start Free Trial
                </Button>
              </Link>
              <ul className="space-y-4">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Compare Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 text-gray-500 font-medium w-1/3">Features</th>
                  <th className="py-4 px-4 text-gray-900 font-bold text-center w-1/5">Starter</th>
                  <th className="py-4 px-4 text-primary-600 font-bold text-center w-1/5">Pro</th>
                  <th className="py-4 px-4 text-gray-900 font-bold text-center w-1/5">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { name: 'Conversations', s: '500', p: 'Unlimited', b: 'Unlimited' },
                  { name: 'Team Members', s: '1', p: '3', b: 'Unlimited' },
                  { name: 'Catalog Items', s: '50', p: '500', b: 'Unlimited' },
                  { name: 'Remove Branding', s: false, p: true, b: true },
                  { name: 'API Access', s: false, p: false, b: true },
                  { name: 'Support', s: 'Email', p: 'Priority', b: 'Dedicated' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-700 font-medium">{row.name}</td>
                    <td className="py-4 px-4 text-center text-gray-600">
                      {typeof row.s === 'boolean' ? (row.s ? <Check className="w-5 h-5 mx-auto text-green-500"/> : <X className="w-5 h-5 mx-auto text-gray-300"/>) : row.s}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600 font-medium bg-primary-50/30">
                      {typeof row.p === 'boolean' ? (row.p ? <Check className="w-5 h-5 mx-auto text-green-500"/> : <X className="w-5 h-5 mx-auto text-gray-300"/>) : row.p}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">
                      {typeof row.b === 'boolean' ? (row.b ? <Check className="w-5 h-5 mx-auto text-green-500"/> : <X className="w-5 h-5 mx-auto text-gray-300"/>) : row.b}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period." },
              { q: "Do I need the WhatsApp API?", a: "Yes, Hypnate works on top of the WhatsApp Business API. We help you apply for it directly from the dashboard." },
              { q: "Is there a setup fee?", a: "No, there are no setup fees for any of our plans. You only pay the subscription price." },
              { q: "Can I upgrade later?", a: "Absolutely. You can upgrade or downgrade your plan at any time from your billing settings." },
              { q: "Do you offer refunds?", a: "We offer a 14-day money-back guarantee if you're not satisfied with our service." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary-500" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 ml-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
