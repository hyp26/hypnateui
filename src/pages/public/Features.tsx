import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { MessageCircle, Zap, CreditCard, ArrowRight } from 'lucide-react';

export const Features = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-20 pb-20 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Everything your business needs <br />
            <span className="text-primary-400">Powered by AI</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            From first hello to final delivery, Hypnate automates the entire commerce lifecycle on WhatsApp and Instagram.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Sections */}
      <div className="space-y-0">
        {/* Feature 1 */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">WhatsApp Commerce</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Turn your WhatsApp number into a full-fledged online store. Showcase products, manage carts, and accept orders without sending customers to a website.
              </p>
              <ul className="space-y-3 mb-8">
                {['Interactive Product Catalogs', 'Automated Cart Recovery', 'Broadcast Marketing Campaigns'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 aspect-square relative group">
              <img 
                src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80" 
                alt="WhatsApp Commerce Interface" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                <div className="text-white">
                  <p className="font-bold text-lg">Unified Inbox</p>
                  <p className="text-sm opacity-90">Manage all chats in one place</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2 */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100 aspect-square relative group">
               <img 
                 src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80" 
                 alt="AI Agent" 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                <div className="text-white">
                  <p className="font-bold text-lg">Smart AI Responses</p>
                  <p className="text-sm opacity-90">24/7 Customer Support</p>
                </div>
              </div>
            </div>
            <div>
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Support Agent</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Stop answering "Price please?" manually. Our AI agent understands context, handles FAQs, checks stock, and even negotiates deals in multiple languages.
              </p>
              <ul className="space-y-3 mb-8">
                {['24/7 Instant Replies', 'Hindi/English Translation', 'Smart Handoff to Humans'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs">✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Feature 3 */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                <CreditCard className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Payments & Orders</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Generate payment links instantly within the chat. Track order status from "Confirmed" to "Delivered" and keep customers updated automatically.
              </p>
              <ul className="space-y-3 mb-8">
                {['Razorpay & UPI Integration', 'Automated Invoicing', 'Real-time Order Tracking'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 aspect-square relative group">
               <img 
                 src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=800&q=80" 
                 alt="Payments" 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                <div className="text-white">
                  <p className="font-bold text-lg">Seamless Payments</p>
                  <p className="text-sm opacity-90">UPI, Cards & Netbanking</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      <section className="py-24 px-6 bg-primary-600 text-white text-center">
         <h2 className="text-3xl font-bold mb-8">Ready to explore?</h2>
         <Link to="/signup">
            <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100 rounded-full px-10 h-14 font-bold">
              Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
         </Link>
      </section>
    </div>
  );
};
