import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, ChevronRight, Building2, Upload, CreditCard,
  Share2, MessageCircle, Instagram, Facebook, Send,
  Loader2, Sparkles, Bot, Lock, AlertCircle, X,
  FileText, Eye, EyeOff,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuthStore } from "../stores/useAuthStore";
import api from "../lib/api";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type Step = 1 | 2 | 3 | 4 | 5;

interface BusinessForm {
  businessName: string;
  industry: string;
  size: string;
  phone: string;
  gstNumber: string;
}

interface PaymentForm {
  keyId: string;
  keySecret: string;
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
   STEP CONFIG
───────────────────────────────────────────── */
const STEPS = [
  { id: 1, title: "Business Info", icon: Building2 },
  { id: 2, title: "Catalog",       icon: Upload },
  { id: 3, title: "Payments",      icon: CreditCard },
  { id: 4, title: "Channels",      icon: Share2 },
  { id: 5, title: "AI Setup",      icon: Sparkles },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const parseCsvText = (text: string): { headers: string[]; rows: string[][]; total: number } => {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [], total: 0 };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const rows = lines
    .slice(1, 6)
    .map((l) => l.split(",").map((c) => c.trim().replace(/"/g, "")));
  return { headers, rows, total: lines.length - 1 };
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
    <button onClick={onClose}><X className="w-4 h-4 text-red-400" /></button>
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
  const set = (key: keyof BusinessForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...form, [key]: e.target.value });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tell us about your business</h2>
        <p className="text-gray-500 mt-1">We need some basic details to set up your store.</p>
      </div>
      {error && <ErrorBanner message={error} onClose={onClear} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            value={form.businessName}
            onChange={set("businessName")}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="e.g. Sameer CS Associates"
          />
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
          <input
            value={form.phone}
            onChange={set("phone")}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="+91 98765 43210"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GST Number <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            value={form.gstNumber}
            onChange={set("gstNumber")}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none font-mono uppercase"
            placeholder="22AAAAA0000A1Z5"
            maxLength={15}
          />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP 2 — CATALOG UPLOAD
───────────────────────────────────────────── */
const CatalogStep: React.FC<{
  csvText: string;
  preview: CsvPreview | null;
  onFile: (text: string, preview: CsvPreview) => void;
  onClear: () => void;
  error: string;
  onErrorClear: () => void;
}> = ({ csvText, preview, onFile, onClear, error, onErrorClear }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["text/csv", "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!allowed.includes(file.type) && !file.name.endsWith(".csv")) {
      onErrorClear();
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCsvText(text);
      onFile(text, parsed);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add your products</h2>
        <p className="text-gray-500 mt-1">Upload a CSV with your product catalog.</p>
      </div>
      {error && <ErrorBanner message={error} onClose={onErrorClear} />}

      {!preview ? (
        <>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const text = ev.target?.result as string;
                  onFile(text, parseCsvText(text));
                };
                reader.readAsText(file);
              }
            }}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 hover:border-primary-400 transition-all cursor-pointer group mt-4"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
            <p className="font-semibold text-gray-900 text-lg">Click to upload CSV</p>
            <p className="text-sm text-gray-500 mt-1">or drag and drop your catalog file here</p>
            <p className="text-xs text-gray-400 mt-4">Supported formats: .csv — Max 500 products</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />

          {/* CSV format hint */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-800 mb-2">Required CSV format:</p>
            <code className="text-xs text-blue-700 font-mono">
              name, price, description, category, stock, image_url
            </code>
            <p className="text-xs text-blue-600 mt-1">Only <strong>name</strong> and <strong>price</strong> are required.</p>
          </div>

          <button
            onClick={() => {
              const csv = `name,price,description,category,stock,image_url\nSample Product,499,A great product,Retail,100,`;
              const blob = new Blob([csv], { type: "text/csv" });
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement("a");
              a.href = url; a.download = "sample_catalog.csv"; a.click();
            }}
            className="text-sm text-primary-600 hover:underline flex items-center gap-1"
          >
            <FileText className="w-4 h-4" /> Download sample CSV template
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

          {/* Preview table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="text-xs w-full">
              <thead>
                <tr className="bg-gray-50">
                  {preview.headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600 capitalize">{h}</th>
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
              <p className="text-xs text-gray-400 text-center py-2">
                Showing 5 of {preview.total} rows
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP 3 — PAYMENTS
───────────────────────────────────────────── */
const PaymentsStep: React.FC<{
  form: PaymentForm;
  onChange: (f: PaymentForm) => void;
  error: string;
  onClear: () => void;
  skipped: boolean;
  onSkip: () => void;
}> = ({ form, onChange, error, onClear, skipped, onSkip }) => {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Setup Payments</h2>
        <p className="text-gray-500 mt-1">Enter your Razorpay API keys to accept payments.</p>
      </div>
      {error && <ErrorBanner message={error} onClose={onClear} />}

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
        <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Secure Integration</p>
          <p className="mt-0.5">Your keys are encrypted and stored securely. We never share them.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Key ID</label>
          <input
            value={form.keyId}
            onChange={(e) => onChange({ ...form, keyId: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none font-mono"
            placeholder="rzp_live_... or rzp_test_..."
          />
          {form.keyId && !form.keyId.startsWith("rzp_") && (
            <p className="text-xs text-red-500 mt-1">Key ID must start with rzp_</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Key Secret</label>
          <div className="relative">
            <input
              type={showSecret ? "text" : "password"}
              value={form.keySecret}
              onChange={(e) => onChange({ ...form, keySecret: e.target.value })}
              className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none font-mono"
              placeholder="••••••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowSecret((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <a
          href="https://dashboard.razorpay.com/app/keys"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary-600 hover:underline"
        >
          Get your Razorpay API keys →
        </a>
      </div>

      {!skipped && (
        <button onClick={onSkip} className="text-sm text-gray-400 hover:text-gray-600 block">
          Skip for now — I'll set this up later
        </button>
      )}
      {skipped && (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <AlertCircle className="w-4 h-4" /> Payment setup skipped
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   CHANNEL CARD
───────────────────────────────────────────── */
interface ChannelCardProps {
  name: string;
  description: string;
  connected: boolean;
  icon: React.ReactNode;
  color: { border: string; bg: string; badge: string; icon: string };
  onClick: () => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ name, description, connected, icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      "p-6 rounded-xl border-2 cursor-pointer transition-all relative group",
      connected
        ? `${color.border} ${color.bg}`
        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
    )}
  >
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

/* ─────────────────────────────────────────────
   CHANNEL MODALS
───────────────────────────────────────────── */
type ModalType = "whatsapp" | "instagram" | "facebook" | "telegram" | null;

const ChannelModal: React.FC<{
  type: ModalType;
  onClose: () => void;
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
    await new Promise((r) => setTimeout(r, 800)); // simulate validation
    try {
      if (type === "whatsapp") {
        if (!phone || !apiKey) { setError("Phone and API key required"); return; }
        onConnect("whatsapp", { phone, apiKey });
      } else if (type === "telegram") {
        if (!botToken || !botToken.includes(":")) { setError("Invalid bot token format"); return; }
        onConnect("telegram", { botToken });
      } else if (type === "instagram" || type === "facebook") {
        // OAuth redirect — in production redirect to Meta OAuth
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
            <div className="bg-green-50 text-green-800 text-sm p-3 rounded-lg">
              You need a valid Facebook Business Manager account and a phone number not currently registered on WhatsApp personal app.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-green-500"
                placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Business API Key</label>
              <input value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-green-500 font-mono"
                placeholder="EAAG..." />
              <p className="text-xs text-gray-400 mt-1">Found in your Meta Developer Portal.</p>
            </div>
          </div>
        )}

        {type === "telegram" && (
          <div className="space-y-4">
            <div className="bg-sky-50 text-sky-800 text-sm p-3 rounded-lg">
              Create a new bot via @BotFather on Telegram and paste the API Token below.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
              <input value={botToken} onChange={(e) => setBotToken(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                placeholder="123456:ABC-DEF1234..." />
            </div>
          </div>
        )}

        {(type === "instagram" || type === "facebook") && (
          <div className="space-y-4">
            <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg">
              We need permission to manage your Pages and read messages to automate replies.
            </div>
            <p className="text-sm text-gray-500">You will be redirected to {type === "instagram" ? "Instagram" : "Facebook"} to authorize Hypnate.</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleConnect} disabled={loading}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2",
              type === "whatsapp"   ? "bg-green-600 hover:bg-green-700"
              : type === "telegram" ? "bg-sky-500 hover:bg-sky-600"
              : "bg-blue-600 hover:bg-blue-700"
            )}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {type === "instagram" || type === "facebook"
              ? `Continue with ${type === "instagram" ? "Instagram" : "Facebook"}`
              : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export const Onboarding: React.FC = () => {
  const navigate  = useNavigate();
  const user      = useAuthStore((s) => s.user);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [completed,   setCompleted]   = useState<Set<number>>(new Set());
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  // Step 1
  const [businessForm, setBusinessForm] = useState<BusinessForm>({
    businessName: "", industry: "retail", size: "1-10", phone: "", gstNumber: "",
  });

  // Step 2
  const [csvText,    setCsvText]    = useState("");
  const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);

  // Step 3
  const [paymentForm,   setPaymentForm]   = useState<PaymentForm>({ keyId: "", keySecret: "" });
  const [paymentSkipped, setPaymentSkipped] = useState(false);

  // Step 4
  const [channels, setChannels] = useState<ChannelData>({
    whatsapp:  { connected: false, phone: "", apiKey: "" },
    instagram: { connected: false },
    facebook:  { connected: false },
    telegram:  { connected: false, botToken: "" },
  });
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Step 5
  const [autoProgress, setAutoProgress] = useState(0);
  const [autoTasks,    setAutoTasks]    = useState([
    { id: 1, label: "Syncing Product Catalog...",   done: false },
    { id: 2, label: "Configuring AI Chatbots...",   done: false },
    { id: 3, label: "Verifying Payment Keys...",    done: false },
    { id: 4, label: "Generating Store Links...",    done: false },
  ]);

  // Load seller name into business form
  useEffect(() => {
    if (user?.name && !businessForm.businessName) {
      setBusinessForm((f) => ({ ...f, businessName: f.businessName || "" }));
    }
  }, [user]);

  // Auto-progress animation on step 5
  useEffect(() => {
    if (currentStep !== 5) return;
    let prog: ReturnType<typeof setInterval>;
    prog = setInterval(() => setAutoProgress((p) => p >= 100 ? (clearInterval(prog), 100) : p + 1), 50);
    const tasks = setInterval(() => {
      setAutoTasks((prev) => {
        const i = prev.findIndex((t) => !t.done);
        if (i === -1) { clearInterval(tasks); return prev; }
        const next = [...prev]; next[i] = { ...next[i], done: true }; return next;
      });
    }, 1200);
    return () => { clearInterval(prog); clearInterval(tasks); };
  }, [currentStep]);

  /* ── SAVE + ADVANCE ── */
  const handleNext = async () => {
    setError("");
    setLoading(true);
    try {
      if (currentStep === 1) {
        if (!businessForm.businessName.trim()) {
          setError("Business name is required"); return;
        }
        await api.post("/api/onboarding/business", businessForm);
        setCompleted((s) => new Set(s).add(1));
        setCurrentStep(2);

      } else if (currentStep === 2) {
        if (csvPreview && csvText) {
          await api.post("/api/onboarding/catalog", { csvData: csvText });
        }
        // CSV is optional — can skip
        setCompleted((s) => new Set(s).add(2));
        setCurrentStep(3);

      } else if (currentStep === 3) {
        if (!paymentSkipped) {
          if (paymentForm.keyId && paymentForm.keySecret) {
            await api.post("/api/onboarding/payments", paymentForm);
          }
        }
        setCompleted((s) => new Set(s).add(3));
        setCurrentStep(4);

      } else if (currentStep === 4) {
        const connectedChannels: any = {};
        if (channels.whatsapp.connected)  connectedChannels.whatsapp  = { phone: channels.whatsapp.phone, apiKey: channels.whatsapp.apiKey };
        if (channels.telegram.connected)  connectedChannels.telegram  = { botToken: channels.telegram.botToken };
        if (channels.instagram.connected) connectedChannels.instagram = {};
        if (channels.facebook.connected)  connectedChannels.facebook  = {};

        if (Object.keys(connectedChannels).length > 0) {
          await api.post("/api/onboarding/channels", { channels: connectedChannels });
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

  const handleChannelConnect = (type: string, data: any) => {
    setChannels((prev) => ({
      ...prev,
      [type]: { ...prev[type as keyof ChannelData], connected: true, ...data },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-12 pb-12 px-4">
      <div className="w-full max-w-3xl">
        <StepIndicator current={currentStep} completed={completed} />

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 min-h-[460px] flex flex-col">
          <div className="flex-1">

            {currentStep === 1 && (
              <BusinessStep
                form={businessForm}
                onChange={setBusinessForm}
                error={error}
                onClear={() => setError("")}
              />
            )}

            {currentStep === 2 && (
              <CatalogStep
                csvText={csvText}
                preview={csvPreview}
                onFile={(text, preview) => { setCsvText(text); setCsvPreview(preview); }}
                onClear={() => { setCsvText(""); setCsvPreview(null); }}
                error={error}
                onErrorClear={() => setError("")}
              />
            )}

            {currentStep === 3 && (
              <PaymentsStep
                form={paymentForm}
                onChange={setPaymentForm}
                error={error}
                onClear={() => setError("")}
                skipped={paymentSkipped}
                onSkip={() => { setPaymentSkipped(true); setError(""); }}
              />
            )}

            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Connect Channels</h2>
                  <p className="text-gray-500 mt-1">Link your social accounts to start selling.</p>
                </div>
                {error && <ErrorBanner message={error} onClose={() => setError("")} />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <ChannelCard
                    name="WhatsApp" description="Connect Business API"
                    connected={channels.whatsapp.connected}
                    icon={<MessageCircle className="w-6 h-6" />}
                    color={{ border: "border-green-500", bg: "bg-green-50", badge: "bg-green-500", icon: "bg-green-100 text-green-600" }}
                    onClick={() => channels.whatsapp.connected ? null : setActiveModal("whatsapp")}
                  />
                  <ChannelCard
                    name="Instagram" description="Connect DM Automation"
                    connected={channels.instagram.connected}
                    icon={<Instagram className="w-6 h-6" />}
                    color={{ border: "border-pink-500", bg: "bg-pink-50", badge: "bg-pink-500", icon: "bg-pink-100 text-pink-600" }}
                    onClick={() => channels.instagram.connected ? null : setActiveModal("instagram")}
                  />
                  <ChannelCard
                    name="Facebook" description="Connect Messenger"
                    connected={channels.facebook.connected}
                    icon={<Facebook className="w-6 h-6" />}
                    color={{ border: "border-blue-500", bg: "bg-blue-50", badge: "bg-blue-500", icon: "bg-blue-100 text-blue-600" }}
                    onClick={() => channels.facebook.connected ? null : setActiveModal("facebook")}
                  />
                  <ChannelCard
                    name="Telegram" description="Connect Bot"
                    connected={channels.telegram.connected}
                    icon={<Send className="w-6 h-6" />}
                    color={{ border: "border-sky-500", bg: "bg-sky-50", badge: "bg-sky-500", icon: "bg-sky-100 text-sky-600" }}
                    onClick={() => channels.telegram.connected ? null : setActiveModal("telegram")}
                  />
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
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                      style={{ width: `${autoProgress}%` }}
                    />
                  </div>
                  <div className="space-y-3">
                    {autoTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 text-sm">
                        {task.done
                          ? <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                              <Check className="w-3 h-3" />
                            </div>
                          : <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                        }
                        <span className={cn(
                          "transition-colors",
                          task.done ? "text-gray-400 line-through" : "text-gray-700 font-medium"
                        )}>{task.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
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
                  onClick={handleNext}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    : <>Next Step <ChevronRight className="w-4 h-4" /></>
                  }
                </button>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <button
                  onClick={handleNext}
                  disabled={autoProgress < 100 || loading}
                  className="flex items-center gap-2 px-12 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50"
                >
                  {loading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : autoProgress < 100
                    ? "Please wait..."
                    : <><Sparkles className="w-5 h-5" /> Launch Dashboard</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ChannelModal
        type={activeModal}
        onClose={() => setActiveModal(null)}
        onConnect={handleChannelConnect}
      />
    </div>
  );
};