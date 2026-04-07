import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, X, ChevronRight, Building2, Upload, CreditCard,
  Share2, MessageCircle, Instagram, Facebook, Send,
  Loader2, Sparkles, Bot, Lock, AlertCircle,
  Eye, EyeOff, ExternalLink, Truck, ArrowRight,
  SkipForward, CheckCircle2, XCircle, Wand2,
} from "lucide-react";
import { cn } from "../lib/utils";
import api from "../lib/api";

type Step = 1 | 2 | 3 | 4 | 5;
type Gateway = "razorpay" | "payu" | "cashfree" | "skydo" | "cod" | null;
type ModalType = "whatsapp" | "instagram" | "facebook" | "telegram" | null;

interface BusinessForm { businessName: string; industry: string; size: string; mobileNo: string; gstNumber: string; }
interface PaymentForm { gateway: Gateway; keyId: string; keySecret: string; merchantId: string; salt: string; }
interface ChannelData {
  whatsapp: { connected: boolean; phone: string; apiKey: string };
  instagram: { connected: boolean }; facebook: { connected: boolean };
  telegram: { connected: boolean; botToken: string };
}

const GATEWAYS = [
  { id: "razorpay" as Gateway, name: "Razorpay", logo: "R", gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)", tagline: "Most popular in India", fees: "2% per transaction", setupUrl: "https://dashboard.razorpay.com/app/keys", setupSteps: ["Go to razorpay.com and create a free account", "Complete KYC verification (takes ~2 days)", "Go to Settings → API Keys → Generate Key", "Copy both Key ID and Key Secret below"], fields: [{ key: "keyId", label: "Key ID", placeholder: "rzp_live_... or rzp_test_...", mono: true, secret: false }, { key: "keySecret", label: "Key Secret", placeholder: "••••••••••••••••", mono: true, secret: true }] },
  { id: "payu" as Gateway, name: "PayU", logo: "P", gradient: "linear-gradient(135deg,#f97316,#ea580c)", tagline: "Trusted by 5M+ businesses", fees: "1.99% per transaction", setupUrl: "https://onboarding.payu.in", setupSteps: ["Go to payu.in and create a merchant account", "Complete your business verification", "Go to Dashboard → My Account → Merchant Key", "Copy your Merchant Key and Salt below"], fields: [{ key: "merchantId", label: "Merchant Key", placeholder: "Your PayU Merchant Key", mono: true, secret: false }, { key: "salt", label: "Salt", placeholder: "Your PayU Salt", mono: true, secret: true }] },
  { id: "cashfree" as Gateway, name: "Cashfree", logo: "C", gradient: "linear-gradient(135deg,#16a34a,#15803d)", tagline: "Lowest fees, fast settlements", fees: "1.75% per transaction", setupUrl: "https://merchant.cashfree.com", setupSteps: ["Go to cashfree.com and sign up as a merchant", "Verify your business details and bank account", "Go to Developers → API Keys in your dashboard", "Copy the App ID and Secret Key below"], fields: [{ key: "keyId", label: "App ID", placeholder: "Your Cashfree App ID", mono: true, secret: false }, { key: "keySecret", label: "Secret Key", placeholder: "••••••••••••••••", mono: true, secret: true }] },
  { id: "skydo" as Gateway, name: "Skydo", logo: "S", gradient: "linear-gradient(135deg,#7c3aed,#5b21b6)", tagline: "Best for international payments", fees: "1.99% + forex savings", setupUrl: "https://skydo.com", setupSteps: ["Go to skydo.com and create a business account", "Complete KYC and bank account linking", "Go to API Settings in your Skydo dashboard", "Copy your API Key and Secret below"], fields: [{ key: "keyId", label: "API Key", placeholder: "Your Skydo API Key", mono: true, secret: false }, { key: "keySecret", label: "API Secret", placeholder: "••••••••••••••••", mono: true, secret: true }] },
  { id: "cod" as Gateway, name: "Cash on Delivery", logo: "₹", gradient: "linear-gradient(135deg,#64748b,#475569)", tagline: "No setup needed", fees: "Free — collect at delivery", setupUrl: null, setupSteps: [], fields: [] },
];

const STEPS_CONFIG = [
  { id: 1, title: "Business Info", icon: Building2 },
  { id: 2, title: "Catalog", icon: Upload },
  { id: 3, title: "Payments", icon: CreditCard },
  { id: 4, title: "Channels", icon: Share2 },
  { id: 5, title: "AI Setup", icon: Sparkles },
];

const STEP_LABELS: Record<number, string> = { 1: "Business Information", 2: "Product Catalog", 3: "Payment Setup", 4: "Sales Channels" };

const CHANNEL_CFG = {
  whatsapp: { name: "WhatsApp", desc: "Automate order messages", icon: MessageCircle, gradient: "linear-gradient(135deg,#16a34a,#15803d)", glow: "rgba(22,163,74,0.2)", badge: "Most popular" },
  instagram: { name: "Instagram", desc: "DM automation & replies", icon: Instagram, gradient: "linear-gradient(135deg,#db2777,#9333ea)", glow: "rgba(219,39,119,0.2)", badge: "High engagement" },
  facebook: { name: "Facebook", desc: "Messenger automation", icon: Facebook, gradient: "linear-gradient(135deg,#2563eb,#1d4ed8)", glow: "rgba(37,99,235,0.2)", badge: null },
  telegram: { name: "Telegram", desc: "Bot-powered selling", icon: Send, gradient: "linear-gradient(135deg,#0284c7,#0369a1)", glow: "rgba(2,132,199,0.2)", badge: "Fast setup" },
};

/* ── FIELD ── */
const Field = ({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) => (
  <div>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
      {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      {hint && <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: 12, marginLeft: 4 }}>{hint}</span>}
    </label>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 16px", borderRadius: 12,
  border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a",
  outline: "none", background: "#fff", boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s", fontFamily: "inherit",
};

const selectStyle: React.CSSProperties = { ...inputStyle, background: "#fff", cursor: "pointer", appearance: "none" as any };

/* ── STEPPER ── */
const Stepper = ({ current, completed, skipped }: { current: Step; completed: Set<number>; skipped: Set<number> }) => (
  <div style={{ background: "#fff", borderRadius: 18, padding: "20px 32px", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", marginBottom: 20 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
      {/* Track */}
      <div style={{ position: "absolute", top: 16, left: "9%", right: "9%", height: 2, background: "#f1f5f9", zIndex: 0 }} />
      <div style={{ position: "absolute", top: 16, left: "9%", height: 2, background: "linear-gradient(90deg,#0d9488,#34d399)", zIndex: 0, transition: "width 0.5s ease", width: `${Math.max(0, ((current - 1) / 4) * 82)}%` }} />
      {STEPS_CONFIG.map((step) => {
        const done = completed.has(step.id), skip = skipped.has(step.id), active = current === step.id;
        const Icon = step.icon;
        return (
          <div key={step.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1, flex: 1 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: done ? "linear-gradient(135deg,#0d9488,#34d399)" : skip ? "#fee2e2" : active ? "#f0fdfa" : "#f8fafc",
              border: `2px solid ${done ? "#0d9488" : skip ? "#fca5a5" : active ? "#0d9488" : "#e2e8f0"}`,
              boxShadow: active ? "0 0 0 4px rgba(13,148,136,0.12)" : "none",
              transition: "all 0.3s",
            }}>
              {done ? <Check size={14} color="#fff" strokeWidth={2.5} /> : skip ? <X size={13} color="#ef4444" /> : <Icon size={14} color={active ? "#0d9488" : "#94a3b8"} />}
            </div>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : done ? 600 : 400, color: done ? "#0d9488" : skip ? "#ef4444" : active ? "#0f172a" : "#94a3b8", whiteSpace: "nowrap" }}>
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

/* ── FOOTER ── */
const Footer = ({ onBack, onSkip, onNext, loading, showBack, showSkip }: any) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      {showBack && <button onClick={onBack} style={{ fontSize: 14, fontWeight: 500, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: "8px 4px", fontFamily: "inherit" }}>← Back</button>}
      {showSkip && <button onClick={onSkip} style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}><SkipForward size={13} /> Skip for now</button>}
    </div>
    <button onClick={onNext} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", background: loading ? "#94a3b8" : "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 16px rgba(13,148,136,0.3)", transition: "all 0.2s", fontFamily: "inherit" }}>
      {loading ? <><Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} /> Saving…</> : <>Next Step <ChevronRight size={16} /></>}
    </button>
  </div>
);

/* ── STEP 1: BUSINESS ── */
const BusinessStep = ({ form, onChange, error, onClear }: any) => {
  const set = (k: keyof BusinessForm) => (e: any) => onChange({ ...form, [k]: e.target.value });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Hero */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#0d9488,#34d399)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 24px rgba(13,148,136,0.25)" }}>
          <Building2 size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.3px" }}>Tell us about your business</h2>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>We personalise your store experience based on your details.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12 }}>
          <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: "#dc2626", margin: 0, flex: 1 }}>{error}</p>
          <button onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", color: "#fca5a5" }}><X size={14} /></button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Business Name" required>
            <input value={form.businessName} onChange={set("businessName")} style={inputStyle} placeholder="e.g. Rahul Fashion House"
              onFocus={e => { e.target.style.borderColor = "#0d9488"; e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
          </Field>
        </div>
        <Field label="Industry" required>
          <div style={{ position: "relative" }}>
            <select value={form.industry} onChange={set("industry")} style={selectStyle}
              onFocus={e => { e.target.style.borderColor = "#0d9488"; e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}>
              {[["retail", "Retail"], ["food", "Food & Beverage"], ["fashion", "Fashion"], ["electronics", "Electronics"], ["beauty", "Beauty & Wellness"], ["furniture", "Furniture & Home"], ["services", "Services"], ["other", "Other"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronRight size={14} color="#94a3b8" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none" }} />
          </div>
        </Field>
        <Field label="Business Size" required>
          <div style={{ position: "relative" }}>
            <select value={form.size} onChange={set("size")} style={selectStyle}
              onFocus={e => { e.target.style.borderColor = "#0d9488"; e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}>
              {[["1-10", "1–10 employees"], ["11-50", "11–50 employees"], ["51-200", "51–200 employees"], ["200+", "200+ employees"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronRight size={14} color="#94a3b8" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none" }} />
          </div>
        </Field>
        <Field label="Mobile Number" required>
          <input value={form.mobileNo} onChange={set("mobileNo")} style={inputStyle} placeholder="+91 98765 43210"
            onFocus={e => { e.target.style.borderColor = "#0d9488"; e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
        </Field>
        <Field label="GST Number" hint="(optional)">
          <input value={form.gstNumber} onChange={set("gstNumber")} style={{ ...inputStyle, fontFamily: "monospace", textTransform: "uppercase" }} placeholder="27AAPFU0939F1ZV" maxLength={15}
            onFocus={e => { e.target.style.borderColor = "#0d9488"; e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
        </Field>
      </div>
    </div>
  );
};

/* ── STEP 2: CATALOG ── */
const CatalogStep = ({ fileName, onFile, onClear, error, onErrorClear }: any) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File) => onFile(f.name, f);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 24px rgba(99,102,241,0.25)" }}>
          <Upload size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.3px" }}>Add your products</h2>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Upload any file — our AI converts it automatically.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12 }}>
          <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: "#dc2626", margin: 0, flex: 1 }}>{error}</p>
          <button onClick={onErrorClear} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="#fca5a5" /></button>
        </div>
      )}

      {!fileName ? (
        <>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            style={{
              border: `2px dashed ${dragging ? "#6366f1" : "#e2e8f0"}`,
              borderRadius: 20, padding: "52px 24px", textAlign: "center", cursor: "pointer",
              background: dragging ? "#f5f3ff" : "#f8fafc",
              transition: "all 0.2s",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Subtle grid bg */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)", backgroundSize: "24px 24px", opacity: 0.5 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: dragging ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#fff", boxShadow: dragging ? "0 12px 32px rgba(99,102,241,0.3)" : "0 4px 16px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", transition: "all 0.2s" }}>
                <Upload size={26} color={dragging ? "#fff" : "#94a3b8"} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 18, color: "#0f172a", margin: "0 0 6px" }}>
                {dragging ? "Drop it!" : "Drop your catalog here"}
              </p>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 20px" }}>or click to browse files</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                {[".csv", ".xlsx", ".xls", ".pdf", ".docx", ".txt"].map(ext => (
                  <span key={ext} style={{ padding: "4px 10px", background: "#fff", color: "#64748b", fontSize: 11, borderRadius: 7, fontWeight: 700, fontFamily: "monospace", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>{ext}</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12 }}>AI auto-converts any format · Max 500 products</p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.txt" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          {/* AI card */}
          <div style={{ display: "flex", gap: 14, padding: 18, background: "linear-gradient(135deg,#eff6ff,#f5f3ff)", border: "1px solid #c7d2fe", borderRadius: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
              <Wand2 size={18} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#3730a3", margin: "0 0 3px" }}>AI-powered catalog conversion</p>
              <p style={{ fontSize: 12, color: "#6366f1", margin: 0, lineHeight: 1.6 }}>Upload a PDF price list, Excel sheet, or Word doc — our AI extracts and structures all your products automatically.</p>
            </div>
          </div>

          <button onClick={() => {
            const csv = `name,price,description,category,stock\nSample Product,499,A great product,Retail,100`;
            const blob = new Blob([csv], { type: "text/csv" });
            const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "sample_catalog.csv"; a.click();
          }} style={{ display: "flex", alignItems: "center", gap: 6, color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, fontFamily: "inherit" }}>
            <ExternalLink size={13} /> Download sample CSV template
          </button>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 18, background: "linear-gradient(135deg,#f0fdfa,#ecfdf5)", border: "2px solid #6ee7b7", borderRadius: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#0d9488,#34d399)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(13,148,136,0.3)" }}>
              <Check size={22} color="#fff" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, color: "#065f46", margin: "0 0 2px", fontSize: 14 }}>File ready for import</p>
              <p style={{ fontSize: 12, color: "#0d9488", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</p>
            </div>
            <button onClick={onClear} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 12, fontWeight: 500 }}>
              <X size={13} /> Remove
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, padding: 14, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, alignItems: "center" }}>
            <Bot size={16} color="#0d9488" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: "#166534", margin: 0 }}>Hypnate AI will process this file and structure your products after setup completes.</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── STEP 3: PAYMENTS ── */
const PaymentsStep = ({ form, onChange, error, onClear }: any) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const selectedGw = GATEWAYS.find(g => g.id === form.gateway);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 24px rgba(245,158,11,0.25)" }}>
          <CreditCard size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.3px" }}>Setup Payments</h2>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Choose how you want to accept payments from customers.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12 }}>
          <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: "#dc2626", margin: 0, flex: 1 }}>{error}</p>
          <button onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="#fca5a5" /></button>
        </div>
      )}

      {!form.gateway ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {GATEWAYS.map(gw => (
            <button key={String(gw.id)} onClick={() => onChange({ gateway: gw.id, keyId: "", keySecret: "", merchantId: "", salt: "" })}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, border: "1.5px solid #f1f5f9", background: "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", fontFamily: "inherit" }}
              onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = "#0d9488"; b.style.boxShadow = "0 8px 24px rgba(13,148,136,0.12)"; b.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = "#f1f5f9"; b.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; b.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: gw.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                {gw.logo}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, margin: "0 0 2px" }}>{gw.name}</p>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 2px" }}>{gw.tagline}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", margin: 0 }}>{gw.fees}</p>
              </div>
              <ArrowRight size={14} color="#cbd5e1" style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button onClick={() => onChange({ gateway: null, keyId: "", keySecret: "", merchantId: "", salt: "" })} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 500 }}>← Change payment method</button>

          {/* Selected gateway header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, background: "linear-gradient(135deg,#f0fdfa,#ecfdf5)", border: "2px solid #6ee7b7" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: selectedGw!.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#fff", flexShrink: 0, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
              {selectedGw!.logo}
            </div>
            <div>
              <p style={{ fontWeight: 800, color: "#0f172a", fontSize: 15, margin: "0 0 2px" }}>{selectedGw!.name}</p>
              <p style={{ fontSize: 12, color: "#0d9488", margin: 0 }}>{selectedGw!.fees}</p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "6px 12px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
              <Check size={12} /> Selected
            </div>
          </div>

          {form.gateway === "cod" ? (
            <div style={{ display: "flex", gap: 14, padding: 18, background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)", border: "1.5px solid #bbf7d0", borderRadius: 16, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#16a34a,#15803d)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }}>
                <Truck size={20} color="#fff" />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: "#166534", margin: "0 0 4px", fontSize: 14 }}>Cash on Delivery enabled</p>
                <p style={{ fontSize: 13, color: "#16a34a", margin: 0, lineHeight: 1.6 }}>Customers pay when they receive their order. No gateway or technical setup required.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Guide */}
              <div style={{ background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: 14, overflow: "hidden" }}>
                <button onClick={() => setShowGuide(s => !s)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>How to get your {selectedGw!.name} API keys</span>
                  <ChevronRight size={14} color="#d97706" style={{ transform: showGuide ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {showGuide && (
                  <div style={{ padding: "0 16px 16px" }}>
                    {selectedGw!.setupSteps.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fcd34d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#78350f" }}>{i + 1}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.5 }}>{step}</p>
                      </div>
                    ))}
                    {selectedGw!.setupUrl && (
                      <a href={selectedGw!.setupUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0d9488", textDecoration: "none", marginTop: 4 }}>
                        Open {selectedGw!.name} dashboard <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Security */}
              <div style={{ display: "flex", gap: 10, padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, alignItems: "center" }}>
                <Lock size={14} color="#64748b" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Your keys are encrypted before storage. We never expose them in plain text.</p>
              </div>

              {/* Fields */}
              {selectedGw!.fields.map(field => (
                <Field key={field.key} label={field.label}>
                  <div style={{ position: "relative" }}>
                    <input
                      type={field.secret && !showSecret[field.key] ? "password" : "text"}
                      value={(form as any)[field.key]}
                      onChange={e => onChange({ ...form, [field.key]: e.target.value })}
                      style={{ ...inputStyle, fontFamily: field.mono ? "monospace" : "inherit", paddingRight: field.secret ? 44 : 16 }}
                      placeholder={field.placeholder}
                      onFocus={e => { e.target.style.borderColor = "#0d9488"; e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.1)"; }}
                      onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                    />
                    {field.secret && (
                      <button type="button" onClick={() => setShowSecret(s => ({ ...s, [field.key]: !s[field.key] }))} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                        {showSecret[field.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                </Field>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── STEP 4: CHANNELS ── */
const ChannelCard = ({ channelKey, cfg, connected, onClick }: { channelKey: string; cfg: any; connected: boolean; onClick: () => void }) => {
  const Icon = cfg.icon;
  return (
    <button onClick={onClick} style={{
      padding: "20px 16px 16px", borderRadius: 18,
      border: `1.5px solid ${connected ? "transparent" : "#f1f5f9"}`,
      background: connected ? cfg.gradient : "#fff",
      cursor: connected ? "default" : "pointer", transition: "all 0.25s",
      position: "relative", textAlign: "center",
      boxShadow: connected ? `0 8px 24px ${cfg.glow}` : "0 2px 8px rgba(0,0,0,0.04)",
      fontFamily: "inherit",
    }}
      onMouseEnter={e => { if (!connected) { const b = e.currentTarget; b.style.borderColor = "#0d9488"; b.style.boxShadow = "0 8px 24px rgba(13,148,136,0.1)"; b.style.transform = "translateY(-3px)"; } }}
      onMouseLeave={e => { if (!connected) { const b = e.currentTarget; b.style.borderColor = "#f1f5f9"; b.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; b.style.transform = "translateY(0)"; } }}
    >
      {/* Badge */}
      {cfg.badge && !connected && (
        <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#0d9488,#34d399)", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {cfg.badge}
        </div>
      )}

      {/* Connected check */}
      {connected && (
        <div style={{ position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={13} color="#fff" strokeWidth={2.5} />
        </div>
      )}

      <div style={{ width: 52, height: 52, borderRadius: 16, background: connected ? "rgba(255,255,255,0.2)" : cfg.gradient, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: connected ? "none" : `0 6px 20px ${cfg.glow}`, transition: "all 0.2s" }}>
        <Icon size={24} color="#fff" />
      </div>
      <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 4px", color: connected ? "#fff" : "#0f172a" }}>{cfg.name}</p>
      <p style={{ fontSize: 12, margin: 0, color: connected ? "rgba(255,255,255,0.8)" : "#94a3b8", fontWeight: connected ? 600 : 400 }}>
        {connected ? "Connected ✓" : cfg.desc}
      </p>
    </button>
  );
};

/* ── CHANNEL MODAL ── */
const ChannelModal = ({ type, onClose, onConnect }: { type: ModalType; onClose: () => void; onConnect: (type: string, data: any) => void }) => {
  const [phone, setPhone] = useState(""); const [apiKey, setApiKey] = useState(""); const [botToken, setBotToken] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  if (!type) return null;
  const cfg = CHANNEL_CFG[type as keyof typeof CHANNEL_CFG];
  const handleConnect = async () => {
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    try {
      if (type === "whatsapp") { if (!phone || !apiKey) { setError("Phone and API key are required"); setLoading(false); return; } onConnect("whatsapp", { phone, apiKey }); }
      else if (type === "telegram") { if (!botToken || !botToken.includes(":")) { setError("Invalid bot token format"); setLoading(false); return; } onConnect("telegram", { botToken }); }
      else { onConnect(type, { mock: true }); }
      onClose();
    } finally { setLoading(false); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: cfg.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 18px ${cfg.glow}`, flexShrink: 0 }}>
            <cfg.icon size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>Connect {cfg.name}</h3>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{cfg.desc}</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: "#f8fafc", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} color="#64748b" />
          </button>
        </div>

        {error && (
          <div style={{ display: "flex", gap: 8, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, marginBottom: 16 }}>
            <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{error}</p>
          </div>
        )}

        {type === "whatsapp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: 14, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, fontSize: 13, color: "#166534", lineHeight: 1.6 }}>
              You need a Facebook Business Manager account and a number not registered on WhatsApp personal.
            </div>
            <Field label="Phone Number" required>
              <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="+91 98765 43210"
                onFocus={e => { e.target.style.borderColor = "#16a34a"; e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
            </Field>
            <Field label="WhatsApp Business API Key" required>
              <input value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ ...inputStyle, fontFamily: "monospace" }} placeholder="EAAG..."
                onFocus={e => { e.target.style.borderColor = "#16a34a"; e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Found in your Meta Developer Portal.</p>
            </Field>
          </div>
        )}
        {type === "telegram" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: 14, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, fontSize: 13, color: "#0c4a6e", lineHeight: 1.6 }}>
              Message <strong>@BotFather</strong> on Telegram, type <code>/newbot</code>, follow the steps, and paste your token below.
            </div>
            <Field label="Bot Token" required>
              <input value={botToken} onChange={e => setBotToken(e.target.value)} style={{ ...inputStyle, fontFamily: "monospace" }} placeholder="123456:ABC-DEF1234..."
                onFocus={e => { e.target.style.borderColor = "#0284c7"; e.target.style.boxShadow = "0 0 0 3px rgba(2,132,199,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
            </Field>
          </div>
        )}
        {(type === "instagram" || type === "facebook") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: 14, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, fontSize: 13, color: "#1e3a8a", lineHeight: 1.6 }}>
              We need permission to manage your Pages and read messages to automate replies.
            </div>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>You will be redirected to {type === "instagram" ? "Instagram" : "Facebook"} to authorize Hypnate.</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 16px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleConnect} disabled={loading} style={{ flex: 2, padding: "11px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", background: cfg.gradient, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 16px ${cfg.glow}`, fontFamily: "inherit" }}>
            {loading ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> : null}
            {type === "instagram" || type === "facebook" ? `Continue with ${type === "instagram" ? "Instagram" : "Facebook"}` : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── STEP 5: AI SETUP ── */
const SummaryStep = ({ completed, skipped, autoProgress, autoTasks }: any) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "8px 0 16px", gap: 28 }}>
    <div style={{ position: "relative" }}>
      <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#f0fdfa,#ccfbf1)", border: "2px solid #6ee7b7", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, boxShadow: "0 0 0 12px rgba(13,148,136,0.06)" }}>
        <Bot size={42} color="#0d9488" style={{ animation: "bob 2s ease infinite" }} />
      </div>
      <div style={{ position: "absolute", inset: -12, borderRadius: "50%", border: "2px dashed #0d9488", opacity: 0.2, animation: "rotateSlow 8s linear infinite" }} />
    </div>

    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.4px" }}>Setting up your store</h2>
      <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>Hypnate AI is configuring your workspace...</p>
    </div>

    {/* Progress */}
    <div style={{ width: "100%", maxWidth: 480 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Progress</span>
        <span style={{ fontSize: 12, color: "#0d9488", fontWeight: 700 }}>{autoProgress}%</span>
      </div>
      <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: "100%", width: `${autoProgress}%`, background: "linear-gradient(90deg,#0d9488,#34d399)", borderRadius: 4, transition: "width 0.3s ease", boxShadow: "0 0 8px rgba(13,148,136,0.4)" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
        {autoTasks.map((task: any, i: number) => (
          <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: task.done ? "#f0fdf4" : i === autoTasks.findIndex((t: any) => !t.done) ? "#f0fdfa" : "#f8fafc", borderRadius: 12, border: `1px solid ${task.done ? "#bbf7d0" : "#f1f5f9"}`, transition: "all 0.3s" }}>
            {task.done
              ? <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#16a34a,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}><Check size={12} color="#fff" strokeWidth={2.5} /></div>
              : i === autoTasks.findIndex((t: any) => !t.done)
                ? <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Loader2 size={13} color="#fff" style={{ animation: "spin 0.7s linear infinite" }} /></div>
                : <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f1f5f9", flexShrink: 0 }} />
            }
            <span style={{ fontSize: 13, fontWeight: task.done ? 400 : 600, color: task.done ? "#94a3b8" : "#0f172a", textDecoration: task.done ? "line-through" : "none" }}>{task.label}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Summary */}
    <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 18, padding: "18px 20px", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px", textAlign: "left" }}>Setup Summary</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[1, 2, 3, 4].map(step => {
          const isCompleted = completed.has(step), isSkipped = skipped.has(step);
          return (
            <div key={step} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: isCompleted ? "#f0fdf4" : isSkipped ? "#fef2f2" : "#f8fafc", borderRadius: 12, border: `1px solid ${isCompleted ? "#bbf7d0" : isSkipped ? "#fecaca" : "#f1f5f9"}` }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{STEP_LABELS[step]}</span>
              {isCompleted
                ? <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "3px 10px", borderRadius: 20 }}><CheckCircle2 size={11} /> Done</span>
                : isSkipped
                  ? <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#dc2626", background: "#fee2e2", padding: "3px 10px", borderRadius: 20 }}><XCircle size={11} /> Skipped</span>
                  : <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

/* ── SKIP POPUP ── */
const SkipConfirmPopup = ({ skippedSteps, onContinue, onComplete }: any) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div style={{ background: "#fff", borderRadius: 24, padding: 36, maxWidth: 460, width: "100%", boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#fff7ed,#fef3c7)", border: "2px solid #fcd34d", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <AlertCircle size={26} color="#f97316" />
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", textAlign: "center", margin: "0 0 10px", letterSpacing: "-0.3px" }}>You're almost there!</h3>
      <p style={{ fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 1.7, margin: "0 0 14px" }}>Some steps were skipped during setup:</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 18 }}>
        {skippedSteps.map((s: number) => <span key={s} style={{ background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, border: "1px solid #fecaca" }}>{STEP_LABELS[s]}</span>)}
      </div>
      <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", margin: "0 0 24px", lineHeight: 1.7 }}>Complete them now for the best experience, or go to the dashboard and finish later.</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onContinue} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Go to Dashboard</button>
        <button onClick={onComplete} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(13,148,136,0.3)" }}>Complete Setup</button>
      </div>
    </div>
  </div>
);

/* ── MAIN ── */
export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSkipPopup, setShowSkipPopup] = useState(false);
  const [businessForm, setBusinessForm] = useState<BusinessForm>({ businessName: "", industry: "retail", size: "1-10", mobileNo: "", gstNumber: "" });
  const [catalogFile, setCatalogFile] = useState<File | null>(null);
  const [catalogName, setCatalogName] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({ gateway: null, keyId: "", keySecret: "", merchantId: "", salt: "" });
  const [channels, setChannels] = useState<ChannelData>({ whatsapp: { connected: false, phone: "", apiKey: "" }, instagram: { connected: false }, facebook: { connected: false }, telegram: { connected: false, botToken: "" } });
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [autoProgress, setAutoProgress] = useState(0);
  const [autoTasks, setAutoTasks] = useState([
    { id: 1, label: "Syncing Product Catalog...", done: false },
    { id: 2, label: "Configuring AI Chatbots...", done: false },
    { id: 3, label: "Verifying Payment Keys...", done: false },
    { id: 4, label: "Generating Store Links...", done: false },
  ]);

  useEffect(() => {
    if (currentStep !== 5) return;
    const prog = setInterval(() => setAutoProgress(p => { if (p >= 100) { clearInterval(prog); return 100; } return p + 1; }), 50);
    const tasks = setInterval(() => setAutoTasks(prev => { const i = prev.findIndex(t => !t.done); if (i === -1) { clearInterval(tasks); return prev; } const next = [...prev]; next[i] = { ...next[i], done: true }; return next; }), 1200);
    return () => { clearInterval(prog); clearInterval(tasks); };
  }, [currentStep]);

  const markCompleted = (step: number) => { setCompleted(s => new Set(s).add(step)); setSkipped(s => { const n = new Set(s); n.delete(step); return n; }); };
  const markSkipped = (step: number) => { setSkipped(s => new Set(s).add(step)); setCompleted(s => { const n = new Set(s); n.delete(step); return n; }); };

  const handleNext = async () => {
    setError(""); setLoading(true);
    try {
      if (currentStep === 1) {
        if (!businessForm.businessName.trim()) { setError("Business name is required"); return; }
        if (!businessForm.mobileNo.trim()) { setError("Mobile number is required"); return; }
        await api.post("/api/onboarding/business", { ...businessForm, phone: businessForm.mobileNo });
        markCompleted(1); setCurrentStep(2);
      } else if (currentStep === 2) {
        if (catalogFile) { const fd = new FormData(); fd.append("file", catalogFile); await api.post("/api/onboarding/catalog-file", fd, { headers: { "Content-Type": "multipart/form-data" } }); }
        markCompleted(2); setCurrentStep(3);
      } else if (currentStep === 3) {
        if (paymentForm.gateway && paymentForm.gateway !== "cod") {
          const payload: any = { gateway: paymentForm.gateway };
          if (paymentForm.keyId) payload.keyId = paymentForm.keyId;
          if (paymentForm.keySecret) payload.keySecret = paymentForm.keySecret;
          if (paymentForm.merchantId) payload.merchantId = paymentForm.merchantId;
          if (paymentForm.salt) payload.salt = paymentForm.salt;
          if (paymentForm.keyId || paymentForm.merchantId) await api.post("/api/onboarding/payments", payload);
        } else if (paymentForm.gateway === "cod") {
          await api.post("/api/onboarding/payments", { gateway: "cod" });
        }
        markCompleted(3); setCurrentStep(4);
      } else if (currentStep === 4) {
        const connected: any = {};
        if (channels.whatsapp.connected) connected.whatsapp = { phone: channels.whatsapp.phone, apiKey: channels.whatsapp.apiKey };
        if (channels.telegram.connected) connected.telegram = { botToken: channels.telegram.botToken };
        if (channels.instagram.connected) connected.instagram = {};
        if (channels.facebook.connected) connected.facebook = {};
        if (Object.keys(connected).length > 0) await api.post("/api/onboarding/channels", { channels: connected });
        markCompleted(4); setCurrentStep(5);
      } else if (currentStep === 5) {
        if (skipped.size > 0) { setShowSkipPopup(true); return; }
        await api.post("/api/onboarding/complete");
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const handleSkip = () => { markSkipped(currentStep); setCurrentStep(c => (Math.min(c + 1, 5)) as Step); };
  const handlePopupContinue = async () => { setShowSkipPopup(false); await api.post("/api/onboarding/complete"); navigate("/dashboard"); };
  const handlePopupComplete = () => { setShowSkipPopup(false); const first = [1, 2, 3, 4].find(s => skipped.has(s)); if (first) setCurrentStep(first as Step); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .ob-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes rotateSlow { to{transform:rotate(360deg)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="ob-root" style={{ background: "linear-gradient(160deg,#f0fdfa 0%,#f8fafc 40%,#f5f3ff 100%)", minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "32px 24px 56px" }}>
          <div style={{ width: "100%", maxWidth: 720, animation: "fadeUp 0.4s ease both" }}>

            {/* Page header */}
            <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.5px" }}>Store Setup</h1>
                <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>Complete all steps to launch your Hypnate store</p>
              </div>
              <div style={{ padding: "6px 14px", background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.2)", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#0d9488" }}>
                Step {currentStep} of 5
              </div>
            </div>

            <Stepper current={currentStep} completed={completed} skipped={skipped} />

            {/* Card */}
            <div style={{ background: "#fff", borderRadius: 24, padding: "36px 40px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)" }}>
              {currentStep === 1 && <BusinessStep form={businessForm} onChange={setBusinessForm} error={error} onClear={() => setError("")} />}
              {currentStep === 2 && <CatalogStep fileName={catalogName} onFile={(name: string, file: File) => { setCatalogName(name); setCatalogFile(file); }} onClear={() => { setCatalogName(null); setCatalogFile(null); }} error={error} onErrorClear={() => setError("")} />}
              {currentStep === 3 && <PaymentsStep form={paymentForm} onChange={setPaymentForm} error={error} onClear={() => setError("")} />}
              {currentStep === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#ec4899,#db2777)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 24px rgba(236,72,153,0.25)" }}>
                      <Share2 size={24} color="#fff" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.3px" }}>Connect Channels</h2>
                      <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Link social accounts to automate selling and customer support.</p>
                    </div>
                  </div>
                  {error && <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12 }}><AlertCircle size={15} color="#ef4444" /><p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>{error}</p></div>}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {(Object.keys(CHANNEL_CFG) as (keyof typeof CHANNEL_CFG)[]).map(key => (
                      <ChannelCard key={key} channelKey={key} cfg={CHANNEL_CFG[key]} connected={channels[key].connected} onClick={() => !channels[key].connected && setActiveModal(key as ModalType)} />
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>This step is optional — you can connect channels later from Settings.</p>
                </div>
              )}
              {currentStep === 5 && <SummaryStep completed={completed} skipped={skipped} autoProgress={autoProgress} autoTasks={autoTasks} />}

              {currentStep < 5 ? (
                <Footer
                  onBack={currentStep > 1 ? () => setCurrentStep(c => (c - 1) as Step) : undefined}
                  onSkip={currentStep > 1 ? handleSkip : undefined}
                  onNext={handleNext} loading={loading}
                  showBack={currentStep > 1} showSkip={currentStep > 1}
                />
              ) : (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 32, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
                  <button onClick={handleNext} disabled={autoProgress < 100 || loading} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 48px", background: autoProgress < 100 ? "#cbd5e1" : "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", borderRadius: 16, fontWeight: 800, fontSize: 16, border: "none", cursor: autoProgress < 100 ? "not-allowed" : "pointer", transition: "all 0.3s", boxShadow: autoProgress >= 100 ? "0 8px 28px rgba(13,148,136,0.35)" : "none", fontFamily: "inherit", letterSpacing: "-0.2px" }}>
                    {loading ? <Loader2 size={18} style={{ animation: "spin 0.7s linear infinite" }} /> : autoProgress < 100 ? "Please wait..." : <><Sparkles size={18} /> Launch Dashboard</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ChannelModal type={activeModal} onClose={() => setActiveModal(null)} onConnect={(type, data) => setChannels(prev => ({ ...prev, [type]: { ...prev[type as keyof ChannelData], connected: true, ...data } }))} />
      {showSkipPopup && <SkipConfirmPopup skippedSteps={[1, 2, 3, 4].filter(s => skipped.has(s))} onContinue={handlePopupContinue} onComplete={handlePopupComplete} />}
    </>
  );
};