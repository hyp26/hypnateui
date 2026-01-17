import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const BlogArticle = () => {
  const { slug } = useParams();

  // In a real app, fetch data based on slug
  const post = {
    title: 'The Ultimate Guide to WhatsApp Commerce in 2025',
    author: 'Priya Sharma',
    date: 'Oct 12, 2024',
    category: 'Commerce',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80',
    content: `
      <p class="lead">The way we shop is changing. It's no longer about browsing static catalogs on websites; it's about having conversations.</p>
      
      <p>In India, WhatsApp isn't just a messaging app—it's the internet. With over 500 million users, it's where your customers live, chat, and now, shop. WhatsApp Commerce is the practice of selling products and services directly through WhatsApp conversations.</p>

      <h2>Why Shift to Conversational Commerce?</h2>
      <p>Traditional e-commerce has a friction problem. To buy something, a user has to:</p>
      <ul>
        <li>Click an ad on Instagram</li>
        <li>Wait for a website to load</li>
        <li>Navigate a complex menu</li>
        <li>Create an account</li>
        <li>Enter OTPs</li>
      </ul>
      <p>With WhatsApp Commerce, this entire journey happens in a single chat window. The result? <strong>3x higher conversion rates</strong> and significantly lower customer acquisition costs.</p>

      <h2>Key Features of WhatsApp Business API</h2>
      <p>To truly scale, you need the WhatsApp Business API (which Hypnate provides). This unlocks:</p>
      <ol>
        <li><strong>Interactive Buttons:</strong> Let users choose options with a tap instead of typing.</li>
        <li><strong>List Messages:</strong> Display up to 10 product options cleanly.</li>
        <li><strong>Automated Catalogs:</strong> Sync your inventory so users can browse without leaving the app.</li>
      </ol>

      <blockquote>
        "The future of commerce is personal. It's not B2B or B2C, it's H2H (Human to Human)."
      </blockquote>

      <h2>How to Get Started</h2>
      <p>Getting started is easier than you think. First, you need a verified Facebook Business Manager account. Once you have that, you can apply for the WhatsApp Business API through a partner like Hypnate.</p>
      
      <p>Once approved, you can start importing your contacts (following opt-in rules) and setting up your first automated flows. We recommend starting with a simple "Welcome" flow and an "Abandoned Cart" recovery flow.</p>

      <h2>Conclusion</h2>
      <p>2025 is the year of chat. Don't let your business get left behind on the static web. Start conversing, start converting.</p>
    `
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Image */}
      <div className="h-[400px] w-full relative">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-bold uppercase tracking-wide">
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">{post.title}</h1>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {post.author.charAt(0)}
              </div>
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{post.date}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <div 
            className="prose prose-lg prose-primary max-w-none 
              prose-headings:font-bold prose-headings:text-gray-900 
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic
              prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Share this article</h3>
            <div className="flex gap-4">
              <button className="p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"><Facebook className="w-5 h-5" /></button>
              <button className="p-3 rounded-full bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors"><Twitter className="w-5 h-5" /></button>
              <button className="p-3 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"><Linkedin className="w-5 h-5" /></button>
              <button className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"><Share2 className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* CTA Card */}
          <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start selling on WhatsApp today</h3>
            <p className="text-gray-600 mb-6 text-sm">Join 10,000+ merchants growing their business with Hypnate.</p>
            <Link to="/signup">
              <Button className="w-full">Get Started for Free</Button>
            </Link>
          </div>

          {/* Recent Posts */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Link key={i} to="/blog" className="flex gap-4 group">
                  <div className="w-20 h-20 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                    <img 
                      src={`https://images.unsplash.com/photo-${1600000000000 + i}?w=200&q=80`} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
                      How to optimize your product catalog for mobile users
                    </h4>
                    <span className="text-xs text-gray-500 mt-2 block">Oct {10 - i}, 2024</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {['WhatsApp', 'Instagram', 'Marketing', 'Sales', 'Automation', 'AI', 'Growth'].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 cursor-pointer transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
