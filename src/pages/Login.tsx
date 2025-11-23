import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/ui/Logo';
import { ShoppingBag, MessageCircle, TrendingUp } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isSignup = location.pathname === '/signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulate login/signup delay
      await login(email);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Panel - Branding & Info (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500 opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        {/* Logo */}
        <div className="relative z-10">
           <Logo variant="full" size="md" theme="light" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-lg mt-12">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Sell Smarter with <br/>
            <span className="text-secondary-300">Social Commerce</span>
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed">
            Turn conversations into sales. Manage your store, share products, and track orders seamlessly across WhatsApp, Instagram, and Facebook.
          </p>
        </div>

        {/* Feature Cards (Bottom) */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-12">
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-3 text-secondary-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm leading-tight">Easy Product Management</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-3 text-secondary-300">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm leading-tight">Unified Chat Integration</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-3 text-secondary-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm leading-tight">Real-time Analytics</h3>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {isSignup ? t('auth.signup_title') : 'Welcome Back'}
            </h2>
            <p className="text-gray-500 mt-2">
              {isSignup 
                ? 'Start your 14-day free trial today.' 
                : 'Sign in to manage your store and orders.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                placeholder="merchant@example.com"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">{t('auth.password')}</label>
                {!isSignup && (
                  <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Forgot password?
                  </a>
                )}
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary-500/20" 
              isLoading={isLoading}
            >
              {isSignup ? t('auth.signup_btn') : t('auth.login_btn')}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
            {isSignup ? (
              <>
                {t('auth.has_account')}{' '}
                <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700 hover:underline">
                  {t('auth.login_btn')}
                </Link>
              </>
            ) : (
              <>
                {t('auth.no_account')}{' '}
                <Link to="/signup" className="text-primary-600 font-bold hover:text-primary-700 hover:underline">
                  {t('auth.signup_btn')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
