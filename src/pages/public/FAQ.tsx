import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

const FAQS = [
  {
    category: 'Getting Started',
    questions: [
      { q: 'What do I need to start using Hypnate?', a: 'To get started, you need a valid phone number (not currently connected to WhatsApp personal app) and a Facebook Business Manager account. We guide you through the verification process.' },
      { q: 'Is there a free trial?', a: 'Yes! We offer a 14-day free trial on all plans. No credit card is required to start.' },
      { q: 'Can I use my existing WhatsApp number?', a: 'Yes, but you will need to delete your personal WhatsApp account associated with that number to migrate it to the WhatsApp Business API. We recommend getting a new number for business use.' }
    ]
  },
  {
    category: 'Billing & Pricing',
    questions: [
      { q: 'Are there any setup fees?', a: 'No, Hypnate does not charge any setup fees. However, Meta (Facebook) may charge for conversation fees directly.' },
      { q: 'What are WhatsApp conversation charges?', a: 'WhatsApp charges per 24-hour conversation session. The first 1,000 service conversations each month are free. Hypnate does not mark up these fees.' },
      { q: 'Can I cancel my subscription anytime?', a: 'Absolutely. You can cancel your monthly subscription at any time from your dashboard settings.' }
    ]
  },
  {
    category: 'Features & AI',
    questions: [
      { q: 'How does the AI agent work?', a: 'Our AI is trained on your product catalog and past conversations. It can answer FAQs, check stock, and even take orders. You can intervene at any time.' },
      { q: 'Does it support languages other than English?', a: 'Yes! Hypnate supports real-time translation for Hindi, Hinglish, and 10+ other Indian regional languages.' },
      { q: 'Is my data secure?', a: 'Yes. We use enterprise-grade encryption and are GDPR compliant. We do not sell your customer data to third parties.' }
    ]
  }
];

const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className={cn("text-lg font-medium transition-colors", isOpen ? "text-primary-600" : "text-gray-900 group-hover:text-primary-600")}>
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-primary-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
        )}
      </button>
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export const FAQ = () => {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gray-50 pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 mb-8">Have questions? We're here to help.</p>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for answers..." 
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          {FAQS.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.category}</h2>
              <div className="bg-white rounded-2xl border border-gray-200 px-6 shadow-sm">
                {section.questions.map((item, i) => (
                  <AccordionItem key={i} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 bg-primary-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-8">Can't find the answer you're looking for? Please chat to our friendly team.</p>
          <div className="flex justify-center gap-4">
            <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
              Contact Support
            </button>
            <button className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              WhatsApp Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
