import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { AuthLayout } from "../components/auth/AuthLayout";
import {
  validateEmail,
  validateLoginPassword,
} from "../utils/Validation";

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
  const navigate = useNavigate();

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
      const user = await login(email.trim(), password);
      let destination = "/dashboard";
      if (user.role === "SELLER") {
        if (!user.seller?.onboardedAt) destination = "/onboarding";
        else if (!user.seller?.activePlan) destination = "/plan-required";
      }
      navigate(destination, { replace: true });
    } catch (err: any) {
      if (err?.code === "EMAIL_NOT_VERIFIED") {
        navigate("/verify-email", { state: { email: email.trim() }, replace: true });
        return;
      }

      setFormError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        <div className="auth-error" role="alert" aria-live="assertive">
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
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            autoFocus
          />
          {fieldErrors.email && (
            <span id="login-email-error" className="auth-field-error" role="alert">{fieldErrors.email}</span>
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
              aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
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
            <span id="login-password-error" className="auth-field-error" role="alert">{fieldErrors.password}</span>
          )}
        </div>

        <button
          type="submit"
          className="auth-primary-button"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <><span className="auth-spinner" aria-hidden="true" /> Signing in…</>
          ) : (
            "Log in"
          )}
        </button>
      </form>

    </AuthLayout>
  );
};
