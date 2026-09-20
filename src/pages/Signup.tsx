import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { AuthLayout } from "../components/auth/AuthLayout";
import { PUBLIC_CHANNEL_SUMMARY } from "../data/publicChannels";
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
  confirmPassword?: string;
}

export const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();

  const requestedPlan = searchParams.get("plan")?.toLowerCase() || "";
  const selectedPlan = (["starter", "pro", "business"] as const).includes(
    requestedPlan as "starter" | "pro" | "business"
  )
    ? requestedPlan
    : null;

  const selectedPlanLabel = selectedPlan
    ? selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)
    : null;
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
      confirmPassword: password === confirmPassword
        ? { valid: true }
        : { valid: false, message: "Passwords do not match" },
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
      await signup(name, email, password, businessName, phone, selectedPlan);
      navigate("/verify-email", { state: { email, plan: selectedPlan } });
    } catch (err: any) {
      setFormError(err?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle={`Create your Hypnate account for ${PUBLIC_CHANNEL_SUMMARY} commerce.`}
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
      {selectedPlanLabel && (
        <div className="auth-plan-summary" role="status" aria-live="polite">
          Selected plan: <strong>{selectedPlanLabel}</strong>
          <Link to="/pricing">Change</Link>
        </div>
      )}

      {formError && (
        <div className="auth-error" role="alert" aria-live="assertive">
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
            aria-describedby={fieldErrors.name ? "signup-name-error" : undefined}
          />
          {fieldErrors.name && (
            <span id="signup-name-error" className="auth-field-error" role="alert">{fieldErrors.name}</span>
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
            aria-describedby={fieldErrors.businessName ? "signup-business-error" : undefined}
          />
          {fieldErrors.businessName && (
            <span id="signup-business-error" className="auth-field-error" role="alert">{fieldErrors.businessName}</span>
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
            aria-describedby={fieldErrors.phone ? "signup-phone-error" : undefined}
          />
          {fieldErrors.phone && (
            <span id="signup-phone-error" className="auth-field-error" role="alert">{fieldErrors.phone}</span>
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
            aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
          />
          {fieldErrors.email && (
            <span id="signup-email-error" className="auth-field-error" role="alert">{fieldErrors.email}</span>
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
              aria-describedby={fieldErrors.password ? "signup-password-error" : "signup-password-hint"}
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
            <span id="signup-password-hint" className="auth-field-hint">
              Min 8 chars with uppercase, number &amp; special character
            </span>
          )}

          {fieldErrors.password && (
            <span id="signup-password-error" className="auth-field-error" role="alert">{fieldErrors.password}</span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-confirm-password">Confirm password</label>
          <div className="auth-password-wrap">
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={fieldErrors.confirmPassword ? "signup-confirm-password-error" : undefined}
            />
          </div>
          {fieldErrors.confirmPassword && (
            <span id="signup-confirm-password-error" className="auth-field-error" role="alert">{fieldErrors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          className="auth-primary-button"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <><span className="auth-spinner" aria-hidden="true" /> Creating account…</>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};
