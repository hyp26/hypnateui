import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { billingApi } from "../lib/billingApi";
import {
  PLAN_OPTIONS,
  type BillingCycle,
  type PlanId,
  normalizePlan,
} from "../config/planEntitlements";
import "../styles/billing.css";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const loadCheckout = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const PlanRequired: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [selected, setSelected] = useState<PlanId>(
    normalizePlan((user as any)?.seller?.selectedPlan) || "starter"
  );
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedPlan = useMemo(
    () => PLAN_OPTIONS.find((plan) => plan.id === selected)!,
    [selected]
  );

  const buy = async (plan: PlanId) => {
    setSelected(plan);
    setLoading(plan);
    setMessage(null);

    try {
      const checkoutLoaded = await loadCheckout();

      if (!checkoutLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout");
      }

      const data = await billingApi.createSubscription(plan, cycle);

      const razorpay = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "Hypnate",
        description: `${selectedPlan?.name || plan} — ${cycle} subscription`,
        prefill: data.customer,
        theme: {
          color: "#0d9488",
        },
        handler: async (response: any) => {
          try {
            await billingApi.verifyPayment(response);

            for (let i = 0; i < 10; i += 1) {
              const status = await billingApi.status();

              if (status.access?.source === "paid") {
                await useAuthStore.getState().loadProfile();
                navigate("/dashboard", { replace: true });
                return;
              }

              await new Promise((resolve) => setTimeout(resolve, 1500));
            }

            setMessage(
              "Payment verified. Your plan is still being activated. Please refresh shortly."
            );
          } catch (error: any) {
            setMessage(
              error?.response?.data?.message ||
                error?.message ||
                "Payment verification failed"
            );
          } finally {
            setLoading(null);
          }
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
      });

      razorpay.open();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start checkout"
      );
      setLoading(null);
    }
  };

  return (
    <main className="billing-page">
      <header className="billing-header">
        <img
          className="billing-logo"
          src="/assets/hypnate-wordmark-light.png"
          alt="Hypnate"
        />
        <span>{user?.email}</span>
      </header>

      <div className="billing-stage">
        <div className="billing-blur" />

        <div className="billing-dialog">
          <div className="billing-icon">
            <LockKeyhole size={22} />
          </div>

          <span className="billing-eyebrow">Workspace access</span>

          <h1>Choose a plan to continue</h1>

          <p>
            Your 7-day free trial has ended. No plan is currently active on your
            merchant account.
          </p>

          <div className="billing-trial">
            <ShieldCheck size={16} />
            <div>
              <strong>Trial ended • no card was required</strong>
              <span>
                Your trial never charged you. Choose a paid plan to restore
                workspace access.
              </span>
            </div>
          </div>

          <div className="billing-cycle">
            <button
              className={cycle === "monthly" ? "active" : ""}
              onClick={() => setCycle("monthly")}
            >
              Monthly
            </button>

            <button
              className={cycle === "yearly" ? "active" : ""}
              onClick={() => setCycle("yearly")}
            >
              Yearly <small>20% off</small>
            </button>
          </div>

          {message && <div className="billing-message">{message}</div>}

          <div className="billing-plans">
            {PLAN_OPTIONS.map((plan) => {
              const amount =
                cycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

              return (
                <article
                  key={plan.id}
                  className={selected === plan.id ? "selected" : ""}
                >
                  <button
                    className="billing-plan-head"
                    onClick={() => setSelected(plan.id)}
                  >
                    <div>
                      <h2>{plan.name}</h2>
                      <p>{plan.tagline}</p>
                    </div>

                    <strong>
                      ₹{amount.toLocaleString("en-IN")}
                      <small>/{cycle === "monthly" ? "mo" : "yr"}</small>
                    </strong>
                  </button>

                  <div className="billing-features">
                    {plan.features.map((feature) => (
                      <span key={feature}>
                        <Check size={13} />
                        {feature}
                      </span>
                    ))}
                  </div>

                  <button
                    className="billing-buy"
                    disabled={!!loading}
                    onClick={() => buy(plan.id)}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="spin" size={15} />
                    ) : (
                      <CreditCard size={15} />
                    )}

                    {loading === plan.id
                      ? "Opening checkout…"
                      : `Buy ${plan.name}`}

                    <ArrowRight size={14} />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};
