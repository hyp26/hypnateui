import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, X, ChevronRight, Building2, Upload, CreditCard,
  Share2, MessageCircle, Instagram, Facebook, Send,
  Loader2, Sparkles, Bot, Lock, AlertCircle,
  Eye, EyeOff, ExternalLink, Truck, ArrowRight,
  SkipForward, CheckCircle2, XCircle,
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
  { id: "razorpay" as Gateway, name: "Razorpay", logo: "R", color: "#3b82f6", tagline: "Most popular in India", fees: "2% per transaction", setupUrl: "https://dashboard.razorpay.com/app/keys", setupSteps: ["Go to razorpay.com and create a free account", "Complete KYC verification (takes ~2 days)", "Go to Settings → API Keys → Generate Key", "Copy both Key ID and Key Secret below"], fields: [{ key: "keyId", label: "Key ID", placeholder: "rzp_live_... or rzp_test_...", mono: true, secret: false }, { key: "keySecret", label: "Key Secret", placeholder: "••••••••••••••••", mono: true, secret: true }] },
  { id: "payu" as Gateway, name: "PayU", logo: "P", color: "#f97316", tagline: "Trusted by 5M+ businesses", fees: "1.99% per transaction", setupUrl: "https://onboarding.payu.in", setupSteps: ["Go to payu.in and create a merchant account", "Complete your business verification", "Go to Dashboard → My Account → Merchant Key", "Copy your Merchant Key and Salt below"], fields: [{ key: "merchantId", label: "Merchant Key", placeholder: "Your PayU Merchant Key", mono: true, secret: false }, { key: "salt", label: "Salt", placeholder: "Your PayU Salt", mono: true, secret: true }] },
  { id: "cashfree" as Gateway, name: "Cashfree", logo: "C", color: "#16a34a", tagline: "Lowest fees, fast settlements", fees: "1.75% per transaction", setupUrl: "https://merchant.cashfree.com", setupSteps: ["Go to cashfree.com and sign up as a merchant", "Verify your business details and bank account", "Go to Developers → API Keys in your dashboard", "Copy the App ID and Secret Key below"], fields: [{ key: "keyId", label: "App ID", placeholder: "Your Cashfree App ID", mono: true, secret: false }, { key: "keySecret", label: "Secret Key", placeholder: "••••••••••••••••", mono: true, secret: true }] },
  { id: "skydo" as Gateway, name: "Skydo", logo: "S", color: "#7c3aed", tagline: "Best for international payments", fees: "1.99% + forex savings", setupUrl: "https://skydo.com", setupSteps: ["Go to skydo.com and create a business account", "Complete KYC and bank account linking", "Go to API Settings in your Skydo dashboard", "Copy your API Key and Secret below"], fields: [{ key: "keyId", label: "API Key", placeholder: "Your Skydo API Key", mono: true, secret: false }, { key: "keySecret", label: "API Secret", placeholder: "••••••••••••••••", mono: true, secret: true }] },
  { id: "cod" as Gateway, name: "Cash on Delivery", logo: "₹", color: "#64748b", tagline: "No gateway needed", fees: "Free — collect cash at delivery", setupUrl: null, setupSteps: [], fields: [] },
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
  whatsapp: { name: "WhatsApp", desc: "Connect Business API", icon: MessageCircle, color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
  instagram: { name: "Instagram", desc: "Connect DM Automation", icon: Instagram, color: "#db2777", bg: "#fdf2f8", border: "#f9a8d4" },
  facebook: { name: "Facebook", desc: "Connect Messenger", icon: Facebook, color: "#2563eb", bg: "#eff6ff", border: "#93c5fd" },
  telegram: { name: "Telegram", desc: "Connect Bot", icon: Send, color: "#0284c7", bg: "#f0f9ff", border: "#7dd3fc" },
};

const ErrorBanner = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
    <p className="text-sm text-red-700 flex-1">{message}</p>
    <button onClick={onClose}><X className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
  </div>
);

const Stepper = ({ current, completed, skipped }: { current: Step; completed: Set<number>; skipped: Set<number> }) => (
  <div style={{ background: "#fff", borderRadius: 16, padding: "18px 28px", border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", marginBottom: 20 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
      <div style={{ position: "absolute", top: 16, left: "10%", right: "10%", height: 2, background: "#f1f5f9", zIndex: 0 }} />
      <div style={{ position: "absolute", top: 16, left: "10%", height: 2, background: "#0d9488", zIndex: 0, transition: "width 0.4s ease", width: `${Math.max(0, ((current - 1) / 4) * 80)}%` }} />
      {STEPS_CONFIG.map((step) => {
        const done = completed.has(step.id); const skip = skipped.has(step.id); const active = current === step.id; const Icon = step.icon;
        return (
          <div key={step.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 1, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? "#0d9488" : skip ? "#fef2f2" : active ? "#f0fdfa" : "#f8fafc", border: `2px solid ${done ? "#0d9488" : skip ? "#fca5a5" : active ? "#0d9488" : "#e2e8f0"}`, transition: "all 0.3s" }}>
              {done ? <Check size={14} color="#fff" /> : skip ? <X size={13} color="#ef4444" /> : <Icon size={14} color={active ? "#0d9488" : "#94a3b8"} />}
            </div>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: done ? "#0d9488" : skip ? "#ef4444" : active ? "#0f172a" : "#94a3b8", whiteSpace: "nowrap" }}>{step.title}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const SkipConfirmPopup = ({ skippedSteps, onContinue, onComplete }: { skippedSteps: number[]; onContinue: () => void; onComplete: () => void }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 460, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><AlertCircle size={26} color="#f97316" /></div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", textAlign: "center", margin: "0 0 10px" }}>You're almost there!</h3>
      <p style={{ fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 1.7, margin: "0 0 8px" }}>Some steps were skipped during setup:</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 16 }}>
        {skippedSteps.map(s => <span key={s} style={{ background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, border: "1px solid #fecaca" }}>{STEP_LABELS[s]}</span>)}
      </div>
      <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", margin: "0 0 24px" }}>Would you like to complete them now for the best experience, or continue to the dashboard and finish later?</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onContinue} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Continue to Dashboard</button>
        <button onClick={onComplete} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "none", background: "#0d9488", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Complete Setup</button>
      </div>
    </div>
  </div>
);

const Footer = ({ onBack, onSkip, onNext, loading, showBack, showSkip }: { onBack?: () => void; onSkip?: () => void; onNext: () => void; loading: boolean; showBack: boolean; showSkip: boolean; }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {showBack && <button onClick={onBack} style={{ fontSize: 14, fontWeight: 500, color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>← Back</button>}
      {showSkip && <button onClick={onSkip} style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}><SkipForward size={14} /> Skip for now</button>}
    </div>
    <button onClick={onNext} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", background: "#0d9488", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
      {loading ? <><Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} /> Saving…</> : <>Next Step <ChevronRight size={16} /></>}
    </button>
  </div>
);

const BusinessStep = ({ form, onChange, error, onClear }: { form: BusinessForm; onChange: (f: BusinessForm) => void; error: string; onClear: () => void }) => {
  const set = (k: keyof BusinessForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ ...form, [k]: e.target.value });
  return (
    <div className="space-y-5">
      <div><h2 className="text-2xl font-bold text-gray-900">Tell us about your business</h2><p className="text-gray-500 mt-1 text-sm">We need some basic details to personalise your store.</p></div>
      {error && <ErrorBanner message={error} onClose={onClear} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name <span className="text-red-500">*</span></label>
          <input value={form.businessName} onChange={set("businessName")} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors text-gray-900" placeholder="e.g. Rahul Fashion House…" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Industry <span className="text-red-500">*</span></label>
          <select value={form.industry} onChange={set("industry")} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none bg-white text-gray-900 transition-colors">
            {[["retail", "Retail"], ["food", "Food & Beverage"], ["fashion", "Fashion"], ["electronics", "Electronics"], ["beauty", "Beauty & Wellness"], ["furniture", "Furniture & Home"], ["services", "Services"], ["other", "Other"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Size <span className="text-red-500">*</span></label>
          <select value={form.size} onChange={set("size")} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none bg-white text-gray-900 transition-colors">
            {[["1-10", "1–10 employees"], ["11-50", "11–50 employees"], ["51-200", "51–200 employees"], ["200+", "200+ employees"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile No. <span className="text-red-500">*</span></label>
          <input value={form.mobileNo} onChange={set("mobileNo")} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none transition-colors" placeholder="+91 98XXX XXXXX" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST Number <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
          <input value={form.gstNumber} onChange={set("gstNumber")} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none font-mono uppercase tracking-wider transition-colors" placeholder="27AAPFU0939F1ZV" maxLength={15} />
        </div>
      </div>
    </div>
  );
};

const CatalogStep = ({ fileName, onFile, onClear, error, onErrorClear }: { fileName: string | null; onFile: (name: string, file: File) => void; onClear: () => void; error: string; onErrorClear: () => void; }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-5">
      <div><h2 className="text-2xl font-bold text-gray-900">Add your products</h2><p className="text-gray-500 mt-1 text-sm">Upload your catalog in any format — Hypnate AI will auto-convert it.</p></div>
      {error && <ErrorBanner message={error} onClose={onErrorClear} />}
      {!fileName ? (
        <>
          <div onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFile(f.name, f); }}
            style={{ border: "2px dashed #e2e8f0", borderRadius: 16, padding: "48px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "#f8fafc" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#0d9488"; (e.currentTarget as HTMLDivElement).style.background = "#f0fdfa"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Upload size={24} color="#94a3b8" /></div>
            <p style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", margin: "0 0 6px" }}>Drop your catalog here</p>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px" }}>or click to browse — any format accepted</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
              {[".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt"].map(ext => <span key={ext} style={{ padding: "3px 9px", background: "#f1f5f9", color: "#64748b", fontSize: 11, borderRadius: 6, fontWeight: 600, fontFamily: "monospace" }}>{ext}</span>)}
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12 }}>Hypnate AI converts any format automatically · Max 500 products</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.txt" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f.name, f); }} />
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8", margin: "0 0 4px" }}>✨ AI-powered catalog conversion</p>
            <p style={{ fontSize: 12, color: "#3b82f6", margin: 0 }}>Upload any file — PDF price list, Excel catalog, Word document — and our AI will extract and structure all your products automatically.</p>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: "#f0fdfa", border: "2px solid #0d9488", borderRadius: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Check size={22} color="#fff" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 2px", fontSize: 14 }}>File uploaded successfully</p>
              <p style={{ fontSize: 12, color: "#0d9488", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</p>
            </div>
            <button onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}><X size={14} /> Remove</button>
          </div>
          <div style={{ background: "#f0fdfa", border: "1px solid #ccfbf1", borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <Bot size={16} color="#0d9488" />
            <p style={{ fontSize: 13, color: "#0f172a", margin: 0 }}>Hypnate AI will process this file and extract your products after onboarding completes.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentsStep = ({ form, onChange, error, onClear }: { form: PaymentForm; onChange: (f: PaymentForm) => void; error: string; onClear: () => void }) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const selectedGw = GATEWAYS.find(g => g.id === form.gateway);
  return (
    <div className="space-y-5">
      <div><h2 className="text-2xl font-bold text-gray-900">Setup Payments</h2><p className="text-gray-500 mt-1 text-sm">Choose how you want to accept payments from customers.</p></div>
      {error && <ErrorBanner message={error} onClose={onClear} />}
      {!form.gateway ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GATEWAYS.map(gw => (
            <button key={String(gw.id)} onClick={() => onChange({ gateway: gw.id, keyId: "", keySecret: "", merchantId: "", salt: "" })} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all text-left group">
              <div style={{ width: 48, height: 48, borderRadius: 14, background: gw.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{gw.logo}</div>
              <div className="min-w-0 flex-1"><p className="font-bold text-gray-900">{gw.name}</p><p className="text-xs text-gray-500 mt-0.5">{gw.tagline}</p><p className="text-xs font-semibold mt-0.5" style={{ color: gw.color }}>{gw.fees}</p></div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <button onClick={() => onChange({ gateway: null, keyId: "", keySecret: "", merchantId: "", salt: "" })} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">← Change payment method</button>
          <div className="flex items-center gap-4 p-4 rounded-2xl border-2" style={{ borderColor: selectedGw!.color, background: selectedGw!.color + "10" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: selectedGw!.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{selectedGw!.logo}</div>
            <div><p className="font-bold text-gray-900">{selectedGw!.name}</p><p className="text-sm text-gray-600">{selectedGw!.fees}</p></div>
            <div className="ml-auto flex items-center gap-1.5 text-sm text-green-600 font-semibold bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg"><Check className="w-4 h-4" /> Selected</div>
          </div>
          {form.gateway === "cod" ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4"><Truck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" /><div><p className="font-bold text-green-800">Cash on Delivery enabled</p><p className="text-sm text-green-700 mt-1">Customers pay when they receive their order. No gateway setup needed.</p></div></div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <button onClick={() => setShowGuide(s => !s)} className="flex items-center justify-between w-full"><span className="text-sm font-semibold text-amber-800">How to get your {selectedGw!.name} API keys</span><ChevronRight className={cn("w-4 h-4 text-amber-600 transition-transform", showGuide && "rotate-90")} /></button>
                {showGuide && <ol className="mt-3 space-y-2">{selectedGw!.setupSteps.map((step, i) => <li key={i} className="flex items-start gap-2.5 text-sm text-amber-800"><span className="w-5 h-5 rounded-full bg-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>{step}</li>)}{selectedGw!.setupUrl && <li><a href={selectedGw!.setupUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline font-semibold mt-1">Open {selectedGw!.name} dashboard <ExternalLink className="w-3 h-3" /></a></li>}</ol>}
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2"><Lock className="w-4 h-4 text-slate-500 flex-shrink-0" /><p className="text-xs text-slate-600">Your keys are encrypted before storage. We never expose them.</p></div>
                {selectedGw!.fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                    <div className="relative">
                      <input type={field.secret && !showSecret[field.key] ? "password" : "text"} value={(form as any)[field.key]} onChange={e => onChange({ ...form, [field.key]: e.target.value })} className={cn("w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none transition-colors", field.mono && "font-mono", field.secret && "pr-12")} placeholder={field.placeholder} />
                      {field.secret && <button type="button" onClick={() => setShowSecret(s => ({ ...s, [field.key]: !s[field.key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showSecret[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ChannelModal = ({ type, onClose, onConnect }: { type: ModalType; onClose: () => void; onConnect: (type: string, data: any) => void }) => {
  const [phone, setPhone] = useState(""); const [apiKey, setApiKey] = useState(""); const [botToken, setBotToken] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  if (!type) return null;
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
  const COLORS: Record<string, string> = { whatsapp: "#16a34a", instagram: "#db2777", facebook: "#2563eb", telegram: "#0284c7" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 24, width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold text-gray-900 capitalize">Connect {type}</h3><button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4 text-gray-500" /></button></div>
        {error && <ErrorBanner message={error} onClose={() => setError("")} />}
        {type === "whatsapp" && <div className="space-y-4"><div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-xl">You need a Facebook Business Manager account and a number not on WhatsApp personal.</div><div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none" placeholder="+91 98XXX XXXXX" /></div><div><label className="block text-sm font-semibold text-gray-700 mb-1.5">API Key</label><input value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none font-mono" placeholder="EAAG..." /></div></div>}
        {type === "telegram" && <div className="space-y-4"><div className="bg-sky-50 border border-sky-200 text-sky-800 text-sm p-4 rounded-xl">Message @BotFather on Telegram, type /newbot, and paste your token below.</div><div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Bot Token</label><input value={botToken} onChange={e => setBotToken(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none font-mono" placeholder="123456:ABC-DEF..." /></div></div>}
        {(type === "instagram" || type === "facebook") && <div className="space-y-3"><div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-4 rounded-xl">We need permission to manage your Pages and read messages.</div><p className="text-sm text-gray-500">You will be redirected to {type === "instagram" ? "Instagram" : "Facebook"} to authorize Hypnate.</p></div>}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleConnect} disabled={loading} className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2" style={{ background: COLORS[type] || "#0d9488" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {type === "instagram" || type === "facebook" ? `Continue with ${type === "instagram" ? "Instagram" : "Facebook"}` : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryStep = ({ completed, skipped, autoProgress, autoTasks }: { completed: Set<number>; skipped: Set<number>; autoProgress: number; autoTasks: { id: number; label: string; done: boolean }[] }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "8px 0 16px", gap: 24 }}>
    <div style={{ position: "relative" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f0fdfa", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <Bot size={40} color="#0d9488" style={{ animation: "bounce 1s ease infinite" }} />
      </div>
      <div style={{ position: "absolute", inset: -8, borderRadius: "50%", background: "#0d9488", opacity: 0.1, animation: "ping 1.5s ease infinite" }} />
    </div>
    <div><h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Setting up your store</h2><p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>Hypnate AI is configuring your workspace...</p></div>
    <div style={{ width: "100%", maxWidth: 440 }}>
      <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: "100%", width: `${autoProgress}%`, background: "linear-gradient(90deg, #0d9488, #34d399)", borderRadius: 4, transition: "width 0.3s ease" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
        {autoTasks.map(task => (
          <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {task.done ? <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Check size={12} color="#16a34a" /></div> : <Loader2 size={24} color="#0d9488" style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }} />}
            <span style={{ fontSize: 14, fontWeight: task.done ? 400 : 600, color: task.done ? "#94a3b8" : "#0f172a", textDecoration: task.done ? "line-through" : "none" }}>{task.label}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={{ width: "100%", maxWidth: 440, background: "#f8fafc", borderRadius: 14, padding: 16, border: "1px solid #f1f5f9" }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px", textAlign: "left" }}>Setup Summary</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[1, 2, 3, 4].map(step => {
          const isCompleted = completed.has(step); const isSkipped = skipped.has(step);
          return (
            <div key={step} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{STEP_LABELS[step]}</span>
              {isCompleted ? <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 10px", borderRadius: 20 }}><CheckCircle2 size={12} /> Completed</span>
                : isSkipped ? <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#dc2626", background: "#fee2e2", padding: "2px 10px", borderRadius: 20 }}><XCircle size={12} /> Skipped</span>
                  : <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

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
        } else if (paymentForm.gateway === "cod") { await api.post("/api/onboarding/payments", { gateway: "cod" }); }
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

  const handleSkip = () => { markSkipped(currentStep); if (currentStep < 4) setCurrentStep(c => (c + 1) as Step); else setCurrentStep(5); };
  const handlePopupContinue = async () => { setShowSkipPopup(false); await api.post("/api/onboarding/complete"); navigate("/dashboard"); };
  const handlePopupComplete = () => { setShowSkipPopup(false); const first = [1, 2, 3, 4].find(s => skipped.has(s)); if (first) setCurrentStep(first as Step); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        .ob-root { font-family: 'Outfit', sans-serif; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ping { 0%{transform:scale(1);opacity:0.3} 100%{transform:scale(1.6);opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
      <div className="ob-root" style={{ background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 32px 48px" }}>
          <div style={{ width: "100%", maxWidth: 740 }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.5px" }}>Store Setup</h1>
              <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>Complete all steps to launch your Hypnate store</p>
            </div>
            <Stepper current={currentStep} completed={completed} skipped={skipped} />
            <div style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", border: "1px solid #f1f5f9", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
              {currentStep === 1 && <BusinessStep form={businessForm} onChange={setBusinessForm} error={error} onClear={() => setError("")} />}
              {currentStep === 2 && <CatalogStep fileName={catalogName} onFile={(name, file) => { setCatalogName(name); setCatalogFile(file); }} onClear={() => { setCatalogName(null); setCatalogFile(null); }} error={error} onErrorClear={() => setError("")} />}
              {currentStep === 3 && <PaymentsStep form={paymentForm} onChange={setPaymentForm} error={error} onClear={() => setError("")} />}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div><h2 className="text-2xl font-bold text-gray-900">Connect Channels</h2><p className="text-gray-500 mt-1 text-sm">Link your social accounts to automate selling.</p></div>
                  {error && <ErrorBanner message={error} onClose={() => setError("")} />}
                  <div className="grid grid-cols-2 gap-4">
                    {(Object.keys(CHANNEL_CFG) as (keyof typeof CHANNEL_CFG)[]).map(key => {
                      const cfg = CHANNEL_CFG[key]; const connected = channels[key].connected; const Icon = cfg.icon;
                      return (
                        <button key={key} onClick={() => !connected && setActiveModal(key as ModalType)} style={{ padding: 20, borderRadius: 16, border: `2px solid ${connected ? cfg.border : "#e2e8f0"}`, background: connected ? cfg.bg : "#fff", cursor: connected ? "default" : "pointer", transition: "all 0.2s", position: "relative", textAlign: "center" }}>
                          <div style={{ width: 48, height: 48, borderRadius: "50%", background: cfg.color + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><Icon size={22} color={cfg.color} /></div>
                          <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, margin: "0 0 4px" }}>{cfg.name}</p>
                          <p style={{ fontSize: 12, color: connected ? cfg.color : "#94a3b8", margin: 0, fontWeight: connected ? 600 : 400 }}>{connected ? "Connected" : cfg.desc}</p>
                          {connected && <div style={{ position: "absolute", top: 12, right: 12, width: 22, height: 22, borderRadius: "50%", background: cfg.color, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} color="#fff" /></div>}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400">You can connect channels later from Settings — this step is optional.</p>
                </div>
              )}
              {currentStep === 5 && <SummaryStep completed={completed} skipped={skipped} autoProgress={autoProgress} autoTasks={autoTasks} />}
              {currentStep < 5 ? (
                <Footer onBack={currentStep > 1 ? () => setCurrentStep(c => (c - 1) as Step) : undefined} onSkip={currentStep > 1 ? handleSkip : undefined} onNext={handleNext} loading={loading} showBack={currentStep > 1} showSkip={currentStep > 1} />
              ) : (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 32, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
                  <button onClick={handleNext} disabled={autoProgress < 100 || loading} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 40px", background: autoProgress < 100 ? "#94a3b8" : "#0d9488", color: "#fff", borderRadius: 14, fontWeight: 800, fontSize: 16, border: "none", cursor: autoProgress < 100 ? "not-allowed" : "pointer", transition: "all 0.3s", boxShadow: autoProgress >= 100 ? "0 8px 24px rgba(13,148,136,0.3)" : "none", fontFamily: "inherit" }}>
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