import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { MessageCircle, ShoppingBag, CreditCard, ArrowRight, Star, Instagram } from 'lucide-react';

export const Home = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 bg-gradient-to-b from-primary-50/50 to-white">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            Trusted by 10,000+ Indian Businesses
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mb-6 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
            Sell, Support & Scale <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
              Across WhatsApp, Instagram & Facebook
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            The all-in-one social commerce platform. Automate orders, collect payments, and support customers with AI — without leaving the chat.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Link to="/signup">
              <Button size="lg" className="rounded-full px-8 h-14 text-lg shadow-xl shadow-primary-500/20">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg bg-white hover:bg-gray-50">
                Book a Demo
              </Button>
            </Link>
          </div>

          {/* Screenshot Placeholder */}
          <div className="mt-20 relative mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl opacity-20 blur-3xl"></div>
            <div className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden aspect-[16/9] flex items-center justify-center group">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80" 
                alt="Hypnate Dashboard Interface" 
                className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-white font-medium animate-pulse">
                  Live Dashboard Preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to grow</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">Hypnate replaces 5 different tools with one unified platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: MessageCircle, title: 'WhatsApp Commerce', desc: 'Turn chats into a storefront. Share catalogs and take orders instantly.', color: 'bg-green-100 text-green-600' },
              { icon: Instagram, title: 'Instagram DM Sales', desc: 'Automate replies to DMs and comments. Convert followers into buyers.', color: 'bg-pink-100 text-pink-600' },
              { icon: ShoppingBag, title: 'Order Management', desc: 'Track orders from placement to delivery with automated status updates.', color: 'bg-blue-100 text-blue-600' },
              { icon: CreditCard, title: 'Instant Payments', desc: 'Send payment links and verify transactions automatically via Razorpay.', color: 'bg-purple-100 text-purple-600' },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all group">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How Hypnate Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Get started in minutes, not days. No coding required.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-800 -z-10"></div>

            {[
              { step: '01', title: 'Connect Accounts', desc: 'Link your WhatsApp Business API and social accounts in one click.' },
              { step: '02', title: 'Upload Catalog', desc: 'Import your products via CSV or sync with your existing store.' },
              { step: '03', title: 'Start Selling', desc: 'Automate conversations and watch your sales grow on autopilot.' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-800 border-4 border-gray-900 flex items-center justify-center text-3xl font-bold text-primary-400 mx-auto mb-8 z-10 relative">
                  {item.step}
                </div>
                <div className="text-center px-4">
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-primary-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Loved by Merchants</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Priya Sharma', role: 'Founder, EthnicWeaves', text: "Hypnate transformed how we handle inquiries. The AI agent saves us 4 hours every day!" },
              { name: 'Rahul Verma', role: 'Owner, UrbanKicks', text: "Sales went up by 40% after we started using the WhatsApp catalog feature. Highly recommended." },
              { name: 'Anjali Gupta', role: 'Marketing Head, GlowCosmetics', text: "The best part is the unified inbox. My team no longer switches between apps." },
            ].map((t, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-gray-700 mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to automate your sales?</h2>
            <p className="text-primary-100 mb-8 text-lg">Join thousands of businesses growing with Hypnate today.</p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-primary-900 hover:bg-gray-100 rounded-full px-10 h-14 font-bold border-0">
                Get Started for Free
              </Button>
            </Link>
            <p className="mt-4 text-sm text-primary-200 opacity-80">No credit card required • 14-day free trial</p>
          </div>
        </div>
      </section>
    </div>
  );
};
