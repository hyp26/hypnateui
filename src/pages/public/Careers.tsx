import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Rocket, Heart, Coffee, Globe, ArrowRight, Smile } from 'lucide-react';

export const Careers = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-20 pb-24 px-6 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-900/20 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-300 text-sm font-medium mb-6 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              We are hiring!
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Join the Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                AI Commerce
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl">
              We're building the operating system for social commerce in emerging markets. 
              Come help us empower millions of small businesses.
            </p>
            <Button size="lg" className="rounded-full px-8 h-14 text-lg bg-white text-gray-900 hover:bg-gray-100 border-0">
              View Open Roles
            </Button>
          </div>
        </div>
      </section>

      {/* Culture / Benefits */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why work at Hypnate?</h2>
            <p className="text-gray-600">More than just a job. It's a mission.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Rocket, title: 'High Impact', desc: 'Your code will directly affect the livelihoods of thousands of merchants.' },
              { icon: Heart, title: 'Health First', desc: 'Comprehensive health insurance for you and your family.' },
              { icon: Globe, title: 'Remote Friendly', desc: 'Work from anywhere. We care about output, not hours in a chair.' },
              { icon: Coffee, title: 'Learning Budget', desc: 'Annual stipend for courses, books, and conferences.' },
            ].map((item, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm mb-6">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Open Positions</h2>
          
          <div className="space-y-4">
            {[
              { role: 'Senior Frontend Engineer', dept: 'Engineering', loc: 'Remote (India)', type: 'Full-time' },
              { role: 'Product Designer', dept: 'Design', loc: 'Bengaluru / Remote', type: 'Full-time' },
              { role: 'Backend Developer (Node.js)', dept: 'Engineering', loc: 'Remote', type: 'Full-time' },
              { role: 'Customer Success Manager', dept: 'Sales', loc: 'Mumbai', type: 'Full-time' },
              { role: 'AI/ML Engineer', dept: 'Engineering', loc: 'Bengaluru', type: 'Full-time' },
            ].map((job, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{job.role}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>{job.dept}</span>
                    <span>•</span>
                    <span>{job.loc}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>
                </div>
                <Button variant="outline" className="shrink-0 group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:border-primary-200">
                  Apply Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Photos */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-4 mt-12">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80" className="rounded-2xl w-full" alt="Office" />
              <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&q=80" className="rounded-2xl w-full" alt="Meeting" />
            </div>
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=400&q=80" className="rounded-2xl w-full" alt="Team" />
              <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80" className="rounded-2xl w-full" alt="Work" />
            </div>
            <div className="space-y-4 mt-8">
              <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80" className="rounded-2xl w-full" alt="Happy" />
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80" className="rounded-2xl w-full" alt="Collaboration" />
            </div>
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=80" className="rounded-2xl w-full" alt="Strategy" />
              <div className="bg-primary-100 rounded-2xl w-full aspect-[3/4] flex items-center justify-center p-6 text-center">
                <div>
                  <Smile className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-primary-900">This could be you!</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
