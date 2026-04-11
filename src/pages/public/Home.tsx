import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { MessageCircle, ShoppingBag, CreditCard, ArrowRight, Instagram, Bot, BarChart } from 'lucide-react';
import { HypnateDemoPlayer } from '../../components/public/HypnateDemoPlayer';

export const Home = () => {
    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-16 pb-24 px-4 sm:px-6 bg-gradient-to-b from-primary-50/50 to-white">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs sm:text-sm font-medium text-gray-600 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 shrink-0"></span>
                        BUILT FOR INDIAN D2C BRANDS
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-gray-900 mb-4 sm:mb-6 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 px-2">
                        Sell, Support & Scale{' '}
                        <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
                            Across WhatsApp, Instagram & Facebook
                        </span>
                    </h1>

                    <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 px-2">
                        The all-in-one social commerce platform. Automate orders, collect payments, and support customers with AI — without leaving the chat.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 px-4">
                        <Link to="/signup" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto rounded-full px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg shadow-xl shadow-primary-500/20">
                                Start Free Trial <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                        </Link>
                        <Link to="/contact" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg bg-white hover:bg-gray-50">
                                Book a Demo
                            </Button>
                        </Link>
                    </div>

                    {/* Screenshot */}
                    <div className="mt-12 sm:mt-20 relative mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 px-0">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl opacity-20 blur-3xl"></div>
                        <div className="relative bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-800 overflow-hidden aspect-[16/9] flex items-center justify-center group">
                            <HypnateDemoPlayer />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Everything you need to grow</h2>
                        <p className="text-gray-500 max-w-xl mx-auto text-base sm:text-lg">Hypnate replaces 5 different tools with one unified platform.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                        {[
                            { icon: MessageCircle, title: 'WhatsApp Commerce', desc: 'Turn chats into a storefront. Share catalogs and take orders instantly.', color: 'bg-green-100 text-green-600' },
                            { icon: Instagram, title: 'Instagram DM Sales', desc: 'Automate replies to DMs and comments. Convert followers into buyers.', color: 'bg-pink-100 text-pink-600' },
                            { icon: ShoppingBag, title: 'Order Management', desc: 'Track orders from placement to delivery with automated status updates.', color: 'bg-blue-100 text-blue-600' },
                            { icon: CreditCard, title: 'Instant Payments', desc: 'Send payment links and verify transactions automatically via Razorpay.', color: 'bg-purple-100 text-purple-600' },
                            { icon: Bot, title: 'AI Sales Agent', desc: 'A 24/7 AI agent that answers product questions, handles objections, and closes orders while you sleep.', color: 'bg-yellow-100 text-yellow-600' },
                            { icon: BarChart, title: 'Real-time Analytics', desc: 'Know exactly which channel drives revenue, which products sell, and where customers drop off — updated live.', color: 'bg-teal-100 text-teal-600' },
                        ].map((feature, idx) => (
                            <div key={idx} className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all group">
                                <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-5 h-5 sm:w-7 sm:h-7" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 sm:mb-20">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">How Hypnate Works</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">Get started in minutes, not days. No coding required.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 relative">
                        {/* Connector Line — desktop only */}
                        <div className="hidden sm:block absolute top-12 left-0 w-full h-0.5 bg-gray-800 -z-10"></div>

                        {/* Connector Line — mobile vertical */}
                        <div className="sm:hidden absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-800 -z-10"></div>

                        {[
                            { step: '01', title: 'Connect Accounts', desc: 'Link your WhatsApp Business API and social accounts in one click.' },
                            { step: '02', title: 'Upload Catalog', desc: 'Import your products via CSV or sync with your existing store.' },
                            { step: '03', title: 'Start Selling', desc: 'Automate conversations and watch your sales grow on autopilot.' },
                        ].map((item, idx) => (
                            <div key={idx} className="relative flex flex-col items-center">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-800 border-4 border-gray-900 flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary-400 z-10 relative mb-5 sm:mb-8">
                                    {item.step}
                                </div>
                                <div className="text-center px-2 sm:px-4">
                                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                                    <p className="text-gray-400 text-sm sm:text-base">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Early Access */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 bg-primary-50/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Early access now open</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
                        {[
                            { title: 'Be among the first', text: "We're onboarding early businesses to shape the future of AI commerce." },
                            { title: 'Direct feedback loop', text: "Help us build the perfect AI commerce platform with your insights." },
                            { title: 'Founding perks', text: "Early users get lifetime benefits and priority support." },
                        ].map((t, idx) => (
                            <div key={idx} className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-gray-700 mb-4 sm:mb-6 italic text-sm sm:text-base">"{t.text}"</p>
                                <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm">
                                    <span>{t.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Ready to automate your sales?</h2>
                        <p className="text-primary-100 mb-6 sm:mb-8 text-base sm:text-lg">Join early businesses building with Hypnate today.</p>
                        <Link to="/signup">
                            <Button size="lg" className="bg-white text-primary-900 hover:bg-gray-100 rounded-full px-8 sm:px-10 h-12 sm:h-14 font-bold border-0 text-base sm:text-lg">
                                Get Started for Free
                            </Button>
                        </Link>
                        <p className="mt-4 text-xs sm:text-sm text-primary-200 opacity-80">No credit card required • 14-day free trial</p>
                    </div>
                </div>
            </section>
        </div>
    );
};