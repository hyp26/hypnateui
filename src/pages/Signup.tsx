import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { AuthLayout } from "../components/auth/AuthLayout";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateBusinessName,
  validatePhone,
} from "../utils/Validation";

interface FieldErrors {
  name?: string;
  businessName?: string;
  phone?: string;
  email?: string;
  password?: string;
}

export const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signup = useAuthStore((s) => s.signup);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const checks: Record<
      keyof FieldErrors,
      { valid: boolean; message?: string }
    > = {
      name: validateName(name),
      businessName: validateBusinessName(businessName),
      phone: validatePhone(phone),
      email: validateEmail(email),
      password: validatePassword(password),
    };

    const errors: FieldErrors = {};

    (Object.keys(checks) as (keyof FieldErrors)[]).forEach((key) => {
      if (!checks[key].valid) {
        errors[key] = checks[key].message;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      await signup(name, email, password, businessName, phone);
      navigate("/verify-email", { state: { email } });
    } catch (err: any) {
      setFormError(err?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Get started with Hypnate"
      topLink={
        <>
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </>
      }
      footer={
        <>
          By creating an account, you agree to the{" "}
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
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            aria-invalid={Boolean(fieldErrors.name)}
          />
          {fieldErrors.name && (
            <span className="auth-field-error">{fieldErrors.name}</span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-business">Business name</label>
          <input
            id="signup-business"
            name="businessName"
            autoComplete="organization"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Your business name"
            aria-invalid={Boolean(fieldErrors.businessName)}
          />
          {fieldErrors.businessName && (
            <span className="auth-field-error">{fieldErrors.businessName}</span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-phone">Mobile number</label>
          <input
            id="signup-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+91 98XXX XXXXX"
            aria-invalid={Boolean(fieldErrors.phone)}
          />
          {fieldErrors.phone && (
            <span className="auth-field-error">{fieldErrors.phone}</span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email && (
            <span className="auth-field-error">{fieldErrors.email}</span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-password">Password</label>

          <div className="auth-password-wrap">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
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

          {!fieldErrors.password && (
            <span className="auth-field-hint">
              Min 8 chars with uppercase, number &amp; special character
            </span>
          )}

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
            "Create account"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};
