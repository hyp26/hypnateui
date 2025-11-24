import React from 'react';
import { Users, Heart, Zap, Shield } from 'lucide-react';

export const About = () => {
  const teamMembers = [
    { 
      id: 1, 
      name: 'Hamim Quazi Syed Frahuddin', 
      role: 'Founder & CEO', 
      image: '/assets/Hamim.jpeg' 
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-20 pb-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-gray-900 mb-6">
            Empowering the next generation of <br />
            <span className="text-primary-600">Social Entrepreneurs</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            At Hypnate, we believe that commerce should be conversational, personal, and accessible to everyone. We're building the tools to make that happen.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" 
              alt="Team working" 
              className="rounded-2xl shadow-xl"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why we started Hypnate</h2>
            <div className="space-y-4 text-gray-600 text-lg">
              <p>
                In September 2025, we noticed a shift. Small businesses in India weren't building websites; they were building communities on WhatsApp and Instagram.
              </p>
              <p>
                But managing hundreds of DMs, tracking orders manually, and collecting payments was a nightmare. They needed a tool that worked where they worked.
              </p>
              <p>
                That's why we built Hypnate. To give every merchant the power of an enterprise e-commerce stack, right inside their chat window.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-primary-200">The principles that guide every decision we make.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: 'Innovation', desc: 'We constantly push the boundaries of what AI can do for commerce.' },
              { icon: Shield, title: 'Trust', desc: 'We treat user data with the highest level of security and respect.' },
              { icon: Heart, title: 'Simplicity', desc: 'We build complex tech so you can have a simple experience.' },
              { icon: Users, title: 'Impact', desc: 'We measure our success by the growth of the businesses we serve.' },
            ].map((val, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/10">
                <val.icon className="w-8 h-8 text-secondary-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{val.title}</h3>
                <p className="text-primary-100 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-16">Meet the Team</h2>
          
          {/* FIXED: Centered */}
          <div className="grid grid-cols-1 gap-8 place-items-center">
            {teamMembers.map((member) => (
              <div key={member.id} className="group">
                <div className="w-full aspect-square bg-gray-100 rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100 max-w-xs mx-auto">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-20">
            <p className="text-xl text-gray-600 mb-6">Want to build the future of commerce with us?</p>
            <button className="text-primary-600 font-bold hover:text-primary-700 hover:underline text-lg">
              View Open Positions &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
