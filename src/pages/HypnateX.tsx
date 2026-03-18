import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import api from "../lib/api";

/* --------------------------------------------------
 * TYPES
 * -------------------------------------------------- */
interface Theme {
  id: string;
  name: string;
  category: "fashion" | "food" | "electronics" | "beauty" | "general" | "furniture";
  previewBg: string;
  accentColor: string;
  previewLayout: "grid" | "editorial" | "minimal" | "bold" | "luxury";
  tags: string[];
}

type BuildStatus =
  | "idle"
  | "queued"
  | "QUEUED"
  | "GENERATING_PAGES"
  | "UPLOADING_PRODUCTS"
  | "APPLYING_THEME"
  | "DEPLOYING"
  | "DONE"
  | "FAILED"
  | "error";

/* --------------------------------------------------
 * STATIC THEMES (shown while API loads)
 * -------------------------------------------------- */
const STATIC_THEMES: Theme[] = [
  { id: "aurora",   name: "Aurora",   category: "fashion",     previewBg: "#0f0f1a", accentColor: "#a78bfa", previewLayout: "editorial", tags: [] },
  { id: "saffron",  name: "Saffron",  category: "food",        previewBg: "#fff7ed", accentColor: "#f97316", previewLayout: "bold",      tags: [] },
  { id: "slate",    name: "Slate",    category: "electronics", previewBg: "#0f172a", accentColor: "#38bdf8", previewLayout: "grid",      tags: [] },
  { id: "blossom",  name: "Blossom",  category: "beauty",      previewBg: "#fff1f2", accentColor: "#fb7185", previewLayout: "luxury",    tags: [] },
  { id: "verdant",  name: "Verdant",  category: "general",     previewBg: "#f0fdf4", accentColor: "#22c55e", previewLayout: "minimal",   tags: [] },
  { id: "obsidian", name: "Obsidian", category: "furniture",   previewBg: "#1c1917", accentColor: "#d4a867", previewLayout: "editorial", tags: [] },
  { id: "ivory",    name: "Ivory",    category: "fashion",     previewBg: "#fafaf9", accentColor: "#292524", previewLayout: "luxury",    tags: [] },
  { id: "citrus",   name: "Citrus",   category: "food",        previewBg: "#fefce8", accentColor: "#eab308", previewLayout: "bold",      tags: [] },
  { id: "midnight", name: "Midnight", category: "electronics", previewBg: "#020617", accentColor: "#6366f1", previewLayout: "grid",      tags: [] },
  { id: "coral",    name: "Coral",    category: "beauty",      previewBg: "#fff8f1", accentColor: "#ea580c", previewLayout: "minimal",   tags: [] },
  { id: "forest",   name: "Forest",   category: "general",     previewBg: "#14532d", accentColor: "#bbf7d0", previewLayout: "editorial", tags: [] },
  { id: "birch",    name: "Birch",    category: "furniture",   previewBg: "#fdf8f0", accentColor: "#92400e", previewLayout: "luxury",    tags: [] },
];

const CATEGORIES = ["all", "fashion", "food", "electronics", "beauty", "general", "furniture"] as const;

/* --------------------------------------------------
 * HELPERS
 * -------------------------------------------------- */
const normalizeStatus = (s: string): BuildStatus => {
  const map: Record<string, BuildStatus> = {
    QUEUED:             "QUEUED",
    GENERATING_PAGES:   "GENERATING_PAGES",
    UPLOADING_PRODUCTS: "UPLOADING_PRODUCTS",
    APPLYING_THEME:     "APPLYING_THEME",
    DEPLOYING:          "DEPLOYING",
    DONE:               "DONE",
    FAILED:             "FAILED",
  };
  return map[s] || "QUEUED";
};

const BUILD_STEPS = [
  { key: "QUEUED",             label: "Starting build..." },
  { key: "GENERATING_PAGES",   label: "AI generating pages & copy..." },
  { key: "UPLOADING_PRODUCTS", label: "Importing your product catalog..." },
  { key: "APPLYING_THEME",     label: "Applying selected theme..." },
  { key: "DEPLOYING",          label: "Deploying to your domain..." },
];

const STEP_ORDER = ["QUEUED","GENERATING_PAGES","UPLOADING_PRODUCTS","APPLYING_THEME","DEPLOYING","DONE"];

/* --------------------------------------------------
 * THEME PREVIEW CARD
 * -------------------------------------------------- */
const ThemePreview: React.FC<{ theme: Theme; selected: boolean; onClick: () => void }> = ({ theme, selected, onClick }) => {
  const isLight = theme.previewBg.startsWith("#f") || theme.previewBg.startsWith("#ff");
  const muted = isLight ? "#00000015" : "#ffffff15";

  return (
    <div onClick={onClick} style={{
      cursor: "pointer", borderRadius: "16px", overflow: "hidden",
      border: selected ? `2px solid ${theme.accentColor}` : "2px solid transparent",
      boxShadow: selected ? `0 0 0 4px ${theme.accentColor}22` : "0 2px 12px rgba(0,0,0,0.08)",
      transition: "all 0.2s ease",
      transform: selected ? "translateY(-4px)" : "translateY(0)",
      background: "#fff",
    }}>
      <div style={{ background: theme.previewBg, height: "160px", padding: "12px", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ width: "48px", height: "8px", borderRadius: "4px", background: theme.accentColor, opacity: 0.9 }} />
          <div style={{ display: "flex", gap: "6px" }}>
            {[1,2,3].map(i => <div key={i} style={{ width: "20px", height: "5px", borderRadius: "3px", background: muted }} />)}
          </div>
        </div>
        {theme.previewLayout === "bold" || theme.previewLayout === "editorial" ? (
          <div>
            <div style={{ width: "70%", height: "14px", borderRadius: "4px", background: theme.accentColor, marginBottom: "6px" }} />
            <div style={{ width: "50%", height: "8px", borderRadius: "4px", background: muted, marginBottom: "10px" }} />
            <div style={{ width: "60px", height: "22px", borderRadius: "6px", background: theme.accentColor }} />
          </div>
        ) : theme.previewLayout === "luxury" ? (
          <div style={{ textAlign: "center", paddingTop: "8px" }}>
            <div style={{ width: "40%", height: "6px", borderRadius: "4px", background: muted, margin: "0 auto 8px" }} />
            <div style={{ width: "60%", height: "16px", borderRadius: "4px", background: theme.accentColor, margin: "0 auto 8px" }} />
            <div style={{ width: "40px", height: "1px", background: muted, margin: "0 auto" }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
            {[1,2,3].map(i => <div key={i} style={{ aspectRatio: "1", borderRadius: "6px", background: i === 1 ? theme.accentColor + "60" : muted }} />)}
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px 12px", background: "#fff" }}>
        <div style={{ fontWeight: 600, fontSize: "14px", color: "#111", marginBottom: "2px" }}>{theme.name}</div>
        <div style={{ fontSize: "11px", color: "#888", textTransform: "capitalize" }}>{theme.category}</div>
        {selected && (
          <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "4px", color: theme.accentColor, fontSize: "12px", fontWeight: 600 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Selected
          </div>
        )}
      </div>
    </div>
  );
};

/* --------------------------------------------------
 * BUILD PROGRESS
 * -------------------------------------------------- */
const BuildProgress: React.FC<{
  status: BuildStatus;
  logs: string[];
  storeUrl?: string;
  error?: string;
  onRetry: () => void;
}> = ({ status, logs, storeUrl, error, onRetry }) => {
  const isDone   = status === "DONE";
  const isFailed = status === "FAILED" || status === "error";
  const currentIdx = STEP_ORDER.indexOf(status as string);

  return (
    <div style={{ maxWidth: "520px", margin: "0 auto", padding: "40px 0" }}>
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        {isDone ? (
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        ) : isFailed ? (
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 8v4m0 4h.01" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        ) : (
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "3px solid #e0e7ff", borderTopColor: "#6366f1", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
        )}
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px", color: "#111" }}>
          {isDone ? "Your store is live!" : isFailed ? "Build failed" : "Building your store..."}
        </h2>
        <p style={{ color: "#666", fontSize: "15px" }}>
          {isDone ? "Hypnate X has generated your website." : isFailed ? (error || "Something went wrong.") : "This usually takes 30–90 seconds."}
        </p>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        {BUILD_STEPS.map((step, idx) => {
          const isCompleted = currentIdx > idx;
          const isCurrent   = currentIdx === idx;
          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isCompleted ? "#dcfce7" : isCurrent ? "#e0e7ff" : "#f4f4f5",
                border: isCurrent ? "2px solid #6366f1" : "none",
                transition: "all 0.3s",
              }}>
                {isCompleted
                  ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : isCurrent
                  ? <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1", animation: "pulse 1s ease infinite" }} />
                  : <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#d1d5db" }} />
                }
              </div>
              <span style={{ fontSize: "14px", color: isCompleted ? "#16a34a" : isCurrent ? "#4338ca" : "#9ca3af", fontWeight: isCurrent ? 600 : 400 }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Live logs */}
      {logs.length > 0 && (
        <div style={{ background: "#0f172a", borderRadius: "10px", padding: "14px 16px", marginBottom: "24px", maxHeight: "140px", overflowY: "auto" }}>
          {logs.map((log, i) => (
            <div key={i} style={{ fontSize: "12px", color: "#94a3b8", fontFamily: "monospace", lineHeight: "1.8" }}>
              <span style={{ color: "#6366f1" }}>›</span> {log}
            </div>
          ))}
        </div>
      )}

      {/* Done card */}
      {isDone && storeUrl && (
        <div style={{ padding: "20px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "6px" }}>Your store is live at</p>
          <a href={storeUrl} target="_blank" rel="noreferrer"
            style={{ fontSize: "15px", fontWeight: 700, color: "#16a34a", textDecoration: "none", wordBreak: "break-all" }}>
            {storeUrl}
          </a>
          <div style={{ marginTop: "16px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <a href={storeUrl} target="_blank" rel="noreferrer"
              style={{ padding: "10px 20px", background: "#16a34a", color: "#fff", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
              View store
            </a>
            <button onClick={() => window.location.href = "/dashboard"}
              style={{ padding: "10px 20px", background: "#fff", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>
              Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Retry on failure */}
      {isFailed && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={onRetry}
            style={{ padding: "12px 28px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  );
};

/* --------------------------------------------------
 * MAIN PAGE
 * -------------------------------------------------- */
export const HypnateX: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  const [themes, setThemes]               = useState<Theme[]>(STATIC_THEMES);
  const [category, setCategory]           = useState<string>("all");
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [logoFile, setLogoFile]           = useState<File | null>(null);
  const [logoPreview, setLogoPreview]     = useState<string | null>(null);
  const [storeName, setStoreName]         = useState("");
  const [step, setStep]                   = useState<1 | 2 | 3>(1);

  // Build state
  const [buildStatus, setBuildStatus]   = useState<BuildStatus>("idle");
  const [buildLogs, setBuildLogs]       = useState<string[]>([]);
  const [storeUrl, setStoreUrl]         = useState<string | undefined>();
  const [buildError, setBuildError]     = useState<string | undefined>();
  const [jobId, setJobId]               = useState<number | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const filteredThemes = themes.filter(t => category === "all" || t.category === category);

  // Load themes from API
  useEffect(() => {
    api.get("/api/hypnate-x/themes")
      .then(res => { if (res.data?.length) setThemes(res.data); })
      .catch(() => {}); // fallback to static
  }, []);

  // Poll build status
  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const res = await api.get(`/api/hypnate-x/status/${jobId}`);
        const data = res.data;
        const normalized = normalizeStatus(data.status);

        setBuildStatus(normalized);

        // Update logs from buildLog array
        if (Array.isArray(data.logs)) {
          setBuildLogs(data.logs);
        }

        if (normalized === "DONE") {
          setStoreUrl(data.siteUrl || `https://${storeName.toLowerCase().replace(/\s+/g,"-")}.hypnate.in`);
          stopPolling();
        } else if (normalized === "FAILED") {
          setBuildError(data.error || "Build failed. Please try again.");
          stopPolling();
        }
      } catch (err) {
        console.error("[Poll] status check failed:", err);
      }
    };

    pollRef.current = setInterval(poll, 3000);
    poll(); // immediate first check

    return () => stopPolling();
  }, [jobId]);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  /* --------------------------------------------------
   * LOGO UPLOAD
   * -------------------------------------------------- */
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* --------------------------------------------------
   * START BUILD — real API call with polling
   * -------------------------------------------------- */
  const handleBuild = async () => {
    if (!selectedTheme || !user) return;

    setStep(3);
    setBuildStatus("QUEUED");
    setBuildLogs([]);
    setBuildError(undefined);
    setStoreUrl(undefined);
    setJobId(null);

    try {
      // Upload logo if provided
      let logoUrl: string | undefined;
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadRes = await api.post("/api/products/upload?mode=cloud", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        logoUrl = uploadRes.data?.url;
      }

      // Start build — api instance has withCredentials: true so cookie is sent
      const res = await api.post("/api/hypnate-x/build", {
        themeId: selectedTheme.id,
        storeName: storeName.trim() || user.name || "My Store",
        logoUrl: logoUrl ?? null,
      });

      // Start polling with the returned jobId
      setJobId(res.data.jobId);

    } catch (err: any) {
      setBuildStatus("error");
      setBuildError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to start build. Please try again."
      );
    }
  };

  const handleRetry = () => {
    setStep(2);
    setBuildStatus("idle");
    setBuildLogs([]);
    setBuildError(undefined);
    setStoreUrl(undefined);
    setJobId(null);
    stopPolling();
  };

  /* --------------------------------------------------
   * RENDER — Step 3: Building
   * -------------------------------------------------- */
  if (step === 3) {
    return (
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px" }}>
        <BuildProgress
          status={buildStatus}
          logs={buildLogs}
          storeUrl={storeUrl}
          error={buildError}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  /* --------------------------------------------------
   * RENDER — Step 1 & 2
   * -------------------------------------------------- */
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #1e1b4b 50%, #0f172a 100%)", padding: "48px 40px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, #6366f130 0%, transparent 70%)" }} />
        <div style={{ position: "relative", maxWidth: "800px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M9 3v12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="9" r="3" stroke="#fff" strokeWidth="1.5"/></svg>
            </div>
            <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "14px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Hypnate X</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "36px", fontWeight: 800, marginBottom: "10px", lineHeight: 1.2 }}>
            Build your store in <span style={{ color: "#a78bfa" }}>60 seconds</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "16px", maxWidth: "500px" }}>
            Pick a theme, upload your logo, and let AI build your complete website using your product catalog.
          </p>
          <div style={{ display: "flex", gap: "8px", marginTop: "28px", alignItems: "center" }}>
            {["Choose theme", "Add branding", "Build"].map((label, idx) => (
              <React.Fragment key={label}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: step > idx + 1 ? "#6366f1" : step === idx + 1 ? "#6366f1" : "#ffffff20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#fff" }}>
                    {step > idx + 1 ? "✓" : idx + 1}
                  </div>
                  <span style={{ fontSize: "13px", color: step === idx + 1 ? "#fff" : "#64748b", fontWeight: step === idx + 1 ? 600 : 400 }}>{label}</span>
                </div>
                {idx < 2 && <div style={{ width: "32px", height: "1px", background: "#ffffff20" }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

        {/* STEP 1 — Theme picker */}
        {step === 1 && (
          <>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  padding: "6px 16px", borderRadius: "999px", border: "1.5px solid",
                  borderColor: category === cat ? "#6366f1" : "#e2e8f0",
                  background: category === cat ? "#6366f1" : "#fff",
                  color: category === cat ? "#fff" : "#64748b",
                  fontSize: "13px", fontWeight: category === cat ? 600 : 400,
                  cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s",
                }}>{cat}</button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: "13px", color: "#9ca3af", alignSelf: "center" }}>
                {filteredThemes.length} themes
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
              {filteredThemes.map(theme => (
                <ThemePreview key={theme.id} theme={theme} selected={selectedTheme?.id === theme.id} onClick={() => setSelectedTheme(theme)} />
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "40px" }}>
              <button disabled={!selectedTheme} onClick={() => setStep(2)} style={{
                padding: "14px 32px",
                background: selectedTheme ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#e2e8f0",
                color: selectedTheme ? "#fff" : "#94a3b8",
                border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700,
                cursor: selectedTheme ? "pointer" : "not-allowed", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                {selectedTheme ? `Continue with ${selectedTheme.name}` : "Select a theme to continue"}
                {selectedTheme && <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
            </div>
          </>
        )}

        {/* STEP 2 — Branding */}
        {step === 2 && (
          <div style={{ maxWidth: "560px" }}>
            <button onClick={() => setStep(1)} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6366f1", background: "none", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "28px", padding: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to themes
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "28px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: selectedTheme?.previewBg, border: "1px solid #e2e8f0", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>Theme: {selectedTheme?.name}</div>
                <div style={{ fontSize: "12px", color: "#888", textTransform: "capitalize" }}>{selectedTheme?.category}</div>
              </div>
              <button onClick={() => setStep(1)} style={{ marginLeft: "auto", fontSize: "12px", color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Change</button>
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px", color: "#111" }}>Add your branding</h2>
            <p style={{ color: "#64748b", fontSize: "15px", marginBottom: "28px" }}>Upload your logo and set your store name. The AI will use your product catalog automatically.</p>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "#374151" }}>Store name</label>
              <input value={storeName} onChange={(e) => setStoreName(e.target.value)}
                placeholder={user?.name || "My Store"}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "15px", color: "#111", outline: "none", boxSizing: "border-box" }}
              />
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
                Your store will be at: <strong>{(storeName || "your-store").toLowerCase().replace(/\s+/g, "-")}.hypnate.in</strong>
              </p>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "#374151" }}>
                Logo <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
              </label>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: "none" }} />
              {logoPreview ? (
                <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1.5px solid #e2e8f0" }}>
                  <img src={logoPreview} alt="Logo" style={{ width: "64px", height: "64px", objectFit: "contain", borderRadius: "8px", background: "#fff", border: "1px solid #e2e8f0" }} />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>{logoFile?.name}</div>
                    <button onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                      style={{ fontSize: "13px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: "4px" }}>Remove</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => logoInputRef.current?.click()} style={{ padding: "32px", borderRadius: "10px", border: "2px dashed #e2e8f0", textAlign: "center", cursor: "pointer", background: "#fafafa", transition: "border-color 0.15s" }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = "#6366f1")}
                  onMouseOut={e => (e.currentTarget.style.borderColor = "#e2e8f0")}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ margin: "0 auto 10px", display: "block" }}><rect x="4" y="4" width="24" height="24" rx="6" stroke="#d1d5db" strokeWidth="1.5"/><path d="M16 20V12M12 16l4-4 4 4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>Click to upload logo</div>
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>PNG, SVG, JPG up to 2MB</div>
                </div>
              )}
            </div>

            <button onClick={handleBuild} style={{
              width: "100%", padding: "16px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", border: "none", borderRadius: "12px",
              fontSize: "16px", fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              boxShadow: "0 4px 20px #6366f140",
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              Build my store with AI
            </button>
            <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", marginTop: "12px" }}>
              AI will use your existing product catalog automatically
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HypnateX;