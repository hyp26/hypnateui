import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  MessageCircle,
  TrendingUp,
  Eye,
  EyeOff,
} from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isSignup = location.pathname === '/signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        await signup(name, email, password, businessName, phone);
        navigate('/dashboard');
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (error) {
      alert('Invalid credentials or something went wrong.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500 opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <img
            src="/assets/logo.svg"
            alt="Hypnate Logo"
            className="h-14 w-auto"
          />
        </div>

        <div className="relative z-10 max-w-lg mt-12">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Sell Smarter with <br />
            <span className="text-secondary-300">
              Social Commerce
            </span>
          </h1>
          <p className="text-primary-100 text-lg">
            Turn conversations into sales. Manage products and
            orders seamlessly.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 mt-12">
          <Feature
            icon={<ShoppingBag className="w-5 h-5" />}
            text="Easy Product Management"
          />
          <Feature
            icon={<MessageCircle className="w-5 h-5" />}
            text="Unified Chat Integration"
          />
          <Feature
            icon={<TrendingUp className="w-5 h-5" />}
            text="Real-time Analytics"
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full border">

          <div className="mb-8">
            <h2 className="text-3xl font-bold">
              {isSignup ? t('auth.signup_title') : 'Welcome Back'}
            </h2>
            <p className="text-gray-500 mt-2">
              {isSignup
                ? 'Start your free trial today.'
                : 'Sign in to manage your store.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {isSignup && (
              <>
                <Input label="Full Name" value={name} onChange={setName} />
                <Input label="Business Name" value={businessName} onChange={setBusinessName} />
                <Input label="Phone" value={phone} onChange={setPhone} />
              </>
            )}

            <Input
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={setEmail}
            />

            {/* PASSWORD WITH EYE ICON */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* RESET PASSWORD */}
            {!isSignup && (
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              isLoading={isLoading}
            >
              {isSignup ? t('auth.signup_btn') : t('auth.login_btn')}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t text-center text-sm">
            {isSignup ? (
              <>
                {t('auth.has_account')}{' '}
                <Link to="/login" className="text-primary-600 font-bold">
                  {t('auth.login_btn')}
                </Link>
              </>
            ) : (
              <>
                {t('auth.no_account')}{' '}
                <Link to="/signup" className="text-primary-600 font-bold">
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

/* --------------------------------------------------
 * SMALL HELPERS
 * -------------------------------------------------- */
const Feature = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="bg-white/10 p-5 rounded-xl border border-white/10">
    <div className="w-10 h-10 mb-3 flex items-center justify-center text-secondary-300">
      {icon}
    </div>
    <h3 className="font-semibold text-sm">{text}</h3>
  </div>
);

const Input = ({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium mb-1.5">
      {label}
    </label>
    <input
      type={type}
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-lg border border-gray-300"
    />
  </div>
);
