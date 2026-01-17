import React from 'react';
import { Button } from '../../components/ui/Button';
import { Rocket, Heart, Coffee, Globe, Smile } from 'lucide-react';

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
              { icon: Rocket, title: 'High Impact', desc: 'Your work will directly impact thousands of merchants.' },
              { icon: Heart, title: 'Health First', desc: 'Comprehensive health insurance for you and your family.' },
              { icon: Globe, title: 'Remote Friendly', desc: 'Work from anywhere. We trust you to deliver.' },
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

      {/* Open Roles - Updated */}
      {/* Open Roles - Updated */}
<section className="py-24 px-6 bg-gray-50">
  <div className="max-w-5xl mx-auto text-center fade-in-up">
    <h2 className="text-3xl font-bold text-gray-900 mb-6">Open Positions</h2>

    <p className="text-lg text-gray-600 mb-12 animate-fade">
      No roles available right now — new openings will be posted soon.
    </p>

    <div className="flex flex-col items-center gap-6">
      <Button 
        variant="outline" 
        className="rounded-full px-8 py-3 text-primary-700 border-primary-300 
                   hover:bg-primary-50 transition-all duration-300 hover:scale-105"
      >
        Notify Me
      </Button>

      <a
        href="https://www.linkedin.com/company/hypnate/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-900
                   transition-all duration-300 hover:scale-105"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.48 1s2.5 1.12 2.5 2.5zM.4 8.98h4.16V24H.4zM8.34 8.98h3.99v2.03h.06c.55-1.04 1.88-2.14 3.86-2.14 4.13 0 4.89 2.72 4.89 6.26V24h-4.16v-7.09c0-1.69-.03-3.87-2.36-3.87-2.36 0-2.72 1.84-2.72 3.74V24H8.34z"/>
        </svg>

        Follow us on LinkedIn for future roles
      </a>
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
