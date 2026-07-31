import { Building2, Upload, CreditCard, Share2, Sparkles, MessageCircle, Instagram, Facebook, Send } from "lucide-react";
import type { ChannelConfig, StepConfig } from "../types/onboarding";

export const STEPS_CONFIG: StepConfig[] = [
    { id: 1, title: "Business", icon: Building2 },
    { id: 2, title: "Catalog", icon: Upload },
    { id: 3, title: "Payments", icon: CreditCard },
    { id: 4, title: "Channels", icon: Share2 },
    { id: 5, title: "AI Setup", icon: Sparkles },
];

export const STEP_LABELS: Record<number, string> = {
    1: "Business Information",
    2: "Product Catalog",
    3: "Payment Setup",
    4: "Sales Channels",
};

export const CHANNEL_CFG: Record<string, ChannelConfig> = {
    whatsapp: {
        name: "WhatsApp",
        desc: "Automate order messages",
        icon: MessageCircle,
        gradient: "linear-gradient(135deg,#16a34a,#15803d)",
        glow: "rgba(22,163,74,0.2)",
        badge: "Most popular",
    },
    instagram: {
        name: "Instagram",
        desc: "DM automation & replies",
        icon: Instagram,
        gradient: "linear-gradient(135deg,#db2777,#9333ea)",
        glow: "rgba(219,39,119,0.2)",
        badge: "High engagement",
    },
    facebook: {
        name: "Facebook",
        desc: "Messenger automation",
        icon: Facebook,
        gradient: "linear-gradient(135deg,#2563eb,#1d4ed8)",
        glow: "rgba(37,99,235,0.2)",
        badge: null,
    },
    telegram: {
        name: "Telegram",
        desc: "Bot-powered selling",
        icon: Send,
        gradient: "linear-gradient(135deg,#0284c7,#0369a1)",
        glow: "rgba(2,132,199,0.2)",
        badge: "Fast setup",
    },
};