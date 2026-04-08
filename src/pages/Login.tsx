import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { Button } from "../components/ui/Button";
import { useTranslation } from "react-i18next";
import {
  ShoppingBag,
  MessageCircle,
  TrendingUp,
  Eye,
  EyeOff,
  ArrowLeft,
  Chrome,
} from "lucide-react";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // ✅ proper error state

  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isSignup = location.pathname === "/signup";
  const API = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignup) {
        await signup(name, email, password, businessName, phone);
        navigate("/onboarding");
      } else {
        await login(email, password);
        navigate("/dashboard");
      }
    } catch (err: any) {
      // ✅ Show actual error message from backend instead of generic alert
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------------------------
   * SOCIAL LOGIN (OAUTH REDIRECT)
   * -------------------------------------------------- */
  const handleGoogleLogin = () => {
    if (!API) {
      setError("API not configured");
      return;
    }
    window.location.href = `${API}/auth/google`;
  };

  return (
    <div className="min-h-screen flex w-full bg-white relative">

      {/* BACK ARROW */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-10 p-2 rounded-full hover:bg-gray-100"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      {/* LEFT BRAND PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div>
          <img src="/assets/logo.svg" alt="Hypnate Logo" className="h-14" />
        </div>

        <div className="max-w-lg mt-12">
          <h1 className="text-4xl font-bold mb-6">
            Sell Smarter with <br />
            <span className="text-secondary-300">Social Commerce</span>
          </h1>
          <p className="text-primary-100 text-lg">
            Turn conversations into sales. Manage your store and track orders
            seamlessly across platforms.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-12">
          <Feature icon={<ShoppingBag />} text="Easy Product Management" />
          <Feature icon={<MessageCircle />} text="Unified Chat Integration" />
          <Feature icon={<TrendingUp />} text="Real-time Analytics" />
        </div>
      </div>

      {/* RIGHT AUTH PANEL */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full border">

          <div className="mb-6">
            <h2 className="text-3xl font-bold">
              {isSignup ? t("auth.signup_title") : "Welcome Back"}
            </h2>
            <p className="text-gray-500 mt-2">
              {isSignup
                ? "Start your free trial today."
                : "Sign in to manage your store."}
            </p>
          </div>

          {/* SOCIAL LOGIN */}
          {!isSignup && (
            <div className="space-y-3 mb-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg h-12 hover:bg-gray-50 transition"
              >
                <Chrome className="w-5 h-5 text-gray-700" />
                <span className="font-medium">Continue with Google</span>
              </button>
              <Divider />
            </div>
          )}

          {/* ✅ ERROR BANNER — replaces alert() */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <>
                <Input label="Full Name" value={name} onChange={setName} />
                <Input label="Business Name" value={businessName} onChange={setBusinessName} />
                <Input label="Phone" value={phone} onChange={setPhone} />
              </>
            )}

            <Input
              label={t("auth.email")}
              type="email"
              value={email}
              onChange={setEmail}
            />

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* ✅ Password hint on signup */}
              {isSignup && (
                <p className="text-xs text-gray-400 mt-1.5">
                  Min 8 chars with uppercase, number & special character
                </p>
              )}
            </div>

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
              className="w-full h-12"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isSignup ? t("auth.signup_btn") : t("auth.login_btn")}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
            {isSignup ? (
              <>
                {t("auth.has_account")}{" "}
                <Link to="/login" className="text-primary-600 font-bold">
                  {t("auth.login_btn")}
                </Link>
              </>
            ) : (
              <>
                {t("auth.no_account")}{" "}
                <Link to="/signup" className="text-primary-600 font-bold">
                  {t("auth.signup_btn")}
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
 * HELPERS
 * -------------------------------------------------- */
const Feature = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium mb-1.5">{label}</label>
    <input
      type={type}
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
  </div>
);

const Divider = () => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 h-px bg-gray-200" />
    <span className="text-xs text-gray-400">OR</span>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);