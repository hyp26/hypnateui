import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, KeyRound } from "lucide-react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { useAuthStore } from "../stores/useAuthStore";
import { validatePassword } from "../utils/Validation";

export const ResetPassword: React.FC = () => {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const resetPassword = useAuthStore((state) => state.resetPassword);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const nextErrors: { password?: string; confirmPassword?: string } = {};
    const passwordCheck = validatePassword(password);

    if (!passwordCheck.valid) nextErrors.password = passwordCheck.message;
    if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!token) {
      setFormError("This password reset link is missing its token.");
      return;
    }

    if (!validate()) return;

    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setFormError(err?.message || "This reset link is invalid or has expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Password updated" subtitle="Your Hypnate password has been changed successfully.">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <CheckCircle2 className="w-12 h-12 text-primary-600" aria-hidden="true" />
          <p className="text-sm text-gray-600">You can now sign in with your new password.</p>
          <button
            type="button"
            className="auth-primary-button"
            onClick={() => navigate("/login", { replace: true })}
          >
            Back to login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Choose a new password for your Hypnate account.">
      {formError && (
        <div className="auth-error" role="alert" aria-live="assertive">{formError}</div>
      )}

      <div className="flex items-center gap-3 mb-5 text-sm text-gray-600">
        <KeyRound className="w-5 h-5 text-primary-600" aria-hidden="true" />
        Use at least 8 characters with an uppercase letter, number, and special character.
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="auth-field">
          <label htmlFor="reset-password">New password</label>
          <div className="auth-password-wrap">
            <input
              id="reset-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "reset-password-error" : undefined}
              autoFocus
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <span id="reset-password-error" className="auth-field-error" role="alert">{errors.password}</span>}
        </div>

        <div className="auth-field">
          <label htmlFor="reset-confirm-password">Confirm new password</label>
          <input
            id="reset-confirm-password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "reset-confirm-password-error" : undefined}
          />
          {errors.confirmPassword && <span id="reset-confirm-password-error" className="auth-field-error" role="alert">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="auth-primary-button" disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? <><span className="auth-spinner" aria-hidden="true" /> Updating password…</> : "Update password"}
        </button>
      </form>

      <div className="auth-card-footer">
        <Link to="/login" className="auth-link">Back to login</Link>
      </div>
    </AuthLayout>
  );
};
