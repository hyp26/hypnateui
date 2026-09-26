import React, { useState, useEffect, useRef } from "react";
import {
  User, Building2, Lock, Bell, Share2, Save, MessageCircle,
  Instagram, Facebook, Send, CheckCircle2, Camera, Eye, EyeOff,
  Shield, Smartphone, AlertTriangle, Check, X, Loader2,
  ChevronRight, AlertCircle, Phone, MapPin, Hash, Globe,
  Trash2, Download, LogOut, CreditCard, Copy, CheckCheck, ExternalLink,
} from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { PlanGate } from "../components/plan/PlanGate";
import { hasPlanChannel, requiredPlanForChannel, type PlanChannel } from "../config/planEntitlements";
import { useIntegrationStore } from "../stores/useIntegrationStore";

/* ─── TYPES ─── */
interface ProfileData { name: string; email: string; phone: string; avatarUrl: string | null }
interface BusinessData { businessName: string; phone: string; address: string; gstNumber: string; website: string; industry: string }
interface PasswordData { currentPassword: string; newPassword: string; confirmPassword: string }
interface NotifPrefs { newOrder: boolean; paymentSuccess: boolean; newMessage: boolean; lowStock: boolean; orderShipped: boolean }

/* ─── HELPERS ─── */
const iStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a",
  outline: "none", background: "#fff", boxSizing: "border-box",
  fontFamily: "inherit", transition: "border-color 0.15s, box-shadow 0.15s",
};
const focusIn = (e: any) => { e.target.style.borderColor = "#0d9488"; e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.1)"; };
const focusOut = (e: any) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
    {children} {hint && <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: 12 }}>{hint}</span>}
  </label>
);

const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => (
  <div style={{
    position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 18px", borderRadius: 12,
    background: type === "success" ? "#f0fdf4" : "#fef2f2",
    border: `1px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    animation: "slideUp 0.3s ease",
    maxWidth: "calc(100vw - 32px)",
    width: "360px",
  }}>
    {type === "success"
      ? <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
      : <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
    }
    <p style={{ fontSize: 13, fontWeight: 500, color: type === "success" ? "#166534" : "#dc2626", margin: 0, flex: 1 }}>{message}</p>
    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 4, flexShrink: 0 }}>
      <X size={13} color={type === "success" ? "#16a34a" : "#dc2626"} />
    </button>
  </div>
);

const PasswordStrength = ({ password }: { password: string }) => {
  const checks = [
    { label: "8+ chars", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Symbol", pass: /[!@#$%^&*]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? colors[score - 1] : "#e2e8f0", transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {checks.map(c => (
            <span key={c.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: c.pass ? "#16a34a" : "#94a3b8" }}>
              {c.pass ? <Check size={10} /> : <X size={10} />} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: colors[score - 1] }}>{labels[score - 1]}</span>}
      </div>
    </div>
  );
};

const CHANNEL_CFG = {
  whatsapp: { name: "WhatsApp", icon: MessageCircle, gradient: "linear-gradient(135deg,#16a34a,#15803d)", glow: "rgba(22,163,74,0.15)", desc: "Connect Business API for automated messaging" },
  instagram: { name: "Instagram", icon: Instagram, gradient: "linear-gradient(135deg,#db2777,#9333ea)", glow: "rgba(219,39,119,0.15)", desc: "Sync DMs and automate story replies" },
  facebook: { name: "Facebook", icon: Facebook, gradient: "linear-gradient(135deg,#2563eb,#1d4ed8)", glow: "rgba(37,99,235,0.15)", desc: "Manage Messenger chats and Page interactions" },
  telegram: { name: "Telegram", icon: Send, gradient: "linear-gradient(135deg,#0284c7,#0369a1)", glow: "rgba(2,132,199,0.15)", desc: "Connect your Telegram Bot for customer support" },
};

/* User-facing messages for the WhatsApp OAuth callback (/settings?wa=...&reason=...).
 * Reason codes come from the backend redirect; raw provider payloads are never shown. */
const WA_CALLBACK_MESSAGES: Record<string, string> = {
  authorization_denied: "WhatsApp connection was canceled — the Meta permission request was denied. Nothing was connected.",
  invalid_response: "Meta returned an unexpected response while connecting WhatsApp. Please try again.",
  session_expired: "Your session expired while connecting WhatsApp. Please sign in again and retry.",
  state_mismatch: "The WhatsApp connection request could not be verified for security reasons. Please try connecting again.",
  state_invalid: "The WhatsApp connection request was invalid or expired. Please try connecting again.",
  authorization_failed: "WhatsApp authorization failed. Please try connecting again.",
  no_business: "No business was selected while connecting WhatsApp. Please pick your business and try again.",
  no_whatsapp_account: "No WhatsApp Business account was found. Make sure your WhatsApp Business account is set up in Meta Business Manager.",
  webhook_subscription_failed: "WhatsApp was connected, but notification setup could not be completed. Please reconnect or try again shortly.",
  connection_failed: "We could not complete the WhatsApp connection. Please try again.",
};
const WA_CALLBACK_FALLBACK = "We could not connect WhatsApp. Please try again.";

const GATEWAYS = [
  { id: "razorpay", name: "Razorpay", logo: "R", gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)", tagline: "Most popular in India", fees: "2% per transaction", fields: [{ key: "keyId", label: "Key ID", placeholder: "rzp_live_..." }, { key: "keySecret", label: "Key Secret", placeholder: "••••••••" }] },
  { id: "payu", name: "PayU", logo: "P", gradient: "linear-gradient(135deg,#f97316,#ea580c)", tagline: "Trusted by 5M+ businesses", fees: "1.99% per transaction", fields: [{ key: "merchantId", label: "Merchant Key", placeholder: "Your PayU Merchant Key" }, { key: "salt", label: "Salt", placeholder: "Your PayU Salt" }] },
  { id: "cashfree", name: "Cashfree", logo: "C", gradient: "linear-gradient(135deg,#16a34a,#15803d)", tagline: "Lowest fees, fast settlements", fees: "1.75% per transaction", fields: [{ key: "keyId", label: "App ID", placeholder: "Your Cashfree App ID" }, { key: "keySecret", label: "Secret Key", placeholder: "••••••••" }] },
  { id: "skydo", name: "Skydo", logo: "S", gradient: "linear-gradient(135deg,#7c3aed,#5b21b6)", tagline: "Best for international payments", fees: "1.99% + forex savings", fields: [{ key: "keyId", label: "API Key", placeholder: "Your Skydo API Key" }, { key: "keySecret", label: "API Secret", placeholder: "••••••••" }] },
  { id: "cod", name: "Cash on Delivery", logo: "₹", gradient: "linear-gradient(135deg,#64748b,#475569)", tagline: "No setup needed", fees: "Free — collect at delivery", fields: [] },
];

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "business", label: "Business", icon: Building2 },
  { id: "integrations", label: "Integrations", icon: Share2 },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export const Settings: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const selectedPlan = useAuthStore(s => s.user?.seller?.selectedPlan);

  /* Real WhatsApp connection state — the backend is the source of truth (no local toggle). */
  const whatsapp = useIntegrationStore(s => s.whatsapp);
  const whatsappLoading = useIntegrationStore(s => s.whatsappLoading);
  const whatsappValidating = useIntegrationStore(s => s.whatsappValidating);
  const whatsappDisconnecting = useIntegrationStore(s => s.whatsappDisconnecting);
  const whatsappError = useIntegrationStore(s => s.whatsappError);
  const loadWhatsAppStatus = useIntegrationStore(s => s.loadWhatsAppStatus);
  const connectWhatsApp = useIntegrationStore(s => s.connectWhatsApp);
  const validateWhatsApp = useIntegrationStore(s => s.validateWhatsApp);
  const disconnectWhatsApp = useIntegrationStore(s => s.disconnectWhatsApp);
  const clearWhatsAppError = useIntegrationStore(s => s.clearWhatsAppError);

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>({ name: "", email: "", phone: "", avatarUrl: null });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [business, setBusiness] = useState<BusinessData>({ businessName: "", phone: "", address: "", gstNumber: "", website: "", industry: "retail" });
  const [pwData, setPwData] = useState<PasswordData>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [notifs, setNotifs] = useState<NotifPrefs>({ newOrder: true, paymentSuccess: true, newMessage: true, lowStock: true, orderShipped: true });
  const [plForm, setPlForm] = useState({ amount: '', customerName: '', customerPhone: '', customerEmail: '', description: '' });
  const [plResult, setPlResult] = useState<{ shortUrl: string; amount: number } | null>(null);
  const [plCopied, setPlCopied] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<Record<string, boolean>>({ razorpay: true, payu: false, cashfree: false, skydo: false, cod: true });
  const [gatewayKeys, setGatewayKeys] = useState<Record<string, any>>({
    razorpay: { keyId: "rzp_test_123456789", keySecret: "" },
    payu: { merchantId: "", salt: "" },
    cashfree: { keyId: "", keySecret: "" },
    skydo: { keyId: "", keySecret: "" }
  });
  const [channels, setChannels] = useState({ whatsapp: false, instagram: false, facebook: false, telegram: false });

  useEffect(() => {
    const loadData = async () => {
      setFetching(true);
      try {
        const res = await api.get("/api/auth/profile");
        const u = res.data;
        setProfile({ name: u.name || "", email: u.email || "", phone: u.seller?.phone || "", avatarUrl: u.avatarUrl || null });
        setBusiness({ businessName: u.seller?.businessName || u.name || "", phone: u.seller?.phone || "", address: u.seller?.address || "", gstNumber: u.seller?.gstNumber || "", website: u.seller?.website || "", industry: u.seller?.industry || "retail" });
        if (u.avatarUrl) setAvatarPreview(u.avatarUrl);
      } catch {
        setProfile({ name: user?.name || "", email: user?.email || "", phone: "", avatarUrl: null });
        setBusiness(b => ({ ...b, businessName: user?.name || "" }));
      } finally { setFetching(false); }
    };
    loadData();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* Load the real WhatsApp connection status from the backend on page load.
   * If the OAuth callback params are present (?wa=...), show the right message,
   * strip the params from the URL (history API — routing config untouched),
   * and refresh so the UI reflects the new backend state. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wa = params.get("wa");
    if (wa) {
      const reason = params.get("reason");
      params.delete("wa");
      params.delete("reason");
      const qs = params.toString();
      window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
      if (wa === "connected") showToast("WhatsApp connected successfully.", "success");
      else showToast(WA_CALLBACK_MESSAGES[reason || ""] || WA_CALLBACK_FALLBACK, "error");
    }
    loadWhatsAppStatus();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("Image must be under 2MB", "error"); return; }
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const saveProfile = async () => {
    if (!profile.name.trim()) { showToast("Name is required", "error"); return; }
    setLoading(true);
    try {
      let avatarUrl = profile.avatarUrl;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        const uploadRes = await api.post("/api/products/upload?mode=cloud", fd, { headers: { "Content-Type": "multipart/form-data" } });
        avatarUrl = uploadRes.data?.url || avatarUrl;
      }
      await api.patch("/api/auth/profile", { name: profile.name, phone: profile.phone, avatarUrl });
      setUser({ ...user!, name: profile.name });
      showToast("Profile updated successfully");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to save profile", "error");
    } finally { setLoading(false); }
  };

  const saveBusiness = async () => {
    if (!business.businessName.trim()) { showToast("Business name is required", "error"); return; }
    setLoading(true);
    try {
      await api.post("/api/onboarding/business", { businessName: business.businessName, phone: business.phone, gstNumber: business.gstNumber, industry: business.industry });
      showToast("Business details saved");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to save business details", "error");
    } finally { setLoading(false); }
  };

  const changePassword = async () => {
    if (!pwData.currentPassword) { showToast("Current password is required", "error"); return; }
    if (!pwData.newPassword) { showToast("New password is required", "error"); return; }
    if (pwData.newPassword !== pwData.confirmPassword) { showToast("Passwords do not match", "error"); return; }
    if (pwData.newPassword.length < 8) { showToast("Password must be at least 8 characters", "error"); return; }
    if (!/[A-Z]/.test(pwData.newPassword)) { showToast("Password must include an uppercase letter", "error"); return; }
    if (!/[0-9]/.test(pwData.newPassword)) { showToast("Password must include a number", "error"); return; }
    if (!/[!@#$%^&*]/.test(pwData.newPassword)) { showToast("Password must include a special character (!@#$%^&*)", "error"); return; }
    setLoading(true);
    try {
      await api.patch("/api/auth/profile", { password: pwData.newPassword, currentPassword: pwData.currentPassword });
      setPwData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password changed successfully");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to change password", "error");
    } finally { setLoading(false); }
  };

  const saveNotifs = async () => {
    setLoading(true);
    try {
      await api.patch("/api/auth/notifications", notifs);
      showToast("Notification preferences saved");
    } catch {
      showToast("Saved locally (notifications API coming soon)");
    } finally { setLoading(false); }
  };

  const handleCreatePaymentLink = async () => {
    if (!plForm.amount || Number(plForm.amount) <= 0) { showToast("Enter a valid amount", "error"); return; }
    setLoading(true);
    try {
      const res = await api.post('/api/payments/link', { amount: Number(plForm.amount), customerName: plForm.customerName || undefined, customerPhone: plForm.customerPhone || undefined, customerEmail: plForm.customerEmail || undefined, description: plForm.description || undefined });
      setPlResult(res.data);
      showToast("Payment link created");
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to create payment link', "error");
    } finally { setLoading(false); }
  };

  const copyPaymentLink = () => {
    if (!plResult) return;
    navigator.clipboard.writeText(plResult.shortUrl);
    setPlCopied(true);
    setTimeout(() => setPlCopied(false), 2000);
  };

  const setPl = (k: string, v: string) => setPlForm(f => ({ ...f, [k]: v }));
  const initials = profile.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  const SaveBtn = ({ onClick }: { onClick: () => void }) => (
    <div style={{ paddingTop: 24, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
      <button onClick={onClick} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 24px", background: loading ? "#94a3b8" : "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(13,148,136,0.3)", fontFamily: "inherit" }}>
        {loading ? <Loader2 size={15} style={{ animation: "spin 0.7s linear infinite" }} /> : <Save size={15} />}
        {loading ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .tab-btn:hover { background: #f8fafc !important; }
        .notif-row:hover { background: #f8fafc !important; }
        .channel-card:hover { border-color: #0d9488 !important; box-shadow: 0 6px 20px rgba(13,148,136,0.1) !important; transform: translateY(-1px); }

        /* Settings layout */
        .settings-wrap { max-width: 960px; margin: 0 auto; padding: 0 16px 40px; font-family: 'Plus Jakarta Sans',-apple-system,sans-serif; }
        .settings-shell { display: flex; background: #fff; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 24px rgba(0,0,0,0.06); overflow: hidden; min-height: 600px; }

        /* Sidebar: hidden on mobile, visible on desktop */
        .settings-sidebar { width: 220px; background: #fafafa; border-right: 1px solid #f1f5f9; padding: 20px 12px; flex-shrink: 0; display: flex; flex-direction: column; }

        /* Mobile tab bar: visible on mobile, hidden on desktop */
        .settings-tab-bar {
          display: flex;
          background: #fafafa;
          border-bottom: 1px solid #f1f5f9;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .settings-tab-bar::-webkit-scrollbar { display: none; }

        /* Each tab: icon + label only when active */
        .settings-tab-bar-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          /* Equal width: 1/6 of bar, min 52px */
          flex: 1 0 52px;
          padding: 8px 4px;
          border: none;
          border-bottom: 2px solid transparent;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .settings-tab-bar-btn .tab-label {
          font-size: 9px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 56px;
          line-height: 1;
        }
        .settings-tab-bar-btn.active {
          color: #0d9488;
          border-bottom-color: #0d9488;
          background: rgba(13,148,136,0.04);
        }

        /* Content area */
        .settings-content { flex: 1; padding: 20px 16px; overflow-y: auto; min-width: 0; }

        /* Profile grid */
        .profile-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

        /* Payment gateways grid */
        .gateway-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

        /* Payment link phone/email row */
        .pl-row { display: grid; grid-template-columns: 1fr; gap: 16px; }

        @media (min-width: 640px) {
          .settings-wrap { padding: 0 24px 40px; }
          .profile-grid { grid-template-columns: 1fr 1fr; }
          .gateway-grid { grid-template-columns: 1fr 1fr; }
          .pl-row { grid-template-columns: 1fr 1fr; }
        }

        @media (min-width: 768px) {
          .settings-sidebar { display: flex !important; }
          .settings-tab-bar { display: none !important; }
          .settings-content { padding: 28px 32px; }
        }

        @media (max-width: 767px) {
          .settings-sidebar { display: none !important; }
          .settings-tab-bar { display: flex !important; }
          .settings-shell { flex-direction: column; border-radius: 16px; }
        }
      `}</style>

      <div className="settings-wrap">
        {/* Header */}
        <div style={{ marginBottom: 20, paddingTop: 8 }}>
          <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.4px" }}>Settings</h1>
          <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>Manage your account, business, and preferences.</p>
        </div>

        <div className="settings-shell">

          {/* ── DESKTOP SIDEBAR ── */}
          <div className="settings-sidebar">
            {/* User preview */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", marginBottom: 16, background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: avatarPreview ? "transparent" : "linear-gradient(135deg,#0d9488,#34d399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0, overflow: "hidden" }}>
                {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.name || user?.name || "User"}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, textTransform: "capitalize" }}>{user?.role?.toLowerCase() || "seller"}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {TABS.map(tab => (
                <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: activeTab === tab.id ? "#fff" : "transparent", color: activeTab === tab.id ? "#0d9488" : "#64748b", fontWeight: activeTab === tab.id ? 700 : 500, fontSize: 13, cursor: "pointer", textAlign: "left", boxShadow: activeTab === tab.id ? "0 2px 8px rgba(0,0,0,0.06)" : "none", transition: "all 0.15s", fontFamily: "inherit", width: "100%", position: "relative" }}>
                  {activeTab === tab.id && <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: "0 2px 2px 0", background: "#0d9488" }} />}
                  <tab.icon size={15} style={{ flexShrink: 0 }} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
              <button onClick={() => { logout(); navigate("/"); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, border: "none", background: "transparent", color: "#94a3b8", fontSize: 12, fontWeight: 500, cursor: "pointer", width: "100%", fontFamily: "inherit", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </div>

          {/* ── MOBILE TAB BAR ── */}
          <div className="settings-tab-bar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab-bar-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <tab.icon size={activeTab === tab.id ? 17 : 16} strokeWidth={activeTab === tab.id ? 2.5 : 1.8} />
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── CONTENT ── */}
          <div className="settings-content">
            {fetching ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
                <Loader2 size={28} color="#0d9488" style={{ animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : (
              <>
                {/* ── PROFILE ── */}
                {activeTab === "profile" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "slideUp 0.3s ease" }}>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Personal Information</h2>
                      <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Update your personal details and avatar.</p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ position: "relative" }}>
                        <div style={{ width: 72, height: 72, borderRadius: "50%", background: avatarPreview ? "transparent" : "linear-gradient(135deg,#0d9488,#34d399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", overflow: "hidden", border: "3px solid #fff", boxShadow: "0 4px 16px rgba(13,148,136,0.25)" }}>
                          {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
                        </div>
                        <button onClick={() => avatarRef.current?.click()} style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, borderRadius: "50%", background: "#0d9488", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Camera size={11} color="#fff" />
                        </button>
                        <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>Profile photo</p>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 10px" }}>PNG, JPG up to 2MB</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button onClick={() => avatarRef.current?.click()} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer", fontFamily: "inherit" }}>Change photo</button>
                          {avatarPreview && avatarFile && (
                            <button onClick={() => { setAvatarPreview(null); setAvatarFile(null); }} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", fontSize: 12, fontWeight: 600, color: "#dc2626", cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="profile-grid">
                      <div style={{ gridColumn: "1 / -1" }}>
                        <Label>Full Name</Label>
                        <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={iStyle} placeholder="Your full name" onFocus={focusIn} onBlur={focusOut} />
                      </div>
                      <div>
                        <Label>Email Address</Label>
                        <input value={profile.email} disabled style={{ ...iStyle, background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }} />
                        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Email cannot be changed.</p>
                      </div>
                      <div>
                        <Label hint="(optional)">Phone Number</Label>
                        <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} style={iStyle} placeholder="+91 98765 43210" onFocus={focusIn} onBlur={focusOut} />
                      </div>
                    </div>
                    <SaveBtn onClick={saveProfile} />
                  </div>
                )}

                {/* ── BUSINESS ── */}
                {activeTab === "business" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "slideUp 0.3s ease" }}>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Business Profile</h2>
                      <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>This information appears on your invoices and store page.</p>
                    </div>
                    <div className="profile-grid">
                      <div style={{ gridColumn: "1 / -1" }}>
                        <Label>Business Name</Label>
                        <input value={business.businessName} onChange={e => setBusiness(b => ({ ...b, businessName: e.target.value }))} style={iStyle} placeholder="Your business name" onFocus={focusIn} onBlur={focusOut} />
                      </div>
                      <div>
                        <Label>Industry</Label>
                        <select value={business.industry} onChange={e => setBusiness(b => ({ ...b, industry: e.target.value }))} style={{ ...iStyle, cursor: "pointer" }} onFocus={focusIn} onBlur={focusOut}>
                          {[["retail", "Retail"], ["food", "Food & Beverage"], ["fashion", "Fashion"], ["electronics", "Electronics"], ["beauty", "Beauty & Wellness"], ["furniture", "Furniture & Home"], ["services", "Services"], ["other", "Other"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label hint="(optional)">Business Phone</Label>
                        <input value={business.phone} onChange={e => setBusiness(b => ({ ...b, phone: e.target.value }))} style={iStyle} placeholder="+91 98765 43210" onFocus={focusIn} onBlur={focusOut} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <Label hint="(optional)">Business Address</Label>
                        <textarea value={business.address} onChange={e => setBusiness(b => ({ ...b, address: e.target.value }))} rows={3} style={{ ...iStyle, resize: "vertical" }} placeholder="123, Business Park, Mumbai" onFocus={focusIn} onBlur={focusOut} />
                      </div>
                      <div>
                        <Label hint="(optional)">GST Number</Label>
                        <input value={business.gstNumber} onChange={e => setBusiness(b => ({ ...b, gstNumber: e.target.value.toUpperCase() }))} style={{ ...iStyle, fontFamily: "monospace", textTransform: "uppercase" }} placeholder="27AAPFU0939F1ZV" maxLength={15} onFocus={focusIn} onBlur={focusOut} />
                      </div>
                      <div>
                        <Label hint="(optional)">Website</Label>
                        <input value={business.website} onChange={e => setBusiness(b => ({ ...b, website: e.target.value }))} style={iStyle} placeholder="https://yourstore.com" onFocus={focusIn} onBlur={focusOut} />
                      </div>
                    </div>
                    <SaveBtn onClick={saveBusiness} />
                  </div>
                )}

                {/* ── INTEGRATIONS ── */}
                {activeTab === "integrations" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "slideUp 0.3s ease" }}>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Connected Channels</h2>
                      <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Manage your social media and messaging integrations.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {(Object.keys(CHANNEL_CFG) as (keyof typeof CHANNEL_CFG)[]).map(key => {
                        const cfg = CHANNEL_CFG[key]; const isWhatsApp = key === "whatsapp"; const waConnected = isWhatsApp && whatsapp?.connected === true; const connected = isWhatsApp ? waConnected : channels[key]; const waPhone = isWhatsApp && whatsapp ? whatsapp.phoneNumbers[0] : undefined; const Icon = cfg.icon;
                        return (
                          <div key={key} className="channel-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${connected ? "#bbf7d0" : "#f1f5f9"}`, background: connected ? "#f0fdf4" : "#fff", transition: "all 0.2s", cursor: "default", flexWrap: "wrap" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${cfg.glow}`, flexShrink: 0 }}>
                              <Icon size={20} color="#fff" />
                            </div>
                            <div style={{ flex: 1, minWidth: 140 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, margin: 0 }}>{cfg.name}</p>
                                {connected && (
                                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
                                    <CheckCircle2 size={10} /> Connected
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{cfg.desc}</p>{!hasPlanChannel(selectedPlan, key as PlanChannel) && <span style={{ display: "inline-block", marginTop: 4, fontSize: 10, fontWeight: 700, color: "#7c3aed" }}>Requires Pro</span>}
                              {isWhatsApp && waConnected && whatsapp && (
                                <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: "2px 12px", fontSize: 11, color: "#475569" }}>
                                  {whatsapp.whatsappBusinessName && <span><strong>WhatsApp Business:</strong> {whatsapp.whatsappBusinessName}</span>}
                                  {whatsapp.businessName && <span><strong>Business:</strong> {whatsapp.businessName}</span>}
                                  {(waPhone?.displayPhoneNumber || waPhone?.verifiedName) && (
                                    <span><strong>Number:</strong> {waPhone?.displayPhoneNumber ?? ""}{waPhone?.verifiedName ? ` · ${waPhone.verifiedName}` : ""}</span>
                                  )}
                                  <span><strong>Status:</strong> {whatsapp.connectionStatus}</span>
                                </div>
                              )}
                              {isWhatsApp && !waConnected && whatsappLoading && (
                                <div style={{ marginTop: 6, fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                                  <Loader2 size={11} style={{ animation: "spin 0.7s linear infinite" }} /> Checking connection...
                                </div>
                              )}
                            </div>
                            {(() => {
                              const channel = key as PlanChannel;
                              const locked = !hasPlanChannel(selectedPlan, channel);
                              const required = requiredPlanForChannel(channel);
                              const upgradeBtn = (
                                <button
                                  type="button"
                                  onClick={() => navigate(`/pricing`)}
                                  style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
                                  aria-label={`Upgrade to ${required} to connect ${cfg.name}`}
                                >
                                  Upgrade · {required}
                                </button>
                              );
                              if (isWhatsApp) {
                                if (waConnected) return (
                                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                    <button type="button" onClick={() => { validateWhatsApp().then(ok => { if (ok) showToast("WhatsApp connection is valid.", "success"); }); }} disabled={whatsappValidating} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #bbf7d0", background: "#f0fdf4", color: "#15803d", fontSize: 12, fontWeight: 700, cursor: whatsappValidating ? "not-allowed" : "pointer", fontFamily: "inherit", flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                                      {whatsappValidating && <Loader2 size={12} style={{ animation: "spin 0.7s linear infinite" }} />} Revalidate
                                    </button>
                                    <button type="button" onClick={() => { disconnectWhatsApp(); }} disabled={whatsappDisconnecting} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: whatsappDisconnecting ? "not-allowed" : "pointer", fontFamily: "inherit", flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                                      {whatsappDisconnecting && <Loader2 size={12} style={{ animation: "spin 0.7s linear infinite" }} />} Disconnect
                                    </button>
                                  </div>
                                );
                                return locked ? upgradeBtn : (
                                  <button type="button" onClick={() => { connectWhatsApp(); }} disabled={whatsappLoading} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: whatsappLoading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 3px 10px rgba(13,148,136,0.25)", flexShrink: 0, opacity: whatsappLoading ? 0.7 : 1 }}>Connect WhatsApp</button>
                                );
                              }
                              return connected ? (
                                <button onClick={() => setChannels(c => ({ ...c, [key]: false }))} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>Disconnect</button>
                              ) : locked ? upgradeBtn : (
                                <button type="button" onClick={() => setChannels(c => ({ ...c, [key]: true }))} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 3px 10px rgba(13,148,136,0.25)", flexShrink: 0 }}>Connect</button>
                              );
                            })()}
                          </div>
                        );
                      })}
                    </div>
                      {whatsappError && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2" }}>
                          <AlertCircle size={14} color="#dc2626" style={{ flexShrink: 0 }} />
                          <p style={{ fontSize: 12, fontWeight: 500, color: "#dc2626", margin: 0, flex: 1 }}>{whatsappError}</p>
                          <button type="button" onClick={() => { clearWhatsAppError(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0 }} aria-label="Dismiss WhatsApp error">
                            <X size={13} color="#dc2626" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* ── PAYMENTS ── */}
                {activeTab === "payments" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 32, animation: "slideUp 0.3s ease" }}>
                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Payment Gateways</h2>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Configure how your customers can pay you.</p>
                      </div>
                      <div className="gateway-grid">
                        {GATEWAYS.map(gw => {
                          const isEnabled = paymentOptions[gw.id];
                          return (
                            <div key={gw.id} className="channel-card" style={{ padding: 16, borderRadius: 14, border: `1.5px solid ${isEnabled ? "#bbf7d0" : "#f1f5f9"}`, background: isEnabled ? "#f0fdf4" : "#fff", cursor: "pointer", transition: "all 0.2s" }} onClick={() => setPaymentOptions(p => ({ ...p, [gw.id]: !p[gw.id] }))}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isEnabled && gw.fields.length > 0 ? 16 : 0 }}>
                                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
                                  <div style={{ width: 40, height: 40, borderRadius: 10, background: gw.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{gw.logo}</span>
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 800, color: "#0f172a", fontSize: 14, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{gw.name}</p>
                                    <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{gw.tagline}</p>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: "#0d9488", margin: "3px 0 0" }}>{gw.fees}</p>
                                  </div>
                                </div>
                                <div style={{ width: 40, height: 22, borderRadius: 12, background: isEnabled ? "#16a34a" : "#e2e8f0", position: "relative", transition: "background 0.2s", flexShrink: 0, marginTop: 8, marginLeft: 8 }}>
                                  <div style={{ position: "absolute", top: 2, left: isEnabled ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                                </div>
                              </div>
                              {isEnabled && gw.fields.length > 0 && (
                                <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
                                  {gw.fields.map(field => (
                                    <div key={field.key}>
                                      <Label>{field.label}</Label>
                                      <input
                                        value={gatewayKeys[gw.id]?.[field.key] || ""}
                                        onChange={e => setGatewayKeys(prev => ({ ...prev, [gw.id]: { ...prev[gw.id], [field.key]: e.target.value } }))}
                                        style={{ ...iStyle, padding: "8px 12px", fontSize: 13, fontFamily: "monospace" }}
                                        placeholder={field.placeholder}
                                        type={field.key.toLowerCase().includes('secret') || field.key.toLowerCase().includes('salt') ? "password" : "text"}
                                        onFocus={focusIn} onBlur={focusOut}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={() => showToast("Payment gateway preferences saved")} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", background: "#0f172a", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                          <Save size={14} /> Save Gateways
                        </button>
                      </div>
                    </div>

                    <div style={{ height: 1, background: "#f1f5f9" }} />

                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Payment Links</h2>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Create a payment link to collect payments directly.</p>
                      </div>
                      <PlanGate feature="paymentLinks" compact>
                      <div style={{ padding: 20, background: "#f8fafc", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                        {plResult ? (
                          <div style={{ textAlign: "center", padding: "16px 0" }}>
                            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                              <CheckCheck size={26} />
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Payment link created!</h3>
                            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
                              Share this link to collect {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(plResult.amount)}
                            </p>
                            <div style={{ display: "flex", gap: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", textAlign: "left", marginBottom: 14 }}>
                              <span style={{ flex: 1, fontSize: 12, color: "#0d9488", fontWeight: 600, wordBreak: "break-all" }}>{plResult.shortUrl}</span>
                              <button onClick={copyPaymentLink} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#0d9488", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}>
                                {plCopied ? <CheckCheck size={13} /> : <Copy size={13} />} {plCopied ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                              <a href={plResult.shortUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, padding: "9px 16px", borderRadius: 10, textDecoration: "none" }}>
                                <ExternalLink size={13} /> Open Link
                              </a>
                              <button onClick={() => { setPlResult(null); setPlForm({ amount: '', customerName: '', customerPhone: '', customerEmail: '', description: '' }); }} style={{ background: "#f1f5f9", color: "#374151", fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                                Create Another
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div>
                              <Label>Amount (₹) *</Label>
                              <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 600, color: "#94a3b8", pointerEvents: "none" }}>₹</span>
                                <input type="number" min="1" value={plForm.amount} onChange={e => setPl('amount', e.target.value)} style={{ ...iStyle, paddingLeft: 28 }} placeholder="0" onFocus={focusIn} onBlur={focusOut} />
                              </div>
                            </div>
                            <div>
                              <Label>Customer Name</Label>
                              <input value={plForm.customerName} onChange={e => setPl('customerName', e.target.value)} style={iStyle} placeholder="e.g. Rahul Sharma" onFocus={focusIn} onBlur={focusOut} />
                            </div>
                            <div className="pl-row">
                              <div>
                                <Label>Phone</Label>
                                <input value={plForm.customerPhone} onChange={e => setPl('customerPhone', e.target.value)} style={iStyle} placeholder="+91 98765 43210" onFocus={focusIn} onBlur={focusOut} />
                              </div>
                              <div>
                                <Label>Email</Label>
                                <input value={plForm.customerEmail} onChange={e => setPl('customerEmail', e.target.value)} style={iStyle} placeholder="customer@email.com" onFocus={focusIn} onBlur={focusOut} />
                              </div>
                            </div>
                            <div>
                              <Label>Description</Label>
                              <input value={plForm.description} onChange={e => setPl('description', e.target.value)} style={iStyle} placeholder="e.g. Payment for Order #1023" onFocus={focusIn} onBlur={focusOut} />
                            </div>
                            <div style={{ marginTop: 4, display: "flex", justifyContent: "flex-end" }}>
                              <button onClick={handleCreatePaymentLink} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", background: loading ? "#94a3b8" : "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(13,148,136,0.3)", fontFamily: "inherit" }}>
                                {loading ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> : <CreditCard size={14} />}
                                Create Link
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      </PlanGate>
                    </div>
                  </div>
                )}

                {/* ── SECURITY ── */}
                {activeTab === "security" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 28, animation: "slideUp 0.3s ease" }}>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Security</h2>
                      <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Protect your account with a strong password.</p>
                    </div>
                    <div style={{ padding: 20, background: "#f8fafc", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Lock size={16} color="#fff" />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Change Password</p>
                          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Use a strong password you don't use elsewhere</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {[
                          { key: "currentPassword", label: "Current Password", showKey: "current" as const, placeholder: "Your current password" },
                          { key: "newPassword", label: "New Password", showKey: "new" as const, placeholder: "Min 8 chars, uppercase, number, symbol" },
                          { key: "confirmPassword", label: "Confirm New Password", showKey: "confirm" as const, placeholder: "Repeat new password" },
                        ].map(({ key, label, showKey, placeholder }) => (
                          <div key={key}>
                            <Label>{label}</Label>
                            <div style={{ position: "relative" }}>
                              <input
                                type={showPw[showKey] ? "text" : "password"}
                                value={pwData[key as keyof PasswordData]}
                                onChange={e => setPwData(p => ({ ...p, [key]: e.target.value }))}
                                style={{ ...iStyle, paddingRight: 44, borderColor: key === "confirmPassword" && pwData.confirmPassword && pwData.confirmPassword !== pwData.newPassword ? "#ef4444" : "#e2e8f0" }}
                                placeholder={placeholder}
                                onFocus={focusIn} onBlur={focusOut}
                              />
                              <button type="button" onClick={() => setShowPw(s => ({ ...s, [showKey]: !s[showKey] }))} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                                {showPw[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                            {key === "newPassword" && <PasswordStrength password={pwData.newPassword} />}
                            {key === "confirmPassword" && pwData.confirmPassword && pwData.confirmPassword !== pwData.newPassword && (
                              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} /> Passwords do not match</p>
                            )}
                            {key === "confirmPassword" && pwData.confirmPassword && pwData.confirmPassword === pwData.newPassword && pwData.newPassword && (
                              <p style={{ fontSize: 12, color: "#16a34a", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><Check size={11} /> Passwords match</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={changePassword} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", background: loading ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.3)", fontFamily: "inherit" }}>
                          {loading ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> : <Shield size={14} />}
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div style={{ padding: 16, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 14 }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <AlertTriangle size={15} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#92400e", margin: 0 }}>Security best practices</p>
                      </div>
                      {["Use a unique password not used on other sites", "Never share your password with anyone", "Log out of shared or public devices after use"].map((tip, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fcd34d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            <span style={{ fontSize: 9, fontWeight: 800, color: "#78350f" }}>{i + 1}</span>
                          </div>
                          <p style={{ fontSize: 12, color: "#92400e", margin: 0, lineHeight: 1.5 }}>{tip}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: 16, background: "#fff", border: "1.5px solid #fecaca", borderRadius: 14 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", margin: "0 0 8px" }}>Danger Zone</p>
                      <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px", lineHeight: 1.6 }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
                      <button style={{ padding: "8px 16px", borderRadius: 9, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                        <Trash2 size={13} /> Delete Account
                      </button>
                    </div>
                  </div>
                )}

                {/* ── NOTIFICATIONS ── */}
                {activeTab === "notifications" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "slideUp 0.3s ease" }}>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Notification Preferences</h2>
                      <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Choose what events trigger notifications for you.</p>
                    </div>
                    <div style={{ border: "1px solid #f1f5f9", borderRadius: 14, overflow: "hidden" }}>
                      {[
                        { key: "newOrder", label: "New Order Received", desc: "When a customer places a new order", color: "#8b5cf6" },
                        { key: "paymentSuccess", label: "Payment Successful", desc: "When a payment is confirmed", color: "#16a34a" },
                        { key: "newMessage", label: "New Customer Message", desc: "When a customer sends a message", color: "#0284c7" },
                        { key: "lowStock", label: "Low Stock Alert", desc: "When a product stock drops below 10 units", color: "#f59e0b" },
                        { key: "orderShipped", label: "Order Shipped", desc: "When an order is marked as shipped", color: "#0d9488" },
                      ].map((item, i, arr) => (
                        <div key={item.key} className="notif-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: i < arr.length - 1 ? "1px solid #f8fafc" : "none", transition: "background 0.1s", gap: 12 }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1, minWidth: 0 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: 0 }}>{item.label}</p>
                              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{item.desc}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key as keyof NotifPrefs] }))}
                            style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: notifs[item.key as keyof NotifPrefs] ? "#0d9488" : "#e2e8f0", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
                          >
                            <div style={{ position: "absolute", top: 2, left: notifs[item.key as keyof NotifPrefs] ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <SaveBtn onClick={saveNotifs} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};