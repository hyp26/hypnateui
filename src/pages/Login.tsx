import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/Formfield";
import { PasswordField } from "../components/auth/Passwordfield";
import { GoogleButton } from "../components/auth/Googlebutton";
import { validateEmail, validateLoginPassword } from "../utils/Validation";

const API = process.env.REACT_APP_API_URL;

interface FieldErrors {
  email?: string;
  password?: string;
}

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!API) {
      setFormError("API not configured");
      return;
    }
    // Fixed: was missing the `/api` prefix used by every other auth route.
    window.location.href = `${API}/api/auth/google`;
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your store."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/signup" style={{ color: "#0d9488", fontWeight: 700, textDecoration: "none" }} className="auth-link">
            Create one free
          </Link>
        </>
      }
    >
      <GoogleButton onClick={handleGoogleLogin} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
        <span style={{ fontSize: 11, color: "#cbd5e1", fontWeight: 600 }}>OR</span>
        <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
      </div>

      {formError && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 10,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            fontSize: 13,
            color: "#dc2626",
          }}
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }} noValidate>
        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={fieldErrors.email}
        />

        <PasswordField
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          autoComplete="current-password"
        />

        <div style={{ textAlign: "right", marginTop: -6 }}>
          <Link
            to="/forgot-password"
            style={{ fontSize: 13, color: "#0d9488", textDecoration: "none", fontWeight: 600 }}
            className="auth-link"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="auth-submit"
          style={{
            width: "100%",
            height: 48,
            marginTop: 4,
            background: isLoading ? "#94a3b8" : "#0d9488",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 800,
            cursor: isLoading ? "not-allowed" : "pointer",
            fontFamily: "'Outfit',sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            letterSpacing: "-0.2px",
          }}
        >
          {isLoading ? <span className="auth-spinner" /> : "Sign In →"}
        </button>
      </form>
    </AuthLayout>
  );
};