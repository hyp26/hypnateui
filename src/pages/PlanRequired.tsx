import React, { useEffect } from "react";
import { ArrowRight, Check, CreditCard, LockKeyhole, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { PLAN_OPTIONS, getPlanDefinition, normalizePlan, type PlanId } from "../config/planEntitlements";

const PLAN_HIGHLIGHTS: Record<PlanId, string[]> = {
  starter: ["Products & inventory", "Orders & customers", "WhatsApp + Telegram"],
  pro: ["Everything in Starter", "Instagram + Facebook", "Advanced analytics", "Payment links"],
  business: ["Everything in Pro", "Hypnate X website builder", "Expanded commerce workspace"],
};

export const PlanRequired: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const activePlan = normalizePlan(user?.seller?.activePlan);
  const selectedPlan = normalizePlan(user?.seller?.selectedPlan);

  useEffect(() => {
    if (user?.role === "SELLER" && user.seller?.onboardedAt && activePlan) {
      navigate("/dashboard", { replace: true });
    }
  }, [activePlan, navigate, user?.role, user?.seller?.onboardedAt]);

  const selectedDefinition = selectedPlan ? getPlanDefinition(selectedPlan) : null;

  return (
    <main className="plan-lock-page">
      <div className="plan-lock-topbar">
        <Link to="/" className="plan-lock-brand" aria-label="Hypnate home">
          <img src="/assets/hypnate-auth-logo-white.png" alt="Hypnate" />
        </Link>
        <span className="plan-lock-account">Signed in as {user?.email}</span>
      </div>

      <section className="plan-lock-stage">
        <div className="plan-lock-preview" aria-hidden="true">
          <div className="plan-preview-sidebar" />
          <div className="plan-preview-main">
            <div className="plan-preview-header" />
            <div className="plan-preview-metrics">
              <span /><span /><span /><span />
            </div>
            <div className="plan-preview-grid">
              <span /><span /><span />
            </div>
          </div>
        </div>

        <div className="plan-lock-scrim" aria-hidden="true" />

        <div className="plan-lock-dialog" role="dialog" aria-modal="false" aria-labelledby="plan-lock-title">
          <div className="plan-lock-icon">
            <LockKeyhole size={23} aria-hidden="true" />
          </div>
          <span className="plan-lock-eyebrow">Workspace ready</span>
          <h1 id="plan-lock-title">Choose a plan to unlock Hypnate</h1>
          <p>
            Your account and store setup are ready. Hypnate keeps the workspace locked until a paid plan is active on your merchant account.
          </p>

          {selectedDefinition && (
            <div className="plan-lock-note">
              <Sparkles size={15} aria-hidden="true" />
              You previously selected <strong>{selectedDefinition.name}</strong>. That selection is only a preference until checkout is completed.
            </div>
          )}

          <div className="plan-lock-plans">
            {PLAN_OPTIONS.map((plan) => (
              <article key={plan.id} className={`plan-lock-card ${plan.id === selectedPlan ? "selected" : ""}`}>
                <div className="plan-lock-card-top">
                  <div>
                    <h2>{plan.name}</h2>
                    <p>{plan.tagline}</p>
                  </div>
                  <strong>₹{plan.priceMonthly.toLocaleString("en-IN")}</strong>
                </div>
                <div className="plan-lock-feature-list">
                  {PLAN_HIGHLIGHTS[plan.id].map((feature) => (
                    <span key={feature}><Check size={14} />{feature}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <Link to="/pricing" className="plan-lock-primary">
            <CreditCard size={17} aria-hidden="true" />
            View plans & subscribe
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <p className="plan-lock-footnote">
            Plan selection and payment activation are separate from account creation and onboarding.
          </p>
        </div>
      </section>
    </main>
  );
};
