import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, ChevronRight, Building2, Upload, CreditCard,
  Share2, MessageCircle, Instagram, Facebook, Send,
  Loader2, Sparkles, Bot, Lock, AlertCircle, X,
  FileText, Eye, EyeOff, ExternalLink, Truck,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuthStore } from "../stores/useAuthStore";
import api from "../lib/api";
import * as XLSX from "xlsx";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type Step = 1 | 2 | 3 | 4 | 5;
type Gateway = "razorpay" | "payu" | "cashfree" | "skydo" | "cod" | null;

interface BusinessForm {
  businessName: string;
  industry: string;
  size: string;
  phone: string;
  gstNumber: string;
}

interface PaymentForm {
  gateway: Gateway;
  keyId: string;
  keySecret: string;
  merchantId: string;
  salt: string;
}

interface ChannelData {
  whatsapp:  { connected: boolean; phone: string; apiKey: string };
  instagram: { connected: boolean };
  facebook:  { connected: boolean };
  telegram:  { connected: boolean; botToken: string };
}

interface CsvPreview {
  headers: string[];
  rows: string[][];
  total: number;
}

/* ─────────────────────────────────────────────
   GATEWAY CONFIG
───────────────────────────────────────────── */
const GATEWAYS = [
  {
    id: "razorpay" as Gateway,
    name: "Razorpay",
    logo: "R",
    color: "blue",
    tagline: "Most popular in India",
    fees: "2% per transaction",
    setupUrl: "https://dashboard.razorpay.com/app/keys",
    setupSteps: [
      "Go to razorpay.com and create a free account",
      "Complete KYC verification (takes ~2 days)",
      "Go to Settings → API Keys → Generate Key",
      "Copy both Key ID and Key Secret below",
    ],
    fields: [
      { key: "keyId",     label: "Key ID",     placeholder: "rzp_live_... or rzp_test_...", mono: true },
      { key: "keySecret", label: "Key Secret", placeholder: "••••••••••••••••",             mono: true, secret: true },
    ],
  },
  {
    id: "payu" as Gateway,
    name: "PayU",
    logo: "P",
    color: "orange",
    tagline: "Trusted by 5M+ businesses",
    fees: "1.99% per transaction",
    setupUrl: "https://onboarding.payu.in/app/account/signup",
    setupSteps: [
      "Go to payu.in and create a merchant account",
      "Complete your business verification",
      "Go to Dashboard → My Account → Merchant Key",
      "Copy your Merchant Key and Salt below",
    ],
    fields: [
      { key: "merchantId", label: "Merchant Key", placeholder: "Your PayU Merchant Key", mono: true },
      { key: "salt",       label: "Salt",          placeholder: "Your PayU Salt",         mono: true, secret: true },
    ],
  },
  {
    id: "cashfree" as Gateway,
    name: "Cashfree",
    logo: "C",
    color: "green",
    tagline: "Lowest fees, fast settlements",
    fees: "1.75% per transaction",
    setupUrl: "https://merchant.cashfree.com/merchants/signup",
    setupSteps: [
      "Go to cashfree.com and sign up as a merchant",
      "Verify your business details and bank account",
      "Go to Developers → API Keys in your dashboard",
      "Copy the App ID and Secret Key below",
    ],
    fields: [
      { key: "keyId",     label: "App ID",     placeholder: "Your Cashfree App ID",     mono: true },
      { key: "keySecret", label: "Secret Key", placeholder: "••••••••••••••••",          mono: true, secret: true },
    ],
  },
  {
    id: "skydo" as Gateway,
    name: "Skydo",
    logo: "S",
    color: "purple",
    tagline: "Best for international payments",
    fees: "1.99% + forex savings",
    setupUrl: "https://skydo.com",
    setupSteps: [
      "Go to skydo.com and create a business account",
      "Complete KYC and bank account linking",
      "Go to API Settings in your Skydo dashboard",
      "Copy your API Key and Secret below",
    ],
    fields: [
      { key: "keyId",     label: "API Key",    placeholder: "Your Skydo API Key",    mono: true },
      { key: "keySecret", label: "API Secret", placeholder: "••••••••••••••••",       mono: true, secret: true },
    ],
  },
  {
    id: "cod" as Gateway,
    name: "Cash on Delivery",
    logo: "₹",
    color: "gray",
    tagline: "No gateway needed",
    fees: "Free — collect cash at delivery",
    setupUrl: null,
    setupSteps: [],
    fields: [],
  },
];

const GW_COLORS: Record<string, string> = {
  blue:   "border-blue-500 bg-blue-50",
  orange: "border-orange-500 bg-orange-50",
  green:  "border-green-500 bg-green-50",
  purple: "border-purple-500 bg-purple-50",
  gray:   "border-gray-400 bg-gray-50",
};

const GW_BADGE_COLORS: Record<string, string> = {
  blue:   "bg-blue-600 text-white",
  orange: "bg-orange-500 text-white",
  green:  "bg-green-600 text-white",
  purple: "bg-purple-600 text-white",
  gray:   "bg-gray-500 text-white",
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const STEPS = [
  { id: 1, title: "Business Info", icon: Building2 },
  { id: 2, title: "Catalog",       icon: Upload },
  { id: 3, title: "Payments",      icon: CreditCard },
  { id: 4, title: "Channels",      icon: Share2 },
  { id: 5, title: "AI Setup",      icon: Sparkles },
];

const normalizeHeaders = (h: string) =>
  h.trim().toLowerCase().replace(/\s+/g, "_");

const sheetToRows = (sheet: XLSX.WorkSheet): { headers: string[]; rows: any[] } => {
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  if (json.length < 2) return { headers: [], rows: [] };
  const headers = (json[0] as string[]).map(normalizeHeaders);
  const rows    = json.slice(1).filter((r) => r.some(Boolean)).map((r) =>
    Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""]))
  );
  return { headers, rows };
};

/* ─────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────── */
const StepIndicator: React.FC<{ current: Step; completed: Set<number> }> = ({ current, completed }) => (
  <div className="flex items-center justify-between relative mb-8">
    <div className="absolute left-0 top-5 w-full h-0.5 bg-gray-200 -z-10" />
    {STEPS.map((step) => {
      const done   = completed.has(step.id);
      const active = current === step.id;
      return (
        <div key={step.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-300",
            done   ? "border-primary-600 bg-primary-600 text-white"
            : active ? "border-primary-600 bg-primary-50 text-primary-600"
            : "border-gray-300 text-gray-400"
          )}>
            {done ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
          </div>
          <span className={cn(
            "text-xs font-medium hidden sm:block",
            active ? "text-primary-600" : done ? "text-gray-700" : "text-gray-400"
          )}>{step.title}</span>
        </div>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────────
   ERROR BANNER
───────────────────────────────────────────── */
const ErrorBanner: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
    <p className="text-sm text-red-700 flex-1">{message}</p>
    <button onClick={onClose}><X className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
  </div>
);

/* ─────────────────────────────────────────────
   STEP 1 — BUSINESS INFO
───────────────────────────────────────────── */
const BusinessStep: React.FC<{
  form: BusinessForm;
  onChange: (f: BusinessForm) => void;
  error: string;
  onClear: () => void;
}> = ({ form, onChange, error, onClear }) => {
  const set = (key: keyof BusinessForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...form, [key]: e.target.value });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tell us about your business</h2>
        <p className="text-gray-500 mt-1">We need some basic details to set up your store.</p>
      </div>
      {error && <ErrorBanner message={error} onClose={onClear} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input value={form.businessName} onChange={set("businessName")}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="e.g. Sameer CS Associates" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
          <select value={form.industry} onChange={set("industry")}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white">
            <option value="retail">Retail</option>
            <option value="food">Food & Beverage</option>
            <option value="fashion">Fashion</option>
            <option value="electronics">Electronics</option>
            <option value="beauty">Beauty & Wellness</option>
            <option value="furniture">Furniture & Home</option>
            <option value="services">Services</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Size</label>
          <select value={form.size} onChange={set("size")}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white">
            <option value="1-10">1–10 employees</option>
            <option value="11-50">11–50 employees</option>
            <option value="51-200">51–200 employees</option>
            <option value="200+">200+ employees</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input value={form.phone} onChange={set("phone")}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="+91 98765 43210" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GST Number <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input value={form.gstNumber} onChange={set("gstNumber")}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none font-mono uppercase"
            placeholder="22AAAAA0000A1Z5" maxLength={15} />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP 2 — CATALOG (CSV + XLSX + XLS)
───────────────────────────────────────────── */
const CatalogStep: React.FC<{
  preview: CsvPreview | null;
  onFile: (rows: any[], preview: CsvPreview, rawText: string) => void;
  onClear: () => void;
  error: string;
  onErrorClear: () => void;
}> = ({ preview, onFile, onClear, error, onErrorClear }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();

    if (ext === "csv") {
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const lines = text.trim().split("\n").filter(Boolean);
        if (lines.length < 2) { onErrorClear(); return; }
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, "").toLowerCase().replace(/\s+/g, "_"));
        const allRows = lines.slice(1).map((l) =>
          Object.fromEntries(headers.map((h, i) => [h, l.split(",")[i]?.trim().replace(/"/g, "") ?? ""]))
        );
        const previewRows = allRows.slice(0, 5).map((r) => headers.map((h) => r[h] ?? ""));
        onFile(allRows, { headers, rows: previewRows, total: allRows.length }, text);
      };
      reader.readAsText(file);
    } else {
      // xlsx / xls
      reader.onload = (ev) => {
        const data     = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet    = workbook.Sheets[workbook.SheetNames[0]];
        const { headers, rows } = sheetToRows(sheet);
        if (!headers.length) return;
        const previewRows = rows.slice(0, 5).map((r) => headers.map((h) => String(r[h] ?? "")));
        // Convert to CSV text for backend
        const csvLines = [
          headers.join(","),
          ...rows.map((r) => headers.map((h) => r[h] ?? "").join(",")),
        ];
        onFile(rows, { headers, rows: previewRows, total: rows.length }, csvLines.join("\n"));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add your products</h2>
        <p className="text-gray-500 mt-1">Upload your product catalog — CSV, Excel (.xlsx), or .xls</p>
      </div>
      {error && <ErrorBanner message={error} onClose={onErrorClear} />}

      {!preview ? (
        <>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 hover:border-primary-400 transition-all cursor-pointer group mt-2"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
            <p className="font-semibold text-gray-900 text-lg">Click to upload</p>
            <p className="text-sm text-gray-500 mt-1">or drag and drop your catalog file here</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              {[".csv", ".xlsx", ".xls"].map((ext) => (
                <span key={ext} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-mono">{ext}</span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Max 500 products</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
            className="hidden"
          />

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-800 mb-2">Required columns:</p>
            <code className="text-xs text-blue-700 font-mono">name, price, description, category, stock, image_url</code>
            <p className="text-xs text-blue-600 mt-1">Only <strong>name</strong> and <strong>price</strong> are required.</p>
          </div>

          <button
            onClick={() => {
              const csv = `name,price,description,category,stock,image_url\nSample Product,499,A great product,Retail,100,\nAnother Product,299,Another description,Fashion,50,`;
              const blob = new Blob([csv], { type: "text/csv" });
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement("a");
              a.href = url; a.download = "sample_catalog.csv"; a.click();
            }}
            className="text-sm text-primary-600 hover:underline flex items-center gap-1"
          >
            <FileText className="w-4 h-4" /> Download sample template
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {preview.total} products ready to import
              </span>
            </div>
            <button onClick={onClear} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1">
              <X className="w-4 h-4" /> Remove
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="text-xs w-full">
              <thead>
                <tr className="bg-gray-50">
                  {preview.headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600 capitalize whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 text-gray-700 max-w-[120px] truncate">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.total > 5 && (
              <p className="text-xs text-gray-400 text-center py-2">Showing 5 of {preview.total} rows</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP 3 — PAYMENTS (simplified gateway picker)
───────────────────────────────────────────── */
const PaymentsStep: React.FC<{
  form: PaymentForm;
  onChange: (f: PaymentForm) => void;
  error: string;
  onClear: () => void;
}> = ({ form, onChange, error, onClear }) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  const selectedGw = GATEWAYS.find((g) => g.id === form.gateway);

  const selectGateway = (id: Gateway) => {
    onChange({ gateway: id, keyId: "", keySecret: "", merchantId: "", salt: "" });
    setShowGuide(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Setup Payments</h2>
        <p className="text-gray-500 mt-1">Choose how you want to accept payments from customers.</p>
      </div>
      {error && <ErrorBanner message={error} onClose={onClear} />}

      {/* Gateway picker */}
      {!form.gateway ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {GATEWAYS.map((gw) => (
            <button
              key={gw.id}
              onClick={() => selectGateway(gw.id)}
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all text-left group"
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0",
                GW_BADGE_COLORS[gw.color]
              )}>
                {gw.logo}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{gw.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{gw.tagline}</p>
                <p className="text-xs text-primary-600 font-medium mt-0.5">{gw.fees}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0 group-hover:text-primary-600" />
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Back to gateway picker */}
          <button
            onClick={() => selectGateway(null)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Change payment method
          </button>

          {/* Selected gateway header */}
          <div className={cn("flex items-center gap-4 p-4 rounded-xl border-2", GW_COLORS[selectedGw!.color])}>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0", GW_BADGE_COLORS[selectedGw!.color])}>
              {selectedGw!.logo}
            </div>
            <div>
              <p className="font-bold text-gray-900">{selectedGw!.name}</p>
              <p className="text-sm text-gray-600">{selectedGw!.fees}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm text-green-600 font-medium">
              <Check className="w-4 h-4" /> Selected
            </div>
          </div>

          {/* COD — no keys needed */}
          {form.gateway === "cod" ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <Truck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800">Cash on Delivery enabled</p>
                <p className="text-sm text-green-700 mt-1">Customers will pay when they receive their order. No gateway setup required.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Step by step guide */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <button
                  onClick={() => setShowGuide((s) => !s)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-amber-800">
                      How to get your {selectedGw!.name} API keys
                    </span>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 text-amber-600 transition-transform", showGuide && "rotate-90")} />
                </button>
                {showGuide && (
                  <ol className="mt-3 space-y-2">
                    {selectedGw!.setupSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                        <span className="w-5 h-5 rounded-full bg-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                    {selectedGw!.setupUrl && (
                      <li>
                        <a href={selectedGw!.setupUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium mt-1">
                          Open {selectedGw!.name} dashboard <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                    )}
                  </ol>
                )}
              </div>

              {/* Key fields */}
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <p className="text-xs text-blue-800">Your keys are encrypted and stored securely. We never share them.</p>
                </div>
                {selectedGw!.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <div className="relative">
                      <input
                        type={field.secret && !showSecret[field.key] ? "password" : "text"}
                        value={(form as any)[field.key]}
                        onChange={(e) => onChange({ ...form, [field.key]: e.target.value })}
                        className={cn(
                          "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none",
                          field.mono && "font-mono",
                          field.secret && "pr-12"
                        )}
                        placeholder={field.placeholder}
                      />
                      {field.secret && (
                        <button
                          type="button"
                          onClick={() => setShowSecret((s) => ({ ...s, [field.key]: !s[field.key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
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

      {!form.gateway && (
        <p className="text-xs text-gray-400">You can add or change payment methods later from Settings.</p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   CHANNEL CARD + MODAL (unchanged from before)
───────────────────────────────────────────── */
type ModalType = "whatsapp" | "instagram" | "facebook" | "telegram" | null;

const ChannelCard: React.FC<{
  name: string; description: string; connected: boolean;
  icon: React.ReactNode;
  color: { border: string; bg: string; badge: string; icon: string };
  onClick: () => void;
}> = ({ name, description, connected, icon, color, onClick }) => (
  <div onClick={onClick} className={cn(
    "p-6 rounded-xl border-2 cursor-pointer transition-all relative group",
    connected ? `${color.border} ${color.bg}` : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
  )}>
    <div className="flex flex-col items-center text-center">
      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", color.icon)}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-900">{name}</h3>
      <p className="text-xs text-gray-500 mt-1">{connected ? "Connected ✓" : description}</p>
    </div>
    {connected && (
      <div className={cn("absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white", color.badge)}>
        <Check className="w-4 h-4" />
      </div>
    )}
  </div>
);

const ChannelModal: React.FC<{
  type: ModalType; onClose: () => void;
  onConnect: (type: string, data: any) => void;
}> = ({ type, onClose, onConnect }) => {
  const [phone, setPhone]       = useState("");
  const [apiKey, setApiKey]     = useState("");
  const [botToken, setBotToken] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  if (!type) return null;

  const handleConnect = async () => {
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    try {
      if (type === "whatsapp") {
        if (!phone || !apiKey) { setError("Phone and API key required"); setLoading(false); return; }
        onConnect("whatsapp", { phone, apiKey });
      } else if (type === "telegram") {
        if (!botToken || !botToken.includes(":")) { setError("Invalid bot token format"); setLoading(false); return; }
        onConnect("telegram", { botToken });
      } else {
        onConnect(type, { mock: true });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 capitalize">Connect {type}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        {error && <ErrorBanner message={error} onClose={() => setError("")} />}
        {type === "whatsapp" && (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-800 text-sm p-3 rounded-lg">You need a Facebook Business Manager account and a number not registered on WhatsApp personal.</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Business API Key</label>
              <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none font-mono" placeholder="EAAG..." />
              <p className="text-xs text-gray-400 mt-1">Found in your Meta Developer Portal.</p>
            </div>
          </div>
        )}
        {type === "telegram" && (
          <div className="space-y-4">
            <div className="bg-sky-50 text-sky-800 text-sm p-3 rounded-lg">Create a bot via @BotFather on Telegram and paste the token below.</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
              <input value={botToken} onChange={(e) => setBotToken(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none font-mono" placeholder="123456:ABC-DEF..." />
            </div>
          </div>
        )}
        {(type === "instagram" || type === "facebook") && (
          <div className="space-y-3">
            <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg">We need permission to manage your Pages and read messages to automate replies.</div>
            <p className="text-sm text-gray-500">You will be redirected to {type === "instagram" ? "Instagram" : "Facebook"} to authorize Hypnate.</p>
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleConnect} disabled={loading}
            className={cn("flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2",
              type === "whatsapp" ? "bg-green-600 hover:bg-green-700"
              : type === "telegram" ? "bg-sky-500 hover:bg-sky-600"
              : "bg-blue-600 hover:bg-blue-700"
            )}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {type === "instagram" || type === "facebook" ? `Continue with ${type === "instagram" ? "Instagram" : "Facebook"}` : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const user     = useAuthStore((s) => s.user);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [completed,   setCompleted]   = useState<Set<number>>(new Set());
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const [businessForm, setBusinessForm] = useState<BusinessForm>({
    businessName: "", industry: "retail", size: "1-10", phone: "", gstNumber: "",
  });

  const [catalogRows, setCatalogRows] = useState<any[]>([]);
  const [csvText,     setCsvText]     = useState("");
  const [csvPreview,  setCsvPreview]  = useState<CsvPreview | null>(null);

  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    gateway: null, keyId: "", keySecret: "", merchantId: "", salt: "",
  });

  const [channels, setChannels] = useState<ChannelData>({
    whatsapp:  { connected: false, phone: "", apiKey: "" },
    instagram: { connected: false },
    facebook:  { connected: false },
    telegram:  { connected: false, botToken: "" },
  });
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const [autoProgress, setAutoProgress] = useState(0);
  const [autoTasks,    setAutoTasks]    = useState([
    { id: 1, label: "Syncing Product Catalog...",   done: false },
    { id: 2, label: "Configuring AI Chatbots...",   done: false },
    { id: 3, label: "Verifying Payment Keys...",    done: false },
    { id: 4, label: "Generating Store Links...",    done: false },
  ]);

  useEffect(() => {
    if (currentStep !== 5) return;
    const prog  = setInterval(() => setAutoProgress((p) => p >= 100 ? (clearInterval(prog), 100) : p + 1), 50);
    const tasks = setInterval(() => {
      setAutoTasks((prev) => {
        const i = prev.findIndex((t) => !t.done);
        if (i === -1) { clearInterval(tasks); return prev; }
        const next = [...prev]; next[i] = { ...next[i], done: true }; return next;
      });
    }, 1200);
    return () => { clearInterval(prog); clearInterval(tasks); };
  }, [currentStep]);

  const handleNext = async () => {
    setError("");
    setLoading(true);
    try {
      if (currentStep === 1) {
        if (!businessForm.businessName.trim()) { setError("Business name is required"); return; }
        await api.post("/api/onboarding/business", businessForm);
        setCompleted((s) => new Set(s).add(1));
        setCurrentStep(2);

      } else if (currentStep === 2) {
        if (csvText) await api.post("/api/onboarding/catalog", { csvData: csvText });
        setCompleted((s) => new Set(s).add(2));
        setCurrentStep(3);

      } else if (currentStep === 3) {
        if (paymentForm.gateway && paymentForm.gateway !== "cod") {
          const payload: any = { gateway: paymentForm.gateway };
          if (paymentForm.keyId)     payload.keyId     = paymentForm.keyId;
          if (paymentForm.keySecret) payload.keySecret = paymentForm.keySecret;
          if (paymentForm.merchantId) payload.merchantId = paymentForm.merchantId;
          if (paymentForm.salt)      payload.salt      = paymentForm.salt;
          if (paymentForm.keyId || paymentForm.merchantId) {
            await api.post("/api/onboarding/payments", payload);
          }
        } else if (paymentForm.gateway === "cod") {
          await api.post("/api/onboarding/payments", { gateway: "cod" });
        }
        setCompleted((s) => new Set(s).add(3));
        setCurrentStep(4);

      } else if (currentStep === 4) {
        const connected: any = {};
        if (channels.whatsapp.connected)  connected.whatsapp  = { phone: channels.whatsapp.phone, apiKey: channels.whatsapp.apiKey };
        if (channels.telegram.connected)  connected.telegram  = { botToken: channels.telegram.botToken };
        if (channels.instagram.connected) connected.instagram = {};
        if (channels.facebook.connected)  connected.facebook  = {};
        if (Object.keys(connected).length > 0) {
          await api.post("/api/onboarding/channels", { channels: connected });
        }
        setCompleted((s) => new Set(s).add(4));
        setCurrentStep(5);

      } else if (currentStep === 5) {
        await api.post("/api/onboarding/complete");
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-12 pb-12 px-4">
      <div className="w-full max-w-3xl">
        <StepIndicator current={currentStep} completed={completed} />

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 min-h-[460px] flex flex-col">
          <div className="flex-1">

            {currentStep === 1 && (
              <BusinessStep form={businessForm} onChange={setBusinessForm} error={error} onClear={() => setError("")} />
            )}

            {currentStep === 2 && (
              <CatalogStep
                preview={csvPreview}
                onFile={(rows, preview, raw) => { setCatalogRows(rows); setCsvPreview(preview); setCsvText(raw); }}
                onClear={() => { setCatalogRows([]); setCsvPreview(null); setCsvText(""); }}
                error={error} onErrorClear={() => setError("")}
              />
            )}

            {currentStep === 3 && (
              <PaymentsStep form={paymentForm} onChange={setPaymentForm} error={error} onClear={() => setError("")} />
            )}

            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Connect Channels</h2>
                  <p className="text-gray-500 mt-1">Link your social accounts to start selling.</p>
                </div>
                {error && <ErrorBanner message={error} onClose={() => setError("")} />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <ChannelCard name="WhatsApp" description="Connect Business API" connected={channels.whatsapp.connected}
                    icon={<MessageCircle className="w-6 h-6" />}
                    color={{ border: "border-green-500", bg: "bg-green-50", badge: "bg-green-500", icon: "bg-green-100 text-green-600" }}
                    onClick={() => !channels.whatsapp.connected && setActiveModal("whatsapp")} />
                  <ChannelCard name="Instagram" description="Connect DM Automation" connected={channels.instagram.connected}
                    icon={<Instagram className="w-6 h-6" />}
                    color={{ border: "border-pink-500", bg: "bg-pink-50", badge: "bg-pink-500", icon: "bg-pink-100 text-pink-600" }}
                    onClick={() => !channels.instagram.connected && setActiveModal("instagram")} />
                  <ChannelCard name="Facebook" description="Connect Messenger" connected={channels.facebook.connected}
                    icon={<Facebook className="w-6 h-6" />}
                    color={{ border: "border-blue-500", bg: "bg-blue-50", badge: "bg-blue-500", icon: "bg-blue-100 text-blue-600" }}
                    onClick={() => !channels.facebook.connected && setActiveModal("facebook")} />
                  <ChannelCard name="Telegram" description="Connect Bot" connected={channels.telegram.connected}
                    icon={<Send className="w-6 h-6" />}
                    color={{ border: "border-sky-500", bg: "bg-sky-50", badge: "bg-sky-500", icon: "bg-sky-100 text-sky-600" }}
                    onClick={() => !channels.telegram.connected && setActiveModal("telegram")} />
                </div>
                <p className="text-xs text-gray-400">You can connect channels later from Settings.</p>
              </div>
            )}

            {currentStep === 5 && (
              <div className="flex flex-col items-center justify-center h-full py-8 space-y-8 animate-in fade-in duration-300">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center relative z-10">
                    <Bot className="w-12 h-12 text-primary-600 animate-bounce" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-primary-500 opacity-20 animate-ping" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">Setting up your store</h2>
                  <p className="text-gray-500 mt-1">Hypnate AI is configuring your workspace...</p>
                </div>
                <div className="w-full max-w-md space-y-4">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300" style={{ width: `${autoProgress}%` }} />
                  </div>
                  <div className="space-y-3">
                    {autoTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 text-sm">
                        {task.done
                          ? <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600"><Check className="w-3 h-3" /></div>
                          : <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                        }
                        <span className={cn("transition-colors", task.done ? "text-gray-400 line-through" : "text-gray-700 font-medium")}>
                          {task.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-100 mt-6">
            {currentStep < 5 ? (
              <>
                <button
                  onClick={() => currentStep > 1 && setCurrentStep((c) => (c - 1) as Step)}
                  disabled={currentStep === 1}
                  className="px-5 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30"
                >
                  {currentStep === 1 ? "Cancel" : "← Back"}
                </button>
                <button
                  onClick={handleNext} disabled={loading}
                  className="flex items-center gap-2 px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <>Next Step <ChevronRight className="w-4 h-4" /></>}
                </button>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <button
                  onClick={handleNext} disabled={autoProgress < 100 || loading}
                  className="flex items-center gap-2 px-12 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" />
                    : autoProgress < 100 ? "Please wait..."
                    : <><Sparkles className="w-5 h-5" /> Launch Dashboard</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ChannelModal
        type={activeModal}
        onClose={() => setActiveModal(null)}
        onConnect={(type, data) => setChannels((prev) => ({ ...prev, [type]: { ...prev[type as keyof ChannelData], connected: true, ...data } }))}
      />
    </div>
  );
};