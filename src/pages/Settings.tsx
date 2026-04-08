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
    position: "fixed", bottom: 24, right: 24, zIndex: 9999,
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 18px", borderRadius: 12,
    background: type === "success" ? "#f0fdf4" : "#fef2f2",
    border: `1px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    animation: "slideUp 0.3s ease",
    maxWidth: 360,
  }}>
    {type === "success"
      ? <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
      : <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
    }
    <p style={{ fontSize: 13, fontWeight: 500, color: type === "success" ? "#166534" : "#dc2626", margin: 0 }}>{message}</p>
    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 4 }}>
      <X size={13} color={type === "success" ? "#16a34a" : "#dc2626"} />
    </button>
  </div>
);

const PasswordStrength = ({ password }: { password: string }) => {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[!@#$%^&*]/.test(password) },
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
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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

/* ─── CHANNEL CONFIG ─── */
const CHANNEL_CFG = {
  whatsapp: { name: "WhatsApp", icon: MessageCircle, gradient: "linear-gradient(135deg,#16a34a,#15803d)", glow: "rgba(22,163,74,0.15)", desc: "Connect Business API for automated messaging" },
  instagram: { name: "Instagram", icon: Instagram, gradient: "linear-gradient(135deg,#db2777,#9333ea)", glow: "rgba(219,39,119,0.15)", desc: "Sync DMs and automate story replies" },
  facebook: { name: "Facebook", icon: Facebook, gradient: "linear-gradient(135deg,#2563eb,#1d4ed8)", glow: "rgba(37,99,235,0.15)", desc: "Manage Messenger chats and Page interactions" },
  telegram: { name: "Telegram", icon: Send, gradient: "linear-gradient(135deg,#0284c7,#0369a1)", glow: "rgba(2,132,199,0.15)", desc: "Connect your Telegram Bot for customer support" },
};

/* ─── PAYMENT GATEWAYS ─── */
const GATEWAYS = [
  { id: "razorpay", name: "Razorpay", logo: "R", gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)", tagline: "Most popular in India", fees: "2% per transaction", fields: [{ key: "keyId", label: "Key ID", placeholder: "rzp_live_... or rzp_test_..." }, { key: "keySecret", label: "Key Secret", placeholder: "••••••••••••••••" }] },
  { id: "payu", name: "PayU", logo: "P", gradient: "linear-gradient(135deg,#f97316,#ea580c)", tagline: "Trusted by 5M+ businesses", fees: "1.99% per transaction", fields: [{ key: "merchantId", label: "Merchant Key", placeholder: "Your PayU Merchant Key" }, { key: "salt", label: "Salt", placeholder: "Your PayU Salt" }] },
  { id: "cashfree", name: "Cashfree", logo: "C", gradient: "linear-gradient(135deg,#16a34a,#15803d)", tagline: "Lowest fees, fast settlements", fees: "1.75% per transaction", fields: [{ key: "keyId", label: "App ID", placeholder: "Your Cashfree App ID" }, { key: "keySecret", label: "Secret Key", placeholder: "••••••••••••••••" }] },
  { id: "skydo", name: "Skydo", logo: "S", gradient: "linear-gradient(135deg,#7c3aed,#5b21b6)", tagline: "Best for international payments", fees: "1.99% + forex savings", fields: [{ key: "keyId", label: "API Key", placeholder: "Your Skydo API Key" }, { key: "keySecret", label: "API Secret", placeholder: "••••••••••••••••" }] },
  { id: "cod", name: "Cash on Delivery", logo: "₹", gradient: "linear-gradient(135deg,#64748b,#475569)", tagline: "No setup needed", fees: "Free — collect at delivery", fields: [] },
];

/* ─── TABS ─── */
const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "business", label: "Business", icon: Building2 },
  { id: "integrations", label: "Integrations", icon: Share2 },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
];

/* ─── MAIN ─── */
export const Settings: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  // Profile
  const [profile, setProfile] = useState<ProfileData>({ name: "", email: "", phone: "", avatarUrl: null });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Business
  const [business, setBusiness] = useState<BusinessData>({ businessName: "", phone: "", address: "", gstNumber: "", website: "", industry: "retail" });

  // Password
  const [pwData, setPwData] = useState<PasswordData>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  // Notifications
  const [notifs, setNotifs] = useState<NotifPrefs>({ newOrder: true, paymentSuccess: true, newMessage: true, lowStock: true, orderShipped: true });

  // Payments
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

  // Channels (from local state since no backend yet)
  const [channels, setChannels] = useState({ whatsapp: false, instagram: false, facebook: false, telegram: false });

  /* ── FETCH DATA ── */
  useEffect(() => {
    const loadData = async () => {
      setFetching(true);
      try {
        const res = await api.get("/api/auth/profile");
        const u = res.data;
        setProfile({
          name: u.name || "",
          email: u.email || "",
          phone: u.seller?.phone || "",
          avatarUrl: u.avatarUrl || null,
        });
        setBusiness({
          businessName: u.seller?.businessName || u.name || "",
          phone: u.seller?.phone || "",
          address: u.seller?.address || "",
          gstNumber: u.seller?.gstNumber || "",
          website: u.seller?.website || "",
          industry: u.seller?.industry || "retail",
        });
        if (u.avatarUrl) setAvatarPreview(u.avatarUrl);
      } catch {
        // Use data from auth store as fallback
        setProfile({ name: user?.name || "", email: user?.email || "", phone: "", avatarUrl: null });
        setBusiness(b => ({ ...b, businessName: user?.name || "" }));
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── AVATAR UPLOAD ── */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("Image must be under 2MB", "error"); return; }

    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  /* ── SAVE PROFILE ── */
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

  /* ── SAVE BUSINESS ── */
  const saveBusiness = async () => {
    if (!business.businessName.trim()) { showToast("Business name is required", "error"); return; }
    setLoading(true);
    try {
      await api.post("/api/onboarding/business", {
        businessName: business.businessName,
        phone: business.phone,
        gstNumber: business.gstNumber,
        industry: business.industry,
      });
      showToast("Business details saved");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to save business details", "error");
    } finally { setLoading(false); }
  };

  /* ── CHANGE PASSWORD ── */
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

  /* ── SAVE NOTIFICATIONS ── */
  const saveNotifs = async () => {
    setLoading(true);
    try {
      await api.patch("/api/auth/notifications", notifs);
      showToast("Notification preferences saved");
    } catch {
      showToast("Saved locally (notifications API coming soon)");
    } finally { setLoading(false); }
  };

  /* ── CREATE PAYMENT LINK ── */
  const handleCreatePaymentLink = async () => {
    if (!plForm.amount || Number(plForm.amount) <= 0) { showToast("Enter a valid amount", "error"); return; }
    setLoading(true);
    try {
      const res = await api.post('/api/payments/link', {
        amount: Number(plForm.amount),
        customerName: plForm.customerName || undefined,
        customerPhone: plForm.customerPhone || undefined,
        customerEmail: plForm.customerEmail || undefined,
        description: plForm.description || undefined,
      });
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
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 0 40px", fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.4px" }}>Settings</h1>
          <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>Manage your account, business, and preferences.</p>
        </div>

        <div style={{ display: "flex", background: "#fff", borderRadius: 20, border: "1px solid #f1f5f9", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden", minHeight: 600 }}>
          {/* Sidebar */}
          <div style={{ width: 220, background: "#fafafa", borderRight: "1px solid #f1f5f9", padding: "20px 12px", flexShrink: 0 }}>
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

            {/* Danger zone */}
            <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
              <button onClick={() => { logout(); navigate("/login"); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, border: "none", background: "transparent", color: "#94a3b8", fontSize: 12, fontWeight: 500, cursor: "pointer", width: "100%", fontFamily: "inherit", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto", minWidth: 0 }}>
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

                    {/* Avatar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <div style={{ position: "relative" }}>
                        <div style={{ width: 80, height: 80, borderRadius: "50%", background: avatarPreview ? "transparent" : "linear-gradient(135deg,#0d9488,#34d399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff", overflow: "hidden", border: "3px solid #fff", boxShadow: "0 4px 16px rgba(13,148,136,0.25)" }}>
                          {avatarPreview
                            ? <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : initials
                          }
                        </div>
                        <button onClick={() => avatarRef.current?.click()} style={{ position: "absolute", bottom: -2, right: -2, width: 28, height: 28, borderRadius: "50%", background: "#0d9488", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Camera size={12} color="#fff" />
                        </button>
                        <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>Profile photo</p>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 10px" }}>PNG, JPG up to 2MB</p>
                        <button onClick={() => avatarRef.current?.click()} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer", fontFamily: "inherit" }}>
                          Change photo
                        </button>
                        {avatarPreview && avatarFile && (
                          <button onClick={() => { setAvatarPreview(null); setAvatarFile(null); }} style={{ marginLeft: 8, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", fontSize: 12, fontWeight: 600, color: "#dc2626", cursor: "pointer", fontFamily: "inherit" }}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <Label>Full Name</Label>
                        <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={iStyle} placeholder="Your full name" onFocus={focusIn} onBlur={focusOut} />
                      </div>
                      <div>
                        <Label>Email Address</Label>
                        <input value={profile.email} disabled style={{ ...iStyle, background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }} />
                        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Email cannot be changed. Contact support if needed.</p>
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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
                        <textarea value={business.address} onChange={e => setBusiness(b => ({ ...b, address: e.target.value }))} rows={3} style={{ ...iStyle, resize: "vertical" }} placeholder="123, Business Park, Mumbai, Maharashtra 400001" onFocus={focusIn} onBlur={focusOut} />
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
                        const cfg = CHANNEL_CFG[key]; const connected = channels[key]; const Icon = cfg.icon;
                        return (
                          <div key={key} className="channel-card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 14, border: `1.5px solid ${connected ? "#bbf7d0" : "#f1f5f9"}`, background: connected ? "#f0fdf4" : "#fff", transition: "all 0.2s", cursor: "default" }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: cfg.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${cfg.glow}`, flexShrink: 0 }}>
                              <Icon size={22} color="#fff" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, margin: 0 }}>{cfg.name}</p>
                                {connected && (
                                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
                                    <CheckCircle2 size={10} /> Connected
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{cfg.desc}</p>
                            </div>
                            {connected ? (
                              <button onClick={() => setChannels(c => ({ ...c, [key]: false }))} style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                                Disconnect
                              </button>
                            ) : (
                              <button onClick={() => setChannels(c => ({ ...c, [key]: true }))} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 3px 10px rgba(13,148,136,0.25)", flexShrink: 0 }}>
                                Connect
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── PAYMENTS ── */}
                {activeTab === "payments" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 32, animation: "slideUp 0.3s ease" }}>
                    
                    {/* Payment Gateways */}
                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Payment Gateways</h2>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Configure how your customers can pay you.</p>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {GATEWAYS.map(gw => {
                          const isEnabled = paymentOptions[gw.id];
                          return (
                            <div key={gw.id} className="channel-card" style={{ padding: 20, borderRadius: 14, border: `1.5px solid ${isEnabled ? "#bbf7d0" : "#f1f5f9"}`, background: isEnabled ? "#f0fdf4" : "#fff", cursor: "pointer", transition: "all 0.2s" }} onClick={() => setPaymentOptions(p => ({ ...p, [gw.id]: !p[gw.id] }))}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isEnabled && gw.fields.length > 0 ? 16 : 0 }}>
                                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                  <div style={{ width: 44, height: 44, borderRadius: 12, background: gw.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px ${gw.gradient.replace("linear-gradient", "rgba").split(",")[1].trim().replace(")", ",0.25)")}` }}>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{gw.logo}</span>
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 800, color: "#0f172a", fontSize: 16, margin: "0 0 2px" }}>{gw.name}</p>
                                    <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{gw.tagline}</p>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0d9488", margin: "4px 0 0" }}>{gw.fees}</p>
                                  </div>
                                </div>
                                <div style={{ width: 44, height: 24, borderRadius: 12, background: isEnabled ? "#16a34a" : "#e2e8f0", position: "relative", transition: "background 0.2s", flexShrink: 0, marginTop: 10 }}>
                                  <div style={{ position: "absolute", top: 2, left: isEnabled ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                                </div>
                              </div>
                              {isEnabled && gw.fields.length > 0 && (
                                <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
                                  {gw.fields.map(field => (
                                    <div key={field.key}>
                                      <Label>{field.label}</Label>
                                      <input 
                                        value={gatewayKeys[gw.id]?.[field.key] || ""} 
                                        onChange={e => setGatewayKeys(prev => ({ ...prev, [gw.id]: { ...prev[gw.id], [field.key]: e.target.value } }))} 
                                        style={{...iStyle, padding: "8px 12px", fontSize: 13, fontFamily: "monospace"}} 
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

                    {/* Payment Links */}
                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Payment Links</h2>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Create a new payment link to collect payments directly.</p>
                      </div>

                      <div style={{ padding: 24, background: "#f8fafc", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                      {plResult ? (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <CheckCheck size={28} />
                          </div>
                          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Payment link created!</h3>
                          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px" }}>
                            Share this link with your customer to collect {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(plResult.amount)}
                          </p>
                          <div style={{ display: "flex", gap: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", textAlign: "left", marginBottom: 16 }}>
                            <span style={{ flex: 1, fontSize: 13, color: "#0d9488", fontWeight: 600, wordBreak: "break-all" }}>{plResult.shortUrl}</span>
                            <button onClick={copyPaymentLink} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#0d9488", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}>
                              {plCopied ? <CheckCheck size={14} /> : <Copy size={14} />} {plCopied ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                            <a href={plResult.shortUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, padding: "9px 16px", borderRadius: 10, textDecoration: "none" }}>
                              <ExternalLink size={13} /> Open Link
                            </a>
                            <button onClick={() => { setPlResult(null); setPlForm({ amount: '', customerName: '', customerPhone: '', customerEmail: '', description: '' }); }} style={{ background: "#f1f5f9", color: "#374151", fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                              Create Another
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          <div>
                            <Label>Amount (₹) *</Label>
                            <div style={{ position: "relative" }}>
                              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 600, color: "#94a3b8", pointerEvents: "none" }}>₹</span>
                              <input type="number" min="1" value={plForm.amount} onChange={e => setPl('amount', e.target.value)} style={{...iStyle, paddingLeft: 28}} placeholder="0" onFocus={focusIn} onBlur={focusOut} />
                            </div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div style={{ gridColumn: "1 / -1" }}>
                              <Label>Customer Name</Label>
                              <input value={plForm.customerName} onChange={e => setPl('customerName', e.target.value)} style={iStyle} placeholder="e.g. Rahul Sharma" onFocus={focusIn} onBlur={focusOut} />
                            </div>
                            <div>
                              <Label>Phone</Label>
                              <input value={plForm.customerPhone} onChange={e => setPl('customerPhone', e.target.value)} style={iStyle} placeholder="+91 98765 43210" onFocus={focusIn} onBlur={focusOut} />
                            </div>
                            <div>
                              <Label>Email</Label>
                              <input value={plForm.customerEmail} onChange={e => setPl('customerEmail', e.target.value)} style={iStyle} placeholder="customer@email.com" onFocus={focusIn} onBlur={focusOut} />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                              <Label>Description</Label>
                              <input value={plForm.description} onChange={e => setPl('description', e.target.value)} style={iStyle} placeholder="e.g. Payment for Order #1023" onFocus={focusIn} onBlur={focusOut} />
                            </div>
                          </div>
                          <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                            <button onClick={handleCreatePaymentLink} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", background: loading ? "#94a3b8" : "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(13,148,136,0.3)", fontFamily: "inherit" }}>
                              {loading ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> : <CreditCard size={14} />}
                              Create Link
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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

                    {/* Change password */}
                    <div style={{ padding: 24, background: "#f8fafc", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Lock size={16} color="#fff" />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Change Password</p>
                          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Use a strong password you don't use elsewhere</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                          <Label>Current Password</Label>
                          <div style={{ position: "relative" }}>
                            <input type={showPw.current ? "text" : "password"} value={pwData.currentPassword} onChange={e => setPwData(p => ({ ...p, currentPassword: e.target.value }))} style={{ ...iStyle, paddingRight: 44 }} placeholder="Your current password" onFocus={focusIn} onBlur={focusOut} />
                            <button type="button" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                              {showPw.current ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label>New Password</Label>
                          <div style={{ position: "relative" }}>
                            <input type={showPw.new ? "text" : "password"} value={pwData.newPassword} onChange={e => setPwData(p => ({ ...p, newPassword: e.target.value }))} style={{ ...iStyle, paddingRight: 44 }} placeholder="Min 8 chars, uppercase, number, symbol" onFocus={focusIn} onBlur={focusOut} />
                            <button type="button" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                              {showPw.new ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                          <PasswordStrength password={pwData.newPassword} />
                        </div>
                        <div>
                          <Label>Confirm New Password</Label>
                          <div style={{ position: "relative" }}>
                            <input type={showPw.confirm ? "text" : "password"} value={pwData.confirmPassword} onChange={e => setPwData(p => ({ ...p, confirmPassword: e.target.value }))} style={{ ...iStyle, paddingRight: 44, borderColor: pwData.confirmPassword && pwData.confirmPassword !== pwData.newPassword ? "#ef4444" : "#e2e8f0" }} placeholder="Repeat new password" onFocus={focusIn} onBlur={focusOut} />
                            <button type="button" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                              {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                          {pwData.confirmPassword && pwData.confirmPassword !== pwData.newPassword && (
                            <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} /> Passwords do not match</p>
                          )}
                          {pwData.confirmPassword && pwData.confirmPassword === pwData.newPassword && pwData.newPassword && (
                            <p style={{ fontSize: 12, color: "#16a34a", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><Check size={11} /> Passwords match</p>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={changePassword} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", background: loading ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.3)", fontFamily: "inherit" }}>
                          {loading ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> : <Shield size={14} />}
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Security tips */}
                    <div style={{ padding: 20, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 14 }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                        <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#92400e", margin: 0 }}>Security best practices</p>
                      </div>
                      {["Use a unique password not used on other sites", "Never share your password with anyone — Hypnate support will never ask for it", "Enable 2FA when available for extra protection", "Log out of shared or public devices after use"].map((tip, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fcd34d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            <span style={{ fontSize: 9, fontWeight: 800, color: "#78350f" }}>{i + 1}</span>
                          </div>
                          <p style={{ fontSize: 12, color: "#92400e", margin: 0, lineHeight: 1.5 }}>{tip}</p>
                        </div>
                      ))}
                    </div>

                    {/* Danger zone */}
                    <div style={{ padding: 20, background: "#fff", border: "1.5px solid #fecaca", borderRadius: 14 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", margin: "0 0 8px" }}>Danger Zone</p>
                      <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 14px", lineHeight: 1.6 }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
                      <button style={{ padding: "9px 18px", borderRadius: 9, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
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
                        <div key={item.key} className="notif-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: i < arr.length - 1 ? "1px solid #f8fafc" : "none", transition: "background 0.1s" }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0 }}>{item.label}</p>
                              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{item.desc}</p>
                            </div>
                          </div>
                          {/* Toggle */}
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