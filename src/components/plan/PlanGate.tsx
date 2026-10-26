import React, { useEffect, useState } from "react";
import { Lock, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getPlanDefinition,
  hasPlanFeature,
  requiredPlanForFeature,
  normalizePlan,
  type PlanFeature,
} from "../../config/planEntitlements";
import { useAuthStore } from "../../stores/useAuthStore";

interface PlanGateProps {
  feature: PlanFeature;
  children: React.ReactNode;
  compact?: boolean;
}

interface PlanRouteProps {
  feature: PlanFeature;
  children: React.ReactNode;
}

/**
 * Effective entitlement from the backend's centralized
 * getPlanAccess() decision (billing-status endpoint). This includes
 * administrative free-access grants, so a seller whose plan access
 * is provided by a SUPER_ADMIN grant passes PlanGate even when
 * activePlan / trial fields carry no paid plan.
 *
 * The backend remains the authority: PlanGate is a UX convenience and
 * every server-side feature/channel check enforces the same decision.
 */
interface BillingStatusAccess {
  hasAccess: boolean;
  source: string | null;
  plan: string | null;
}

interface BillingStatus {
  access: BillingStatusAccess;
  effectivePlan?: string | null;
  accessSource?: string | null;
}

const API = process.env.REACT_APP_API_URL || "";

let billingStatusPromise: Promise<BillingStatus | null> | null = null;

const fetchBillingStatus = (): Promise<BillingStatus | null> => {
  if (!billingStatusPromise) {
    billingStatusPromise = fetch(`${API}/api/billing/status`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          return null;
        }
        const data = (await res.json()) as BillingStatus;
        return data;
      })
      .catch(() => null);
  }
  return billingStatusPromise;
};

export const PlanGate: React.FC<PlanGateProps> = ({ feature, children, compact = false }) => {
  const fallbackPlan = useAuthStore((state) => state.user?.seller?.activePlan);

  // undefined = still resolving the effective entitlement.
  const [effectivePlan, setEffectivePlan] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetchBillingStatus().then((status) => {
      if (cancelled) return;
      setEffectivePlan(status?.access?.plan ?? status?.effectivePlan ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // While the effective entitlement is loading, fall back to the
  // profile's activePlan so the UI does not flicker to the locked
  // state for sellers whose access comes from a grant.
  const plan = effectivePlan === undefined ? fallbackPlan : effectivePlan;

  if (hasPlanFeature(plan, feature)) {
    return <>{children}</>;
  }

  const normalizedPlan = normalizePlan(plan);

  const current = normalizedPlan
    ? getPlanDefinition(normalizedPlan)
    : null;

  const required = getPlanDefinition(requiredPlanForFeature(feature));

  const currentName = current?.name || "No plan";
  const requiredName = required?.name || "a paid plan";

  return (
    <div
      role="region"
      aria-label={`${requiredName} plan feature`}
      style={{
        border: "1px solid #e2e8f0",
        background: "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
        borderRadius: 16,
        padding: compact ? 16 : 24,
        textAlign: compact ? "left" : "center",
      }}
    >
      <div
        style={{
          width: compact ? 36 : 46,
          height: compact ? 36 : 46,
          margin: compact ? "0 0 12px" : "0 auto 14px",
          borderRadius: 12,
          background: "#f1f5f9",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Lock size={compact ? 16 : 20} aria-hidden="true" />
      </div>
      <h3 style={{ margin: "0 0 6px", color: "#0f172a", fontSize: compact ? 15 : 18, fontWeight: 800 }}>
        {requiredName} plan feature
      </h3>
      <p style={{ margin: "0 0 14px", color: "#64748b", fontSize: 13, lineHeight: 1.55 }}>
        Your active plan is {currentName}. This feature is included with {requiredName} and above.
      </p>
      <Link
        to="/pricing"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "9px 14px",
          borderRadius: 10,
          background: "#0d9488",
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        View plans <ArrowUpRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
};

export const PlanRoute: React.FC<PlanRouteProps> = ({ feature, children }) => (
  <PlanGate feature={feature}>{children}</PlanGate>
);
