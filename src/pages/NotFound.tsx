import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => (
  <main className="min-h-screen bg-white flex items-center justify-center px-6 py-20">
    <div className="max-w-xl text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600 mb-3">404</p>
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Page not found</h1>
      <p className="text-lg text-gray-600 mb-8">The page you requested does not exist or has moved.</p>
      <div className="flex justify-center gap-3 flex-wrap">
        <Link to="/" className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700">Go home</Link>
        <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">Contact us</Link>
      </div>
    </div>
  </main>
);
