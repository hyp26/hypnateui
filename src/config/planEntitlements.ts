export type PlanId = "starter" | "pro" | "business";

export type PlanFeature =
  | "commerceWorkspace"
  | "catalogAi"
  | "advancedAnalytics"
  | "paymentLinks"
  | "hypnateX";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  priceMonthly: number;
  tagline: string;
  summary: string;
}

export const PLAN_DEFINITIONS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 999,
    tagline: "Core commerce workspace",
    summary: "Core tools for products, orders, customers, conversations and channel workflows.",
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 1999,
    tagline: "Deeper commerce operations",
    summary: "Everything in Starter plus advanced analytics and payment-link generation.",
  },
  business: {
    id: "business",
    name: "Business",
    priceMonthly: 4999,
    tagline: "Expanded commerce workspace",
    summary: "Everything in Pro plus the Hypnate X website builder.",
  },
};

const PLAN_RANK: Record<PlanId, number> = {
  starter: 1,
  pro: 2,
  business: 3,
};

const FEATURE_MINIMUM_PLAN: Record<PlanFeature, PlanId> = {
  commerceWorkspace: "starter",
  catalogAi: "starter",
  advancedAnalytics: "pro",
  paymentLinks: "pro",
  hypnateX: "business",
};

export function normalizePlan(value: unknown): PlanId | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized === "starter" || normalized === "pro" || normalized === "business"
    ? normalized
    : null;
}

export function hasPlanFeature(plan: unknown, feature: PlanFeature): boolean {
  const planId = normalizePlan(plan);
  if (!planId) return false;
  return PLAN_RANK[planId] >= PLAN_RANK[FEATURE_MINIMUM_PLAN[feature]];
}

export function requiredPlanForFeature(feature: PlanFeature): PlanId {
  return FEATURE_MINIMUM_PLAN[feature];
}

export function getPlanDefinition(plan: unknown): PlanDefinition | null {
  const planId = normalizePlan(plan);
  return planId ? PLAN_DEFINITIONS[planId] : null;
}

export const PLAN_OPTIONS = Object.values(PLAN_DEFINITIONS);

export const PLAN_FEATURE_MATRIX: Record<PlanId, Record<PlanFeature, boolean>> = {
  starter: {
    commerceWorkspace: true,
    catalogAi: true,
    advancedAnalytics: false,
    paymentLinks: false,
    hypnateX: false,
  },
  pro: {
    commerceWorkspace: true,
    catalogAi: true,
    advancedAnalytics: true,
    paymentLinks: true,
    hypnateX: false,
  },
  business: {
    commerceWorkspace: true,
    catalogAi: true,
    advancedAnalytics: true,
    paymentLinks: true,
    hypnateX: true,
  },
};
