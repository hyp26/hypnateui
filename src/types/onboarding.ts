export type Step = 1 | 2 | 3 | 4 | 5;

export type Gateway =
    | "razorpay"
    | "payu"
    | "cashfree"
    | "skydo"
    | "cod"
    | null;

export interface BusinessForm {
    businessName: string;
    industry: string;
    size: string;
    mobileNo: string;
    gstNumber: string;
}

export interface PaymentForm {
    gateway: Gateway;
    keyId: string;
    keySecret: string;
    merchantId: string;
    salt: string;
}