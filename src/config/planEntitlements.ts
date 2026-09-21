export type PlanId = "starter" | "pro" | "business";
export type BillingCycle = "monthly" | "yearly";
export type PlanFeature = "commerceWorkspace" | "catalogAi" | "advancedAnalytics" | "paymentLinks" | "hypnateX";
export type PlanChannel = "whatsapp" | "instagram" | "facebook" | "telegram";

export const PLAN_OPTIONS = [
 {
  id:"starter",
  name:"Starter",
  tagline:"For solo sellers & new D2C founders.",
  priceMonthly:999,
  priceYearly:9588,
  features:[
    "Products & inventory",
    "Orders & customers",
    "WhatsApp + Telegram"
  ]
},

 {
  id:"pro",
  name:"Pro",
  tagline:"For growing D2C brands.",
  priceMonthly:1999,
  priceYearly:19188,
  features:[
    "Everything in Starter",
    "Instagram + Facebook",
    "Advanced analytics",
    "Payment links"
  ]
},

 {
  id:"business",
  name:"Business",
  tagline:"For established brands & agencies.",
  priceMonthly:5000,
  priceYearly:47988,
  features:[
    "Everything in Pro",
    "Hypnate X",
    "Expanded workspace"
  ]
},
] as const;
const R:Record<PlanId,number>={starter:1,pro:2,business:3}; 
const F:Record<PlanFeature,PlanId>={
  commerceWorkspace:"starter",
  catalogAi:"starter",
  advancedAnalytics:"pro",
  paymentLinks:"pro",
  hypnateX:"business"
}; 
const C:Record<PlanChannel,PlanId>={
  whatsapp:"starter",
  telegram:"starter",
  instagram:"pro",
  facebook:"pro"
};

export const normalizePlan = (value: unknown): PlanId | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "starter" ||
    normalized === "pro" ||
    normalized === "business"
  ) {
    return normalized;
  }

  return null;
};

export const hasPlanFeature=(p:unknown,f:PlanFeature)=>{
  const x=normalizePlan(p);return !!x&&R[x]>=R[F[f]]};

export const hasPlanChannel=(p:unknown,c:PlanChannel)=>{
  const x=normalizePlan(p);return !!x&&R[x]>=R[C[c]]};

export const requiredPlanForFeature=(f:PlanFeature)=>F[f]; 
export const requiredPlanForChannel=(c:PlanChannel)=>C[c];

export const getPlanDefinition=(p:PlanId)=>PLAN_OPTIONS.find(x=>x.id===p)||null;

export const getEffectivePlan=(seller:any)=>{
  const active=normalizePlan(seller?.activePlan);
    const status=String(seller?.planStatus||"").toUpperCase();
      const end=seller?.planCurrentPeriodEnd?
        new Date(seller.planCurrentPeriodEnd):null;
        if(active&&["ACTIVE","PENDING","CANCELLED"].includes(status)&&(!end||end>new Date()
        ))
      return{
        hasAccess:true,source:"paid" as const,
        plan:active
      };
        const trial=normalizePlan(seller?.trialPlan);
        const trialEnd=seller?.trialEndsAt?
        new Date(seller.trialEndsAt):null;
        if(trial&&trialEnd&&trialEnd>
          new Date()
        )
          return{
            hasAccess:true,source:"trial" as const,
            plan:trial};
            return{
              hasAccess:false,source:null,plan:null
            };
          };
