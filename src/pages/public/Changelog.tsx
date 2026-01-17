import React from 'react';
import { Tag, Sparkles, Wrench, Bug } from 'lucide-react';
import { cn } from '../../lib/utils';

const CHANGES = [
  {
    version: 'v2.1.0',
    date: 'October 24, 2024',
    title: 'Instagram DM Automation & Analytics 2.0',
    type: 'major',
    items: [
      { type: 'feature', text: 'Added full support for Instagram DM automation. You can now manage IG chats alongside WhatsApp.' },
      { type: 'feature', text: 'New Analytics Dashboard with deeper insights into conversation-to-order conversion rates.' },
      { type: 'improvement', text: 'Improved message delivery speed by 40%.' },
      { type: 'fix', text: 'Fixed an issue where image uploads were failing on slow connections.' }
    ]
  },
  {
    version: 'v2.0.5',
    date: 'October 10, 2024',
    title: 'Quick Replies & Templates',
    type: 'minor',
    items: [
      { type: 'feature', text: 'Added "Quick Replies" library. Save common responses and send them with a click.' },
      { type: 'improvement', text: 'Updated the product catalog UI for better mobile responsiveness.' },
      { type: 'fix', text: 'Resolved a timezone bug in the order history view.' }
    ]
  },
  {
    version: 'v2.0.0',
    date: 'September 15, 2024',
    title: 'The AI Update',
    type: 'major',
    items: [
      { type: 'feature', text: 'Launched Hypnate AI Agent: Automatically handle FAQs and check stock status.' },
      { type: 'feature', text: 'Multi-language support: AI now translates messages between English and Hindi in real-time.' },
      { type: 'improvement', text: 'Complete redesign of the dashboard navigation.' }
    ]
  },
  {
    version: 'v1.5.0',
    date: 'August 01, 2024',
    title: 'Payments Integration',
    type: 'minor',
    items: [
      { type: 'feature', text: 'Razorpay integration is now live. Generate payment links directly within chat.' },
      { type: 'improvement', text: 'Added "Paid" and "Pending" status filters to the Order list.' }
    ]
  }
];

export const Changelog = () => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Sparkles className="w-4 h-4 text-green-500" />;
      case 'improvement': return <Wrench className="w-4 h-4 text-blue-500" />;
      case 'fix': return <Bug className="w-4 h-4 text-red-500" />;
      default: return <Tag className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gray-50 pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Product Changelog</h1>
          <p className="text-xl text-gray-600">New updates and improvements to Hypnate.</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative border-l-2 border-gray-200 ml-4 md:ml-0 space-y-16">
            {CHANGES.map((release, idx) => (
              <div key={idx} className="relative pl-8 md:pl-0">
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] md:left-1/2 md:-translate-x-1/2 top-0 w-4 h-4 rounded-full bg-white border-4 border-primary-500"></div>
                
                <div className={cn(
                  "md:flex gap-12 items-start",
                  idx % 2 === 0 ? "md:flex-row-reverse" : ""
                )}>
                  {/* Date Column (Desktop) */}
                  <div className={cn(
                    "hidden md:block w-1/2 pt-1",
                    idx % 2 === 0 ? "text-left pl-12" : "text-right pr-12"
                  )}>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{release.date}</span>
                  </div>

                  {/* Content Column */}
                  <div className={cn(
                    "w-full md:w-1/2",
                    idx % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                  )}>
                    {/* Mobile Date */}
                    <span className="md:hidden text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{release.date}</span>
                    
                    <div className={cn(
                      "inline-flex items-center gap-3 mb-4",
                      idx % 2 === 0 ? "md:flex-row-reverse" : ""
                    )}>
                      <h2 className="text-2xl font-bold text-gray-900">{release.version}</h2>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                        release.type === 'major' ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {release.type} Update
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">{release.title}</h3>
                    
                    <ul className="space-y-4">
                      {release.items.map((item, i) => (
                        <li key={i} className={cn(
                          "flex items-start gap-3",
                          idx % 2 === 0 ? "md:flex-row-reverse md:text-right" : ""
                        )}>
                          <div className="mt-1 shrink-0 bg-gray-50 p-1.5 rounded-md border border-gray-100">
                            {getTypeIcon(item.type)}
                          </div>
                          <span className="text-gray-600 leading-relaxed">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
