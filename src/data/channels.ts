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
        setupUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started",
        setupLabel: "Open Meta setup guide",
        setupSteps: [
            "Create or use a Meta Business Portfolio and open WhatsApp Manager.",
            "Create a WhatsApp Business Account and add the phone number you want to use.",
            "Create a Meta app with WhatsApp enabled and generate a permanent access token.",
            "Copy the token and enter the WhatsApp phone number in the fields above.",
        ],
        setupNote: "The phone number must be eligible for WhatsApp Business API use. Keep access tokens private.",
    },
    instagram: {
        name: "Instagram",
        desc: "DM automation & replies",
        icon: Instagram,
        gradient: "linear-gradient(135deg,#db2777,#9333ea)",
        glow: "rgba(219,39,119,0.2)",
        badge: "High engagement",
        setupUrl: "https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/",
        setupLabel: "Open Instagram setup guide",
        setupSteps: [
            "Switch the Instagram account to a professional account.",
            "Make sure the account is connected to the Meta business setup used by your store.",
            "Continue with Meta and approve the requested Instagram messaging permissions.",
            "Return to Hypnate and confirm the account appears as connected.",
        ],
        setupNote: "Instagram connections use Meta authorization; you do not need to paste an Instagram password into Hypnate.",
    },
    facebook: {
        name: "Facebook",
        desc: "Messenger automation",
        icon: Facebook,
        gradient: "linear-gradient(135deg,#2563eb,#1d4ed8)",
        glow: "rgba(37,99,235,0.2)",
        badge: null,
        setupUrl: "https://developers.facebook.com/docs/pages-api/",
        setupLabel: "Open Facebook setup guide",
        setupSteps: [
            "Make sure you have admin or appropriate access to the Facebook Page.",
            "Make sure the Page belongs to the Meta business setup used by your store.",
            "Continue with Meta and approve Page and messaging permissions.",
            "Return to Hypnate and confirm the Page appears as connected.",
        ],
        setupNote: "Hypnate should never ask for your Facebook password. Connection is completed through Meta authorization.",
    },
    telegram: {
        name: "Telegram",
        desc: "Bot-powered selling",
        icon: Send,
        gradient: "linear-gradient(135deg,#0284c7,#0369a1)",
        glow: "rgba(2,132,199,0.2)",
        badge: "Fast setup",
        setupUrl: "https://t.me/BotFather",
        setupLabel: "Open @BotFather",
        setupSteps: [
            "Open @BotFather in Telegram and send /newbot.",
            "Choose a display name and a unique username ending in bot.",
            "BotFather will generate an API token. Copy the complete token.",
            "Paste the token below and select Connect. Hypnate will verify it before marking the bot connected.",
        ],
        setupNote: "Treat the bot token like a password. Anyone with it can control the bot.",
    },
};
