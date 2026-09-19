import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FAQStructuredData } from '../../components/public/StructuredData';

const FAQS = [
  {
    category: 'Getting Started',
    questions: [
      { q: 'What do I need to start using Hypnate?', a: 'To get started, you need a business phone number and the required Meta business setup for the channels you want to connect. We guide you through the supported verification process.' },
      { q: 'Is there a free trial?', a: 'Trial or pilot availability is shown with the current plan and signup terms. Any applicable payment-method requirement is shown before you start.' },
      { q: 'Can I use my existing WhatsApp number?', a: 'Whether an existing number can be used depends on its current WhatsApp setup and the Meta onboarding path. We guide you through the supported setup; a separate business number may be the simplest option.' }
    ]
  },
  {
    category: 'Billing & Pricing',
    questions: [
      { q: 'Are there any setup fees?', a: 'Hypnate does not list a separate setup fee in its current pricing. Third-party platforms and services connected to your account may have their own charges.' },
      { q: 'What are WhatsApp messaging charges?', a: 'Meta applies its own WhatsApp Business Platform pricing and messaging policies. Charges can vary by message or conversation type, market, and the pricing Meta currently publishes. Check Meta’s current pricing for the latest rates.' },
      { q: 'How do I cancel my subscription?', a: 'Cancellation and billing options are governed by the plan and checkout terms shown for your account. Contact us if you need help with a cancellation or billing request.' }
    ]
  },
  {
    category: 'Features & AI',
    questions: [
      { q: 'How does the AI agent work?', a: 'Our AI can use your configured catalog and business information to assist with FAQs, product questions, and supported order workflows. Human agents can intervene when needed.' },
      { q: 'Does it support languages other than English?', a: 'Hypnate can support English and Hindi in supported AI workflows. Language availability may vary by feature and configuration.' },
      { q: 'Is my data secure?', a: 'We use security controls including encryption and secure authentication to protect platform data. See our Privacy Policy for details on how data is handled.' }
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
  const structuredQuestions = FAQS.flatMap(section => section.questions);

  return (
    <div className="bg-white min-h-screen">
      <FAQStructuredData questions={structuredQuestions} />
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
          <p className="text-gray-600 mb-8">Can't find the answer you're looking for? Contact the team and we'll help with your question.</p>
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
