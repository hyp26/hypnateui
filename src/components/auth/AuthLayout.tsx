import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../../styles/Auth.css";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  topLink?: React.ReactNode;
  footer?: React.ReactNode;
  helpText?: React.ReactNode;
  density?: "default" | "compact";
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  topLink,
  footer,
  helpText,
  density = "default",
}) => {
  const navigate = useNavigate();

  return (
    <main className="auth-page auth-shopify-style">
      <header className="auth-topbar">
        <Link to="/" className="auth-logo-link" aria-label="Hypnate home">
          <img
            src="/assets/hypnate-auth-logo-white.png"
            alt="Hypnate"
            className="auth-logo"
          />
        </Link>

        <button
          type="button"
          className="auth-back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back to the previous page"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
      </header>

      {topLink && <div className="auth-top-link">{topLink}</div>}

      <section className={`auth-center auth-center-${density}`}>
        <div className={`auth-card auth-card-${density}`}>
          <div className="auth-card-heading">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="auth-card-body">
            {children}
          </div>

          {footer && <div className="auth-card-footer">{footer}</div>}
        </div>

        {helpText && <div className="auth-help">{helpText}</div>}
      </section>
    </main>
  );
};
