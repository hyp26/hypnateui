import React, { useState, useRef, useCallback } from "react";
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
  | "generating_pages"
  | "uploading_products"
  | "applying_theme"
  | "deploying"
  | "done"
  | "error";

/* --------------------------------------------------
 * MOCK THEMES (replace with API call)
 * -------------------------------------------------- */
const THEMES: Theme[] = [
  { id: "aurora",    name: "Aurora",    category: "fashion",     previewBg: "#0f0f1a", accentColor: "#a78bfa", previewLayout: "editorial", tags: ["dark", "luxury", "fashion"] },
  { id: "saffron",   name: "Saffron",   category: "food",        previewBg: "#fff7ed", accentColor: "#f97316", previewLayout: "bold",      tags: ["warm", "food", "vibrant"] },
  { id: "slate",     name: "Slate",     category: "electronics", previewBg: "#0f172a", accentColor: "#38bdf8", previewLayout: "grid",      tags: ["dark", "tech", "minimal"] },
  { id: "blossom",   name: "Blossom",   category: "beauty",      previewBg: "#fff1f2", accentColor: "#fb7185", previewLayout: "luxury",    tags: ["soft", "beauty", "pastel"] },
  { id: "verdant",   name: "Verdant",   category: "general",     previewBg: "#f0fdf4", accentColor: "#22c55e", previewLayout: "minimal",   tags: ["clean", "green", "fresh"] },
  { id: "obsidian",  name: "Obsidian",  category: "furniture",   previewBg: "#1c1917", accentColor: "#d4a867", previewLayout: "editorial", tags: ["dark", "premium", "warm"] },
  { id: "ivory",     name: "Ivory",     category: "fashion",     previewBg: "#fafaf9", accentColor: "#292524", previewLayout: "luxury",    tags: ["minimal", "editorial", "clean"] },
  { id: "citrus",    name: "Citrus",    category: "food",        previewBg: "#fefce8", accentColor: "#eab308", previewLayout: "bold",      tags: ["bright", "food", "playful"] },
  { id: "midnight",  name: "Midnight",  category: "electronics", previewBg: "#020617", accentColor: "#6366f1", previewLayout: "grid",      tags: ["dark", "futuristic", "tech"] },
  { id: "coral",     name: "Coral",     category: "beauty",      previewBg: "#fff8f1", accentColor: "#ea580c", previewLayout: "minimal",   tags: ["warm", "beauty", "modern"] },
  { id: "forest",    name: "Forest",    category: "general",     previewBg: "#14532d", accentColor: "#bbf7d0", previewLayout: "editorial", tags: ["dark", "nature", "bold"] },
  { id: "birch",     name: "Birch",     category: "furniture",   previewBg: "#fdf8f0", accentColor: "#92400e", previewLayout: "luxury",    tags: ["natural", "warm", "premium"] },
];

const CATEGORIES = ["all", "fashion", "food", "electronics", "beauty", "general", "furniture"] as const;

/* --------------------------------------------------
 * THEME PREVIEW CARD (mini mockup)
 * -------------------------------------------------- */
const ThemePreview: React.FC<{ theme: Theme; selected: boolean; onClick: () => void }> = ({
  theme, selected, onClick,
}) => {
  const isLight = theme.previewBg.startsWith("#f") || theme.previewBg.startsWith("#fff");

  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        borderRadius: "16px",
        overflow: "hidden",
        border: selected ? `2px solid ${theme.accentColor}` : "2px solid transparent",
        boxShadow: selected ? `0 0 0 4px ${theme.accentColor}22` : "0 2px 12px rgba(0,0,0,0.08)",
        transition: "all 0.2s ease",
        transform: selected ? "translateY(-4px)" : "translateY(0)",
        background: "#fff",
      }}
    >
      {/* Mini store preview */}
      <div style={{ background: theme.previewBg, height: "160px", position: "relative", overflow: "hidden", padding: "12px" }}>
        {/* Fake nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ width: "48px", height: "8px", borderRadius: "4px", background: theme.accentColor, opacity: 0.9 }} />
          <div style={{ display: "flex", gap: "6px" }}>
            {[1,2,3].map(i => <div key={i} style={{ width: "20px", height: "5px", borderRadius: "3px", background: isLight ? "#00000020" : "#ffffff20" }} />)}
          </div>
        </div>

        {/* Hero area */}
        {theme.previewLayout === "bold" || theme.previewLayout === "editorial" ? (
          <div>
            <div style={{ width: "70%", height: "14px", borderRadius: "4px", background: theme.accentColor, marginBottom: "6px" }} />
            <div style={{ width: "50%", height: "8px", borderRadius: "4px", background: isLight ? "#00000015" : "#ffffff15", marginBottom: "10px" }} />
            <div style={{ width: "60px", height: "22px", borderRadius: "6px", background: theme.accentColor }} />
          </div>
        ) : theme.previewLayout === "luxury" ? (
          <div style={{ textAlign: "center", paddingTop: "8px" }}>
            <div style={{ width: "40%", height: "6px", borderRadius: "4px", background: isLight ? "#00000025" : "#ffffff25", margin: "0 auto 8px" }} />
            <div style={{ width: "60%", height: "16px", borderRadius: "4px", background: theme.accentColor, margin: "0 auto 8px" }} />
            <div style={{ width: "40px", height: "1px", background: isLight ? "#00000040" : "#ffffff40", margin: "0 auto" }} />
          </div>
        ) : (
          // grid / minimal
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ aspectRatio: "1", borderRadius: "6px", background: i === 1 ? theme.accentColor + "60" : isLight ? "#00000010" : "#ffffff10" }} />
            ))}
          </div>
        )}
      </div>

      {/* Card footer */}
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
const BUILD_STEPS: { key: BuildStatus; label: string }[] = [
  { key: "queued",            label: "Starting build..." },
  { key: "generating_pages",  label: "AI generating pages & copy..." },
  { key: "uploading_products",label: "Importing your product catalog..." },
  { key: "applying_theme",    label: "Applying selected theme..." },
  { key: "deploying",         label: "Deploying to your domain..." },
  { key: "done",              label: "Your store is live! 🎉" },
];

const BuildProgress: React.FC<{ status: BuildStatus; storeUrl?: string; error?: string }> = ({
  status, storeUrl, error
}) => {
  const currentIdx = BUILD_STEPS.findIndex(s => s.key === status);

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "40px 0" }}>
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        {status === "done" ? (
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        ) : status === "error" ? (
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 8v4m0 4h.01" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        ) : (
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "3px solid #e0e7ff", borderTopColor: "#6366f1", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
        )}
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px", color: "#111" }}>
          {status === "done" ? "Your store is live!" : status === "error" ? "Build failed" : "Building your store..."}
        </h2>
        <p style={{ color: "#666", fontSize: "15px" }}>
          {status === "done" ? "Hypnate X has generated your website." : status === "error" ? error : "This usually takes 30–60 seconds."}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {BUILD_STEPS.filter(s => s.key !== "done").map((step, idx) => {
          const isCompleted = currentIdx > idx;
          const isCurrent = currentIdx === idx;
          const isPending = currentIdx < idx;

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

      {status === "done" && storeUrl && (
        <div style={{ marginTop: "32px", padding: "20px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Your store is live at</p>
          <a href={storeUrl} target="_blank" rel="noreferrer"
            style={{ fontSize: "15px", fontWeight: 700, color: "#16a34a", textDecoration: "none", wordBreak: "break-all" }}>
            {storeUrl}
          </a>
          <div style={{ marginTop: "16px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <a href={storeUrl} target="_blank" rel="noreferrer"
              style={{ padding: "10px 20px", background: "#16a34a", color: "#fff", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
              View store
            </a>
            <button
              onClick={() => window.location.href = "/dashboard"}
              style={{ padding: "10px 20px", background: "#fff", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>
              Go to dashboard
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
};

/* --------------------------------------------------
 * MAIN PAGE
 * -------------------------------------------------- */
export const HypnateX: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [category, setCategory] = useState<string>("all");
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [buildStatus, setBuildStatus] = useState<BuildStatus>("idle");
  const [storeUrl, setStoreUrl] = useState<string | undefined>();
  const [buildError, setBuildError] = useState<string | undefined>();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1=themes, 2=branding, 3=building

  const logoInputRef = useRef<HTMLInputElement>(null);

  const filteredThemes = THEMES.filter(t => category === "all" || t.category === category);

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
   * START BUILD
   * -------------------------------------------------- */
  const handleBuild = async () => {
    if (!selectedTheme || !user) return;
    setStep(3);
    setBuildStatus("queued");

    try {
      // Upload logo first if provided
      let logoUrl: string | undefined;
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadRes = await api.post("/api/products/upload?mode=cloud", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        logoUrl = uploadRes.data?.url;
      }

      // Simulate build steps (replace with real WebSocket polling)
      const steps: BuildStatus[] = [
        "generating_pages",
        "uploading_products",
        "applying_theme",
        "deploying",
        "done",
      ];

      // Submit build job to backend
      await api.post("/api/hypnate-x/build", {
        themeId: selectedTheme.id,
        logoUrl,
        storeName: storeName || user.name,
        sellerId: user.sellerId,
      });

      // Simulate step progression (replace with WebSocket)
      for (const s of steps) {
        await new Promise((res) => setTimeout(res, s === "done" ? 1500 : 4000));
        setBuildStatus(s);
        if (s === "done") {
          const slug = storeName.toLowerCase().replace(/\s+/g, "-") || `store-${user.id}`;
          setStoreUrl(`https://${slug}.hypnate.in`);
        }
      }
    } catch (err: any) {
      setBuildStatus("error");
      setBuildError(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  /* --------------------------------------------------
   * RENDER
   * -------------------------------------------------- */
  if (step === 3) {
    return (
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px" }}>
        <BuildProgress status={buildStatus} storeUrl={storeUrl} error={buildError} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>

      {/* Hero header */}
      <div style={{
        background: "linear-gradient(135deg, #0f0f1a 0%, #1e1b4b 50%, #0f172a 100%)",
        padding: "48px 40px 40px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, #6366f130 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-40px", left: "20%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, #a78bfa20 0%, transparent 70%)" }} />

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

          {/* Step indicator */}
          <div style={{ display: "flex", gap: "8px", marginTop: "28px", alignItems: "center" }}>
            {["Choose theme", "Add branding", "Build"].map((label, idx) => (
              <React.Fragment key={label}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "24px", height: "24px", borderRadius: "50%",
                    background: step > idx + 1 ? "#6366f1" : step === idx + 1 ? "#6366f1" : "#ffffff20",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 700, color: "#fff",
                  }}>
                    {step > idx + 1 ? "✓" : idx + 1}
                  </div>
                  <span style={{ fontSize: "13px", color: step === idx + 1 ? "#fff" : "#64748b", fontWeight: step === idx + 1 ? 600 : 400 }}>
                    {label}
                  </span>
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
            {/* Category filter */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "999px",
                    border: "1.5px solid",
                    borderColor: category === cat ? "#6366f1" : "#e2e8f0",
                    background: category === cat ? "#6366f1" : "#fff",
                    color: category === cat ? "#fff" : "#64748b",
                    fontSize: "13px",
                    fontWeight: category === cat ? 600 : 400,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.15s",
                  }}
                >
                  {cat}
                </button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: "13px", color: "#9ca3af", alignSelf: "center" }}>
                {filteredThemes.length} themes
              </span>
            </div>

            {/* Theme grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}>
              {filteredThemes.map(theme => (
                <ThemePreview
                  key={theme.id}
                  theme={theme}
                  selected={selectedTheme?.id === theme.id}
                  onClick={() => setSelectedTheme(theme)}
                />
              ))}
            </div>

            {/* Next CTA */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "40px" }}>
              <button
                disabled={!selectedTheme}
                onClick={() => setStep(2)}
                style={{
                  padding: "14px 32px",
                  background: selectedTheme ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#e2e8f0",
                  color: selectedTheme ? "#fff" : "#94a3b8",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: selectedTheme ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {selectedTheme ? `Continue with ${selectedTheme.name}` : "Select a theme to continue"}
                {selectedTheme && <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
            </div>
          </>
        )}

        {/* STEP 2 — Branding */}
        {step === 2 && (
          <div style={{ maxWidth: "560px" }}>
            <button
              onClick={() => setStep(1)}
              style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6366f1", background: "none", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "28px", padding: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to themes
            </button>

            {/* Selected theme badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "28px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: selectedTheme?.previewBg, border: "1px solid #e2e8f0", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>Theme: {selectedTheme?.name}</div>
                <div style={{ fontSize: "12px", color: "#888", textTransform: "capitalize" }}>{selectedTheme?.category}</div>
              </div>
              <button onClick={() => setStep(1)} style={{ marginLeft: "auto", fontSize: "12px", color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                Change
              </button>
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px", color: "#111" }}>Add your branding</h2>
            <p style={{ color: "#64748b", fontSize: "15px", marginBottom: "28px" }}>Upload your logo and set your store name. The AI will use your product catalog automatically.</p>

            {/* Store name */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "#374151" }}>
                Store name
              </label>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder={user?.name || "My Store"}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: "10px",
                  border: "1.5px solid #e2e8f0", fontSize: "15px", color: "#111",
                  outline: "none", boxSizing: "border-box",
                }}
              />
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
                Your store will be at: <strong>{(storeName || "your-store").toLowerCase().replace(/\s+/g, "-")}.hypnate.in</strong>
              </p>
            </div>

            {/* Logo upload */}
            <div style={{ marginBottom: "32px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "#374151" }}>
                Logo <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
              </label>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: "none" }} />

              {logoPreview ? (
                <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1.5px solid #e2e8f0" }}>
                  <img src={logoPreview} alt="Logo preview" style={{ width: "64px", height: "64px", objectFit: "contain", borderRadius: "8px", background: "#fff", border: "1px solid #e2e8f0" }} />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>{logoFile?.name}</div>
                    <button onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                      style={{ fontSize: "13px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: "4px" }}>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => logoInputRef.current?.click()}
                  style={{
                    padding: "32px", borderRadius: "10px", border: "2px dashed #e2e8f0",
                    textAlign: "center", cursor: "pointer", background: "#fafafa",
                    transition: "border-color 0.15s",
                  }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = "#6366f1")}
                  onMouseOut={e => (e.currentTarget.style.borderColor = "#e2e8f0")}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ margin: "0 auto 10px" }}><rect x="4" y="4" width="24" height="24" rx="6" stroke="#d1d5db" strokeWidth="1.5"/><path d="M16 20V12M12 16l4-4 4 4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>Click to upload logo</div>
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>PNG, SVG, JPG up to 2MB</div>
                </div>
              )}
            </div>

            {/* Build button */}
            <button
              onClick={handleBuild}
              style={{
                width: "100%", padding: "16px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", border: "none", borderRadius: "12px",
                fontSize: "16px", fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                boxShadow: "0 4px 20px #6366f140",
              }}
            >
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