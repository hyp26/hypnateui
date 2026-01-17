import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/Button";

export const PublicHeader = () => {
  const location = useLocation();

  const isLogin = location.pathname === "/login";
  const isSignup = location.pathname === "/signup";

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/assets/logo.svg"
            alt="Hypnate"
            className="h-8 w-auto"
          />
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <Link to="/features" className="hover:text-primary-600">Features</Link>
          <Link to="/pricing" className="hover:text-primary-600">Pricing</Link>
          <Link to="/blog" className="hover:text-primary-600">Blog</Link>
          <Link to="/about" className="hover:text-primary-600">About</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {!isLogin && (
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600">
              Log In
            </Link>
          )}

          {!isSignup && (
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
