import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { validateEmail } from "../utils/Validation";

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const validation = validateEmail(email);
    if (!validation.valid) {
      setEmailError(validation.message || "Enter a valid email address");
      return;
    }

    setEmailError(null);
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "We could not process your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 relative px-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100"
        aria-label="Go back to the previous page"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" aria-hidden="true" />
      </button>

      <section className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100" aria-labelledby="forgot-password-title">
        {!submitted ? (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4" aria-hidden="true">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <h1 id="forgot-password-title" className="text-2xl font-bold text-gray-900">
                Forgot your password?
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                Enter your email and we’ll send you a reset link if an account exists.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="forgot-password-email" className="block text-sm font-medium mb-1.5">
                  Email address
                </label>
                <input
                  id="forgot-password-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300"
                  placeholder="you@example.com"
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? "forgot-password-email-error" : undefined}
                  autoFocus
                />
                {emailError && (
                  <p id="forgot-password-email-error" className="mt-1.5 text-sm text-red-700" role="alert">
                    {emailError}
                  </p>
                )}
              </div>

              {error && (
                <div role="alert" aria-live="assertive" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="auth-primary-button"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <><span className="auth-spinner" aria-hidden="true" /> Sending…</>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center" aria-live="polite">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4" aria-hidden="true">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Check your inbox</h1>
            <p className="text-gray-500 mt-2 text-sm">
              If an account exists for <strong>{email}</strong>, you’ll receive a password reset link shortly.
            </p>

            <button
              type="button"
              className="auth-secondary-button"
              onClick={() => navigate("/login", { replace: true })}
            >
              Back to login
            </button>

            <p className="mt-4 text-sm text-gray-500">
              <Link to="/signup" className="auth-link">Need an account?</Link>
            </p>
          </div>
        )}
      </section>
    </main>
  );
};
