import api from "./api";
import type {
  BillingCycle,
  PlanId,
} from "../config/planEntitlements";

export const billingApi = {
  status: async () => {
    const response = await api.get("/api/billing/status");
    return response.data;
  },

  createSubscription: async (
    plan: PlanId,
    billingCycle: BillingCycle
  ) => {
    const response = await api.post(
      "/api/billing/subscription",
      {
        plan,
        billingCycle,
      }
    );

    return response.data;
  },

  verifyPayment: async (payload: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) => {
    const response = await api.post(
      "/api/billing/subscription/verify",
      payload
    );

    return response.data;
  },
};

export default billingApi;