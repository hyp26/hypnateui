import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { AuthLayout } from "../components/auth/AuthLayout";
import {
  validateEmail,
  validateLoginPassword,
} from "../utils/Validation";

const API = process.env.REACT_APP_API_URL;

interface FieldErrors {
  email?: string;
  password?: string;
}

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((s) => s.login);

  const validate = (): boolean => {
    const emailCheck = validateEmail(email);
    const passwordCheck = validateLoginPassword(password);

    const errors: FieldErrors = {};

    if (!emailCheck.valid) errors.email = emailCheck.message;
    if (!passwordCheck.valid) errors.password = passwordCheck.message;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setFormError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!API) {
      setFormError("API not configured");
      return;
    }

    window.location.href = `${API}/api/auth/google`;
  };

  return (
    <AuthLayout
      title="Log in"
      subtitle="Continue to Hypnate"
      topLink={
        <>
          New to Hypnate?{" "}
          <Link to="/signup">Get started →</Link>
        </>
      }
      footer={
        <>
          <span>Need help?</span>{" "}
          <Link to="/contact">Contact us</Link>
        </>
      }
      helpText={
        <>
          By continuing, you agree to the{" "}
          <Link to="/terms">Terms of Service</Link> and{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </>
      }
    >
      {formError && (
        <div className="auth-error" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="auth-field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            autoFocus
          />
          {fieldErrors.email && (
            <span className="auth-field-error">{fieldErrors.email}</span>
          )}
        </div>

        <div className="auth-field">
          <div className="auth-field-label-row">
            <label htmlFor="login-password">Password</label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <div className="auth-password-wrap">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {fieldErrors.password && (
            <span className="auth-field-error">{fieldErrors.password}</span>
          )}
        </div>

        <button
          type="submit"
          className="auth-primary-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="auth-spinner" aria-hidden="true" />
          ) : (
            "Log in"
          )}
        </button>
      </form>

      <div className="auth-divider">
        <span />
        <em>or</em>
        <span />
      </div>

      <button
        type="button"
        className="auth-social-button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <span className="auth-google-mark" aria-hidden="true">
          G
        </span>
        Continue with Google
      </button>
    </AuthLayout>
  );
};
