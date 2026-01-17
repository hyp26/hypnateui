import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Mail } from "lucide-react";

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      /**
       * 🔌 BACKEND HOOK (later)
       * await authApi.forgotPassword(email);
       */
      await new Promise((r) => setTimeout(r, 800)); // mock delay
      setSubmitted(true);
    } catch (err) {
      alert("Failed to send reset link.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        {!submitted ? (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Forgot your password?
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                Enter your email and we’ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300"
                  placeholder="you@example.com"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                isLoading={isSubmitting}
              >
                Send reset link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Check your inbox
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              If an account exists for <strong>{email}</strong>, you’ll receive
              a password reset link shortly.
            </p>

            <Button
              className="w-full mt-6"
              variant="outline"
              onClick={() => navigate("/login")}
            >
              Back to login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
