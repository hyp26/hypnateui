import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

const BLOG_POSTS = [
  {
    id: 1,
    slug: 'whatsapp-commerce-guide-2025',
    title: 'The Ultimate Guide to WhatsApp Commerce in 2025',
    excerpt: 'Discover how Indian SMBs are shifting from websites to conversational commerce and increasing conversion rates by 3x.',
    category: 'Commerce',
    author: 'Priya Sharma',
    date: 'Oct 12, 2024',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80'
  },
  {
    id: 2,
    slug: 'ai-customer-support-automation',
    title: 'Automating Customer Support without Losing the Human Touch',
    excerpt: 'Learn how to train AI agents to handle 80% of your queries while keeping your brand voice authentic.',
    category: 'AI Technology',
    author: 'Rahul Verma',
    date: 'Oct 08, 2024',
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80'
  },
  {
    id: 3,
    slug: 'instagram-dm-sales-strategies',
    title: '5 Instagram DM Strategies to Close More Sales',
    excerpt: 'Stop sending links. Start having conversations. Here are the scripts top D2C brands use.',
    category: 'Marketing',
    author: 'Anjali Gupta',
    date: 'Sep 28, 2024',
    image: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&q=80'
  },
  {
    id: 4,
    slug: 'festive-season-sales-tips',
    title: 'Preparing Your Inventory for the Festive Season Rush',
    excerpt: 'Diwali is coming. Is your supply chain ready? Here is a checklist to ensure you never run out of stock.',
    category: 'Operations',
    author: 'Vikram Malhotra',
    date: 'Sep 15, 2024',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80'
  },
  {
    id: 5,
    slug: 'upi-payments-whatsapp',
    title: 'Why UPI on WhatsApp is a Game Changer',
    excerpt: 'Seamless payments mean fewer drop-offs. Understand the new payment flows available in India.',
    category: 'Payments',
    author: 'Priya Sharma',
    date: 'Sep 10, 2024',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=800&q=80'
  },
  {
    id: 6,
    slug: 'scaling-d2c-brand',
    title: 'Scaling a D2C Brand from 0 to 1 Crore Revenue',
    excerpt: 'Case study: How "Organic Roots" used Hypnate to scale their operations with a team of just two.',
    category: 'Case Study',
    author: 'Rahul Verma',
    date: 'Aug 22, 2024',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
  }
];

const CATEGORIES = ['All', 'Commerce', 'AI Technology', 'Marketing', 'Operations', 'Payments', 'Case Study'];

export const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gray-50 pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Hypnate Blog</h1>
          <p className="text-xl text-gray-600 mb-8">Insights, strategies, and stories for the modern social merchant.</p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-gray-100 sticky top-[72px] bg-white/95 backdrop-blur-sm z-30">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto py-4 scrollbar-hide">
          <div className="flex items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeCategory === cat 
                    ? "bg-primary-600 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article key={post.id} className="flex flex-col group">
                  <Link to={`/blog/${post.slug}`} className="block overflow-hidden rounded-2xl mb-4">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full aspect-[16/10] object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wide">
                      {post.category}
                    </span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {post.date}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-gray-900">{post.author}</span>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                      Read <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No articles found matching your search.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {setSearchQuery(''); setActiveCategory('All');}}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get smarter about social commerce</h2>
          <p className="text-primary-200 mb-8">Join 15,000+ merchants receiving our weekly tips and trends.</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-6 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary-500"
            />
            <Button className="rounded-full px-8 bg-secondary-500 hover:bg-secondary-600 border-0">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};
