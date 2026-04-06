import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, ChevronRight, Building2, Upload, CreditCard,
  Share2, MessageCircle, Instagram, Facebook, Send,
  Loader2, Sparkles, Bot, Lock, AlertCircle, X,
  FileText, Eye, EyeOff, ExternalLink, Truck,
  Star, Shield, Zap, ArrowRight,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuthStore } from "../stores/useAuthStore";
import api from "../lib/api";
import * as XLSX from "xlsx";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Step = 1 | 2 | 3 | 4 | 5;
type Gateway = "razorpay" | "payu" | "cashfree" | "skydo" | "cod" | null;

interface BusinessForm {
  businessName: string; industry: string; size: string; phone: string; gstNumber: string;
}
interface PaymentForm {
  gateway: Gateway; keyId: string; keySecret: string; merchantId: string; salt: string;
}
interface ChannelData {
  whatsapp: { connected: boolean; phone: string; apiKey: string };
  instagram: { connected: boolean };
  facebook: { connected: boolean };
  telegram: { connected: boolean; botToken: string };
}
interface CsvPreview {
  headers: string[]; rows: string[][]; total: number;
}

/* ─── Gateway config ─────────────────────────────────────────────────────── */
const GATEWAYS = [
  {
    id: "razorpay" as Gateway, name: "Razorpay", logo: "R", color: "#3b82f6", tagline: "Most popular in India", fees: "2% per transaction", setupUrl: "https://dashboard.razorpay.com/app/keys",
    setupSteps: ["Go to razorpay.com and create a free account", "Complete KYC verification (takes ~2 days)", "Go to Settings → API Keys → Generate Key", "Copy both Key ID and Key Secret below"],
    fields: [{ key: "keyId", label: "Key ID", placeholder: "rzp_live_... or rzp_test_...", mono: true }, { key: "keySecret", label: "Key Secret", placeholder: "••••••••••••••••", mono: true, secret: true }]
  },
  {
    id: "payu" as Gateway, name: "PayU", logo: "P", color: "#f97316", tagline: "Trusted by 5M+ businesses", fees: "1.99% per transaction", setupUrl: "https://onboarding.payu.in",
    setupSteps: ["Go to payu.in and create a merchant account", "Complete your business verification", "Go to Dashboard → My Account → Merchant Key", "Copy your Merchant Key and Salt below"],
    fields: [{ key: "merchantId", label: "Merchant Key", placeholder: "Your PayU Merchant Key", mono: true }, { key: "salt", label: "Salt", placeholder: "Your PayU Salt", mono: true, secret: true }]
  },
  {
    id: "cashfree" as Gateway, name: "Cashfree", logo: "C", color: "#16a34a", tagline: "Lowest fees, fast settlements", fees: "1.75% per transaction", setupUrl: "https://merchant.cashfree.com",
    setupSteps: ["Go to cashfree.com and sign up as a merchant", "Verify your business details and bank account", "Go to Developers → API Keys in your dashboard", "Copy the App ID and Secret Key below"],
    fields: [{ key: "keyId", label: "App ID", placeholder: "Your Cashfree App ID", mono: true }, { key: "keySecret", label: "Secret Key", placeholder: "••••••••••••••••", mono: true, secret: true }]
  },
  {
    id: "skydo" as Gateway, name: "Skydo", logo: "S", color: "#7c3aed", tagline: "Best for international payments", fees: "1.99% + forex savings", setupUrl: "https://skydo.com",
    setupSteps: ["Go to skydo.com and create a business account", "Complete KYC and bank account linking", "Go to API Settings in your Skydo dashboard", "Copy your API Key and Secret below"],
    fields: [{ key: "keyId", label: "API Key", placeholder: "Your Skydo API Key", mono: true }, { key: "keySecret", label: "API Secret", placeholder: "••••••••••••••••", mono: true, secret: true }]
  },
  { id: "cod" as Gateway, name: "Cash on Delivery", logo: "₹", color: "#64748b", tagline: "No gateway needed", fees: "Free — collect cash at delivery", setupUrl: null, setupSteps: [], fields: [] },
];

const STEPS_CONFIG = [
  { id: 1, title: "Business Info", icon: Building2, desc: "Tell us about your business" },
  { id: 2, title: "Catalog", icon: Upload, desc: "Import your products" },
  { id: 3, title: "Payments", icon: CreditCard, desc: "Choose payment gateway" },
  { id: 4, title: "Channels", icon: Share2, desc: "Connect social accounts" },
  { id: 5, title: "AI Setup", icon: Sparkles, desc: "Configure AI workspace" },
];

const TIPS: Record<number, { icon: React.ReactNode; title: string; body: string }[]> = {
  1: [
    { icon: <Shield size={15} />, title: "Your data is safe", body: "All business info is encrypted and never shared with third parties." },
    { icon: <Zap size={15} />, title: "GST saves tax", body: "Adding your GST number enables B2B invoicing and input tax credit." },
  ],
  2: [
    { icon: <Star size={15} />, title: "Quick import", body: "Your entire catalog uploads in seconds. Products go live instantly after onboarding." },
    { icon: <Zap size={15} />, title: "Supported formats", body: "CSV, Excel (.xlsx), and .xls all work. Just need name and price columns." },
  ],
  3: [
    { icon: <Shield size={15} />, title: "Keys are encrypted", body: "We store your API keys encrypted. Even our team can't read them." },
    { icon: <Star size={15} />, title: "Change anytime", body: "You can switch payment gateways or add multiple methods from Settings later." },
  ],
  4: [
    { icon: <Zap size={15} />, title: "All channels work together", body: "Messages from WhatsApp, Instagram, Facebook and Telegram appear in one inbox." },
    { icon: <Star size={15} />, title: "Skip for now", body: "You can connect channels later from Settings. Onboarding doesn't require it." },
  ],
  5: [
    { icon: <Bot size={15} />, title: "AI is learning your catalog", body: "Hypnate AI reads your products and trains itself to answer customer questions." },
    { icon: <Sparkles size={15} />, title: "Ready in minutes", body: "Your store will be fully operational as soon as setup completes." },
  ],
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const normalizeHeader = (h: string) => h.trim().toLowerCase().replace(/\s+/g, "_");

const sheetToRows = (sheet: XLSX.WorkSheet) => {
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  if (json.length < 2) return { headers: [], rows: [] };
  const headers = (json[0] as string[]).map(normalizeHeader);
  const rows = json.slice(1).filter(r => r.some(Boolean)).map(r =>
    Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""]))
  );
  return { headers, rows };
};

const ErrorBanner = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
    <p className="text-sm text-red-700 flex-1">{message}</p>
    <button onClick={onClose}><X className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
  </div>
);

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
const Sidebar = ({ current, completed }: { current: Step; completed: Set<number> }) => (
  <div style={{ width: 280, flexShrink: 0 }}>
    {/* Logo */}
    <div style={{ padding: '32px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={18} color="#fff" />
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: 18, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>Hypnate</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Store Setup</p>
        </div>
      </div>
    </div>

    {/* Steps */}
    <div style={{ padding: '20px 16px', flex: 1 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 14px 8px' }}>
        Setup Progress
      </p>
      {STEPS_CONFIG.map((step, i) => {
        const done = completed.has(step.id);
        const active = current === step.id;
        const Icon = step.icon;
        return (
          <div key={step.id} style={{ position: 'relative' }}>
            {i < STEPS_CONFIG.length - 1 && (
              <div style={{ position: 'absolute', left: 27, top: 52, width: 2, height: 20, background: done ? '#0d9488' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
            )}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12, marginBottom: 4,
              background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: active ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: done ? '#0d9488' : active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                border: done ? 'none' : active ? '2px solid #0d9488' : '2px solid rgba(255,255,255,0.15)',
                transition: 'all 0.3s',
              }}>
                {done ? <Check size={14} color="#fff" /> : <Icon size={14} color={active ? '#0d9488' : 'rgba(255,255,255,0.4)'} />}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: done ? '#fff' : active ? '#fff' : 'rgba(255,255,255,0.45)', margin: 0, transition: 'color 0.2s' }}>
                  {step.title}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{step.desc}</p>
              </div>
              {done && <Check size={14} color="#0d9488" style={{ marginLeft: 'auto' }} />}
            </div>
          </div>
        );
      })}
    </div>

    {/* Progress bar */}
    <div style={{ padding: '16px 24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Overall Progress</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#0d9488' }}>{Math.round((completed.size / 5) * 100)}%</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(completed.size / 5) * 100}%`, background: 'linear-gradient(90deg, #0d9488, #34d399)', borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>

      {/* Tips */}
      <div style={{ marginTop: 20 }}>
        {(TIPS[current] || []).map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ color: '#0d9488', flexShrink: 0, marginTop: 1 }}>{tip.icon}</div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: '0 0 3px' }}>{tip.title}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.5 }}>{tip.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Step 1: Business ───────────────────────────────────────────────────── */
const BusinessStep = ({ form, onChange, error, onClear }: { form: BusinessForm; onChange: (f: BusinessForm) => void; error: string; onClear: () => void }) => {
  const set = (k: keyof BusinessForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ ...form, [k]: e.target.value });
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tell us about your business</h2>
        <p className="text-gray-500 mt-1 text-sm">We need some basic details to personalise your store.</p>
      </div>
      {error && <ErrorBanner message={error} onClose={onClear} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name <span className="text-red-500">*</span></label>
          <input value={form.businessName} onChange={set("businessName")} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors text-gray-900" placeholder="e.g. Rahul Fashion House…" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Industry</label>
          <select value={form.industry} onChange={set("industry")} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none bg-white text-gray-900 transition-colors">
            {[['retail', 'Retail'], ['food', 'Food & Beverage'], ['fashion', 'Fashion'], ['electronics', 'Electronics'], ['beauty', 'Beauty & Wellness'], ['furniture', 'Furniture & Home'], ['services', 'Services'], ['other', 'Other']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Size</label>
          <select value={form.size} onChange={set("size")} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none bg-white text-gray-900 transition-colors">
            {[['1-10', '1–10 employees'], ['11-50', '11–50 employees'], ['51-200', '51–200 employees'], ['200+', '200+ employees']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
          <input value={form.phone} onChange={set("phone")} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none transition-colors" placeholder="+91 98XXX XXXXX" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST Number <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
          <input value={form.gstNumber} onChange={set("gstNumber")} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none font-mono uppercase tracking-wider transition-colors" placeholder="27AAPFU0939F1ZV" maxLength={15} />
        </div>
      </div>
    </div>
  );
};

/* ─── Step 2: Catalog ────────────────────────────────────────────────────── */
const CatalogStep = ({ preview, onFile, onClear, error, onErrorClear }: { preview: CsvPreview | null; onFile: (rows: any[], preview: CsvPreview, rawText: string) => void; onClear: () => void; error: string; onErrorClear: () => void }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();
    if (ext === "csv") {
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const lines = text.trim().split("\n").filter(Boolean);
        if (lines.length < 2) return;
        const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, "").toLowerCase().replace(/\s+/g, "_"));
        const allRows = lines.slice(1).map(l => Object.fromEntries(headers.map((h, i) => [h, l.split(",")[i]?.trim().replace(/"/g, "") ?? ""])));
        const previewRows = allRows.slice(0, 5).map(r => headers.map(h => r[h] ?? ""));
        onFile(allRows, { headers, rows: previewRows, total: allRows.length }, text);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (ev) => {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const { headers, rows } = sheetToRows(sheet);
        if (!headers.length) return;
        const previewRows = rows.slice(0, 5).map(r => headers.map(h => String(r[h] ?? "")));
        const csvLines = [headers.join(","), ...rows.map(r => headers.map(h => r[h] ?? "").join(","))];
        onFile(rows, { headers, rows: previewRows, total: rows.length }, csvLines.join("\n"));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add your products</h2>
        <p className="text-gray-500 mt-1 text-sm">Upload your product catalog — CSV, Excel (.xlsx), or .xls</p>
      </div>
      {error && <ErrorBanner message={error} onClose={onErrorClear} />}
      {!preview ? (
        <>
          <div onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:bg-primary-50 hover:border-primary-400 transition-all cursor-pointer group">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
              <Upload className="w-7 h-7 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
            <p className="font-bold text-gray-900 text-lg">Drop your catalog here</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              {[".csv", ".xlsx", ".xls"].map(ext => <span key={ext} className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg font-mono font-medium">{ext}</span>)}
            </div>
            <p className="text-xs text-gray-400 mt-3">Maximum 500 products per upload</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} className="hidden" />
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1.5">Required columns</p>
            <code className="text-xs text-blue-700 font-mono">name, price, description, category, stock, image_url</code>
            <p className="text-xs text-blue-600 mt-1">Only <strong>name</strong> and <strong>price</strong> are required. Rest are optional.</p>
          </div>
          <button onClick={() => {
            const csv = `name,price,description,category,stock,image_url\nSample Product,499,A great product,Retail,100,\nAnother Product,299,Another description,Fashion,50,`;
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = "sample_catalog.csv"; a.click();
          }} className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1.5 font-medium transition-colors">
            <FileText className="w-4 h-4" /> Download sample template
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>
              <div>
                <p className="text-sm font-bold text-green-800">{preview.total} products ready to import</p>
                <p className="text-xs text-green-600">Preview showing first 5 rows</p>
              </div>
            </div>
            <button onClick={onClear} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"><X className="w-4 h-4" /> Remove</button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="text-xs w-full">
              <thead><tr className="bg-gray-50">{preview.headers.map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 capitalize whitespace-nowrap">{h.replace(/_/g, ' ')}</th>)}</tr></thead>
              <tbody>{preview.rows.map((row, i) => <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">{row.map((cell, j) => <td key={j} className="px-4 py-2.5 text-gray-700 max-w-[120px] truncate">{cell}</td>)}</tr>)}</tbody>
            </table>
            {preview.total > 5 && <p className="text-xs text-gray-400 text-center py-3">{preview.total - 5} more rows not shown</p>}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Step 3: Payments ───────────────────────────────────────────────────── */
const PaymentsStep = ({ form, onChange, error, onClear }: { form: PaymentForm; onChange: (f: PaymentForm) => void; error: string; onClear: () => void }) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const selectedGw = GATEWAYS.find(g => g.id === form.gateway);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Setup Payments</h2>
        <p className="text-gray-500 mt-1 text-sm">Choose how you want to accept payments from customers.</p>
      </div>
      {error && <ErrorBanner message={error} onClose={onClear} />}

      {!form.gateway ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GATEWAYS.map(gw => (
            <button key={gw.id} onClick={() => onChange({ gateway: gw.id, keyId: "", keySecret: "", merchantId: "", salt: "" })}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all text-left group">
              <div style={{ width: 48, height: 48, borderRadius: 14, background: gw.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                {gw.logo}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900">{gw.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{gw.tagline}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: gw.color }}>{gw.fees}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <button onClick={() => onChange({ gateway: null, keyId: "", keySecret: "", merchantId: "", salt: "" })}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors">
            ← Change payment method
          </button>

          <div className="flex items-center gap-4 p-4 rounded-2xl border-2" style={{ borderColor: selectedGw!.color, background: selectedGw!.color + '10' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: selectedGw!.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
              {selectedGw!.logo}
            </div>
            <div>
              <p className="font-bold text-gray-900">{selectedGw!.name}</p>
              <p className="text-sm text-gray-600">{selectedGw!.fees}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-sm text-green-600 font-semibold bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
              <Check className="w-4 h-4" /> Selected
            </div>
          </div>

          {form.gateway === "cod" ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
              <Truck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-green-800">Cash on Delivery enabled</p>
                <p className="text-sm text-green-700 mt-1">Customers pay when they receive their order. No gateway setup needed.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <button onClick={() => setShowGuide(s => !s)} className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-amber-800">How to get your {selectedGw!.name} API keys</span>
                  <ChevronRight className={cn("w-4 h-4 text-amber-600 transition-transform", showGuide && "rotate-90")} />
                </button>
                {showGuide && (
                  <ol className="mt-3 space-y-2">
                    {selectedGw!.setupSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-amber-800">
                        <span className="w-5 h-5 rounded-full bg-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                    {selectedGw!.setupUrl && (
                      <li><a href={selectedGw!.setupUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline font-semibold mt-1">
                        Open {selectedGw!.name} dashboard <ExternalLink className="w-3 h-3" />
                      </a></li>
                    )}
                  </ol>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <p className="text-xs text-slate-600">Your keys are encrypted before storage. We never expose them.</p>
                </div>
                {selectedGw!.fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                    <div className="relative">
                      <input type={field.secret && !showSecret[field.key] ? "password" : "text"}
                        value={(form as any)[field.key]}
                        onChange={e => onChange({ ...form, [field.key]: e.target.value })}
                        className={cn("w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none transition-colors", field.mono && "font-mono", field.secret && "pr-12")}
                        placeholder={field.placeholder} />
                      {field.secret && (
                        <button type="button" onClick={() => setShowSecret(s => ({ ...s, [field.key]: !s[field.key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showSecret[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {!form.gateway && <p className="text-xs text-gray-400">You can add or change payment methods later from Settings.</p>}
    </div>
  );
};

/* ─── Step 4: Channels ───────────────────────────────────────────────────── */
type ModalType = "whatsapp" | "instagram" | "facebook" | "telegram" | null;

const ChannelModal = ({ type, onClose, onConnect }: { type: ModalType; onClose: () => void; onConnect: (type: string, data: any) => void }) => {
  const [phone, setPhone] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [botToken, setBotToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!type) return null;

  const handleConnect = async () => {
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    try {
      if (type === "whatsapp") {
        if (!phone || !apiKey) { setError("Phone and API key are required"); setLoading(false); return; }
        onConnect("whatsapp", { phone, apiKey });
      } else if (type === "telegram") {
        if (!botToken || !botToken.includes(":")) { setError("Invalid bot token format"); setLoading(false); return; }
        onConnect("telegram", { botToken });
      } else { onConnect(type, { mock: true }); }
      onClose();
    } finally { setLoading(false); }
  };

  const COLORS: Record<string, string> = { whatsapp: "#16a34a", instagram: "#db2777", facebook: "#2563eb", telegram: "#0284c7" };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900 capitalize">Connect {type}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        {error && <ErrorBanner message={error} onClose={() => setError("")} />}
        {type === "whatsapp" && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-xl">You need a Facebook Business Manager account and a number not already on WhatsApp personal.</div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none transition-colors" placeholder="+91 98XXX XXXXX" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp Business API Key</label><input value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none font-mono transition-colors" placeholder="EAAG..." /><p className="text-xs text-gray-400 mt-1">Found in your Meta Developer Portal.</p></div>
          </div>
        )}
        {type === "telegram" && (
          <div className="space-y-4">
            <div className="bg-sky-50 border border-sky-200 text-sky-800 text-sm p-4 rounded-xl">Message @BotFather on Telegram, type /newbot, and paste your token below.</div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Bot Token</label><input value={botToken} onChange={e => setBotToken(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-500 outline-none font-mono transition-colors" placeholder="123456:ABC-DEF..." /></div>
          </div>
        )}
        {(type === "instagram" || type === "facebook") && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-4 rounded-xl">We need permission to manage your Pages and read messages to automate replies.</div>
            <p className="text-sm text-gray-500">You'll be redirected to {type === "instagram" ? "Instagram" : "Facebook"} to authorize Hypnate.</p>
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleConnect} disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors"
            style={{ background: COLORS[type] || '#0d9488' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {type === "instagram" || type === "facebook" ? `Continue with ${type === "instagram" ? "Instagram" : "Facebook"}` : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CHANNEL_CFG = {
  whatsapp: { name: "WhatsApp", desc: "Connect Business API", icon: MessageCircle, color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  instagram: { name: "Instagram", desc: "Connect DM Automation", icon: Instagram, color: '#db2777', bg: '#fdf2f8', border: '#f9a8d4' },
  facebook: { name: "Facebook", desc: "Connect Messenger", icon: Facebook, color: '#2563eb', bg: '#eff6ff', border: '#93c5fd' },
  telegram: { name: "Telegram", desc: "Connect Bot", icon: Send, color: '#0284c7', bg: '#f0f9ff', border: '#7dd3fc' },
};

/* ─── Main Onboarding ────────────────────────────────────────────────────── */
export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [businessForm, setBusinessForm] = useState<BusinessForm>({ businessName: "", industry: "retail", size: "1-10", phone: "", gstNumber: "" });
  const [catalogRows, setCatalogRows] = useState<any[]>([]);
  const [csvText, setCsvText] = useState("");
  const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);
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

  const handleNext = async () => {
    setError(""); setLoading(true);
    try {
      if (currentStep === 1) {
        if (!businessForm.businessName.trim()) { setError("Business name is required"); return; }
        await api.post("/api/onboarding/business", businessForm);
        setCompleted(s => new Set(s).add(1)); setCurrentStep(2);
      } else if (currentStep === 2) {
        if (csvText) await api.post("/api/onboarding/catalog", { csvData: csvText });
        setCompleted(s => new Set(s).add(2)); setCurrentStep(3);
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
        setCompleted(s => new Set(s).add(3)); setCurrentStep(4);
      } else if (currentStep === 4) {
        const connected: any = {};
        if (channels.whatsapp.connected) connected.whatsapp = { phone: channels.whatsapp.phone, apiKey: channels.whatsapp.apiKey };
        if (channels.telegram.connected) connected.telegram = { botToken: channels.telegram.botToken };
        if (channels.instagram.connected) connected.instagram = {};
        if (channels.facebook.connected) connected.facebook = {};
        if (Object.keys(connected).length > 0) await api.post("/api/onboarding/channels", { channels: connected });
        setCompleted(s => new Set(s).add(4)); setCurrentStep(5);
      } else if (currentStep === 5) {
        await api.post("/api/onboarding/complete");
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        .ob-root { font-family: 'Outfit', sans-serif; }
      `}</style>
      <div className="ob-root" style={{ background: '#f8fafc' }}>

        {/* Sits inside the app shell which already has the global Sidebar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 32px 48px' }}>
          <div style={{ width: '100%', maxWidth: 740 }}>

            {/* ── Page header ── */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                Store Setup
              </h1>
              <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
                Complete all steps to launch your Hypnate store
              </p>
            </div>

            {/* ── Inline step progress bar ── */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px 24px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, left: '10%', right: '10%', height: 2, background: '#f1f5f9', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: 16, left: '10%', height: 2, background: '#0d9488', zIndex: 0, transition: 'width 0.4s ease', width: `${Math.max(0, ((currentStep - 1) / 4) * 80)}%` }} />
                {STEPS_CONFIG.map((step) => {
                  const done = completed.has(step.id);
                  const active = currentStep === step.id;
                  const Icon = step.icon;
                  return (
                    <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1, flex: 1 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done ? '#0d9488' : active ? '#f0fdfa' : '#f8fafc',
                        border: `2px solid ${done ? '#0d9488' : active ? '#0d9488' : '#e2e8f0'}`,
                        transition: 'all 0.3s',
                      }}>
                        {done ? <Check size={14} color="#fff" /> : <Icon size={14} color={active ? '#0d9488' : '#94a3b8'} />}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: done ? '#0d9488' : active ? '#0f172a' : '#94a3b8', whiteSpace: 'nowrap' }}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content card */}
            <div style={{ background: '#fff', borderRadius: 20, padding: '32px 36px', border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

              {currentStep === 1 && <BusinessStep form={businessForm} onChange={setBusinessForm} error={error} onClear={() => setError("")} />}
              {currentStep === 2 && <CatalogStep preview={csvPreview} onFile={(rows, preview, raw) => { setCatalogRows(rows); setCsvPreview(preview); setCsvText(raw); }} onClear={() => { setCatalogRows([]); setCsvPreview(null); setCsvText(""); }} error={error} onErrorClear={() => setError("")} />}
              {currentStep === 3 && <PaymentsStep form={paymentForm} onChange={setPaymentForm} error={error} onClear={() => setError("")} />}

              {currentStep === 4 && (
                <div className="space-y-5">
                  <div><h2 className="text-2xl font-bold text-gray-900">Connect Channels</h2><p className="text-gray-500 mt-1 text-sm">Link your social accounts to automate selling.</p></div>
                  {error && <ErrorBanner message={error} onClose={() => setError("")} />}
                  <div className="grid grid-cols-2 gap-4">
                    {(Object.keys(CHANNEL_CFG) as (keyof typeof CHANNEL_CFG)[]).map(key => {
                      const cfg = CHANNEL_CFG[key];
                      const connected = channels[key].connected;
                      const Icon = cfg.icon;
                      return (
                        <button key={key} onClick={() => !connected && setActiveModal(key as ModalType)}
                          style={{ padding: 20, borderRadius: 16, border: `2px solid ${connected ? cfg.border : '#e2e8f0'}`, background: connected ? cfg.bg : '#fff', cursor: connected ? 'default' : 'pointer', transition: 'all 0.2s', position: 'relative', textAlign: 'center' }}
                          className={!connected ? 'hover:border-primary-300 hover:bg-primary-50' : ''}>
                          <div style={{ width: 48, height: 48, borderRadius: '50%', background: cfg.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <Icon size={22} color={cfg.color} />
                          </div>
                          <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, margin: '0 0 4px' }}>{cfg.name}</p>
                          <p style={{ fontSize: 12, color: connected ? cfg.color : '#94a3b8', margin: 0, fontWeight: connected ? 600 : 400 }}>
                            {connected ? '✓ Connected' : cfg.desc}
                          </p>
                          {connected && <div style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: '50%', background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color="#fff" /></div>}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400">You can connect channels later from Settings — this step is optional.</p>
                </div>
              )}

              {currentStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 0', gap: 24 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                      <Bot size={44} color="#0d9488" style={{ animation: 'bounce 1s ease infinite' }} />
                    </div>
                    <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: '#0d9488', opacity: 0.1, animation: 'ping 1.5s ease infinite' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Setting up your store</h2>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>Hypnate AI is configuring your workspace…</p>
                  </div>
                  <div style={{ width: '100%', maxWidth: 440 }}>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
                      <div style={{ height: '100%', width: `${autoProgress}%`, background: 'linear-gradient(90deg, #0d9488, #34d399)', borderRadius: 4, transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                      {autoTasks.map(task => (
                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {task.done
                            ? <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color="#16a34a" /></div>
                            : <Loader2 size={24} color="#0d9488" style={{ animation: 'spin 0.7s linear infinite' }} />}
                          <span style={{ fontSize: 14, fontWeight: task.done ? 400 : 600, color: task.done ? '#94a3b8' : '#0f172a', textDecoration: task.done ? 'line-through' : 'none' }}>
                            {task.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Footer buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
                {currentStep < 5 ? (
                  <>
                    <button onClick={() => currentStep > 1 ? setCurrentStep(c => (c - 1) as Step) : null}
                      disabled={currentStep === 1}
                      style={{ fontSize: 14, fontWeight: 500, color: '#64748b', background: 'none', border: 'none', cursor: currentStep === 1 ? 'default' : 'pointer', opacity: currentStep === 1 ? 0 : 1 }}>
                      ← Back
                    </button>
                    <button onClick={handleNext} disabled={loading}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#0d9488', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.15s' }}>
                      {loading ? <><Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</> : <>Next Step <ChevronRight size={16} /></>}
                    </button>
                  </>
                ) : (
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <button onClick={handleNext} disabled={autoProgress < 100 || loading}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 40px', background: autoProgress < 100 ? '#94a3b8' : '#0d9488', color: '#fff', borderRadius: 14, fontWeight: 800, fontSize: 16, border: 'none', cursor: autoProgress < 100 ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: autoProgress >= 100 ? '0 8px 24px rgba(13,148,136,0.3)' : 'none' }}>
                      {loading ? <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} />
                        : autoProgress < 100 ? "Please wait…"
                          : <><Sparkles size={18} /> Launch Dashboard</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChannelModal type={activeModal} onClose={() => setActiveModal(null)}
        onConnect={(type, data) => setChannels(prev => ({ ...prev, [type]: { ...prev[type as keyof ChannelData], connected: true, ...data } }))} />

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ping { 0%{transform:scale(1);opacity:0.3} 100%{transform:scale(1.6);opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </>
  );
};