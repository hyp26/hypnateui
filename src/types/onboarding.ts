import type React from "react";

export type Step = 1 | 2 | 3 | 4 | 5;
export type Gateway = "razorpay" | "payu" | "cashfree" | "skydo" | "cod" | null;
export type ModalType = "whatsapp" | "instagram" | "facebook" | "telegram" | null;

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

export interface ChannelData {
    whatsapp: { connected: boolean; phone: string; apiKey: string };
    instagram: { connected: boolean };
    facebook: { connected: boolean };
    telegram: { connected: boolean; botToken: string };
}

export interface AutoTask {
    id: number;
    label: string;
    done: boolean;
}

export interface GatewayField {
    key: "keyId" | "keySecret" | "merchantId" | "salt";
    label: string;
    placeholder: string;
    mono: boolean;
    secret: boolean;
}

export interface GatewayConfig {
    id: Gateway;
    name: string;
    logo: string;
    gradient: string;
    tagline: string;
    fees: string;
    setupUrl: string | null;
    setupSteps: string[];
    fields: GatewayField[];
}

export interface ChannelConfig {
    name: string;
    desc: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    gradient: string;
    glow: string;
    badge: string | null;
    setupUrl?: string;
    setupLabel?: string;
    setupSteps: string[];
    setupNote?: string;
}

export interface StepConfig {
    id: number;
    title: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
}