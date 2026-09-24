import React from "react";
import { ArrowRight, CheckCircle2, CreditCard, ExternalLink, HelpCircle } from "lucide-react";
import type { PaymentForm } from "../../types/onboarding";
import { GATEWAYS } from "../../data/gateways";
import "../../styles/payments-step.css";

type GatewayId = "razorpay" | "payu" | "cashfree" | "skydo" | "cod";

interface PaymentsStepProps {
  form: PaymentForm;
  onChange: React.Dispatch<React.SetStateAction<PaymentForm>>;
  error: string;
  onClear: () => void;
}

const logos: Record<GatewayId, React.ReactNode> = {
  razorpay: <svg viewBox="0 0 40 40" className="gateway-logo-svg" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#2563eb"/><path d="M12 26 24 10h7L19 30h-7l5-8h-5Z" fill="#fff"/></svg>,
  payu: <svg viewBox="0 0 40 40" className="gateway-logo-svg" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#f97316"/><path d="M11 12h10c5 0 8 3 8 7s-3 7-8 7h-4v4h-6V12Zm6 5v5h3c2 0 3-1 3-2.5S22 17 20 17h-3Z" fill="#fff"/></svg>,
  cashfree: <svg viewBox="0 0 40 40" className="gateway-logo-svg" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#16a34a"/><path d="M28 12c-2-1-4-2-7-2-6 0-10 4-10 10s4 10 10 10c3 0 5-1 7-2l-2-4c-1 1-3 1-5 1-3 0-5-2-5-5s2-5 5-5c2 0 4 0 5 1l2-4Z" fill="#fff"/></svg>,
  skydo: <svg viewBox="0 0 40 40" className="gateway-logo-svg" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#7c3aed"/><path d="M28 12c-2-1-4-2-7-2-5 0-8 2-8 6 0 3 2 5 7 6 2 .5 3 1 3 2 0 1-1 2-3 2-2 0-4-1-6-2l-2 4c2 2 5 2 8 2 5 0 9-2 9-7 0-3-2-5-7-6-2-.5-3-1-3-2 0-1 1-2 3-2 2 0 4 1 5 2l2-3Z" fill="#fff"/></svg>,
  cod: <svg viewBox="0 0 40 40" className="gateway-logo-svg" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#475569"/><path d="M12 12h16v4H12zm0 6h16v4H12zm0 6h10v4H12z" fill="#fff"/></svg>,
};

export const PaymentsStep: React.FC<PaymentsStepProps> = ({ form, onChange, error, onClear }) => {
  const selected = form.gateway as GatewayId | null;
  const selectedConfig = selected ? GATEWAYS.find((gateway) => gateway.id === selected) : null;

  const choose = (gateway: GatewayId) => {
    onChange((current) => ({ ...current, gateway }));
    onClear();
  };

  const update = (key: keyof PaymentForm, value: string) => {
    onChange((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="onboarding-step-panel">
      <div className="onboarding-step-heading">
        <div className="onboarding-step-icon onboarding-step-icon-payment">
          <CreditCard size={24} />
        </div>
        <div>
          <h2>Setup Payments</h2>
          <p>Choose how you want to accept payments from customers.</p>
        </div>
      </div>

      {error && <div className="onboarding-inline-error" role="alert">{error}</div>}

      <div className="payment-gateway-grid">
        {GATEWAYS.map((gateway) => {
          const id = gateway.id as GatewayId;
          const active = selected === id;

          return (
            <button
              type="button"
              key={id}
              className={`payment-gateway-card${active ? " is-selected" : ""}`}
              onClick={() => choose(id)}
              aria-pressed={active}
            >
              <span className="payment-gateway-logo">{logos[id]}</span>
              <span className="payment-gateway-copy">
                <strong>{gateway.name}</strong>
                <small>{gateway.tagline}</small>
                <em>{gateway.fees}</em>
              </span>
              <span className="payment-gateway-action">
                {active ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
              </span>
            </button>
          );
        })}
      </div>

      {selected && selected !== "cod" && (
        <>
          <div className="payment-credentials">
            <div className="payment-credentials-title">
              <strong>Test credentials</strong>
              <span>Use sandbox/test credentials while testing. Do not use live secrets.</span>
            </div>

            {selected === "razorpay" && (
              <>
                <label>Key ID<input value={form.keyId} onChange={(e) => update("keyId", e.target.value)} placeholder="rzp_test_..." autoComplete="off" /></label>
                <label>Key Secret<input type="password" value={form.keySecret} onChange={(e) => update("keySecret", e.target.value)} placeholder="Test key secret" autoComplete="new-password" /></label>
              </>
            )}

            {selected === "payu" && (
              <>
                <label>Merchant Key<input value={form.merchantId} onChange={(e) => update("merchantId", e.target.value)} placeholder="PayU test merchant key" autoComplete="off" /></label>
                <label>Salt<input type="password" value={form.salt} onChange={(e) => update("salt", e.target.value)} placeholder="PayU test salt" autoComplete="new-password" /></label>
              </>
            )}

            {(selected === "cashfree" || selected === "skydo") && (
              <>
                <label>Client / Key ID<input value={form.keyId} onChange={(e) => update("keyId", e.target.value)} placeholder="Sandbox key ID" autoComplete="off" /></label>
                <label>Client Secret<input type="password" value={form.keySecret} onChange={(e) => update("keySecret", e.target.value)} placeholder="Sandbox secret" autoComplete="new-password" /></label>
              </>
            )}
          </div>

          {selectedConfig && selectedConfig.setupSteps.length > 0 && (
            <div className="payment-key-guide">
              <div className="payment-key-guide-header">
                <div className="payment-key-guide-icon"><HelpCircle size={18} /></div>
                <div>
                  <strong>How to get your {selectedConfig.name} keys</strong>
                  <span>Follow these steps to find the credentials you need.</span>
                </div>
                {selectedConfig.setupUrl && (
                  <a href={selectedConfig.setupUrl} target="_blank" rel="noreferrer" className="payment-key-guide-link">
                    Open dashboard <ExternalLink size={13} />
                  </a>
                )}
              </div>

              <ol className="payment-key-guide-steps">
                {selectedConfig.setupSteps.map((step, index) => (
                  <li key={step}>
                    <span className="payment-key-guide-number">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <div className="payment-key-guide-note">
                <strong>Testing?</strong> Use the provider's test/sandbox credentials first. Keep live secrets out of development and never share your secret keys publicly.
              </div>
            </div>
          )}
        </>
      )}

      {selected === "cod" && (
        <div className="payment-cod-note">
          Cash on Delivery requires no credentials. Hypnate will record COD orders as payment-pending until delivery.
        </div>
      )}
    </section>
  );
};
