import React from "react";
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

export const PlanGate: React.FC<PlanGateProps> = ({ feature, children, compact = false }) => {
  const plan = useAuthStore((state) => state.user?.seller?.activePlan);

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
