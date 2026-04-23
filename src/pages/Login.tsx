import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { Button } from "../components/ui/Button";
import { useTranslation } from "react-i18next";
import {
  Eye, EyeOff, ArrowLeft, Chrome,
  ShoppingBag, MessageCircle, TrendingUp,
  Check, Zap,
} from "lucide-react";

/* ─── Animated dashboard mockup for left panel ───────────────────────────── */
const DashboardMockup: React.FC = () => {
  const [step, setStep] = useState(0);
  const msgs = [
    { name: "Priya S.", text: "Do you have kurta in M?", time: "now", color: "#25d366" },
    { name: "Rahul V.", text: "I want 2 pieces of vase", time: "2m", color: "#60a5fa" },
    { name: "Anjali G.", text: "When will my order ship?", time: "5m", color: "#f97316" },
  ];
  const bars = [40, 60, 45, 72, 55, 85, 100];
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 3), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ background: "#1e293b", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 64px rgba(0,0,0,0.5)" }}>
      {/* titlebar */}
      <div style={{ background: "#0f172a", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "block" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "block" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "block" }} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>hypnate.in/dashboard</span>
      </div>
      {/* stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, padding: "10px 10px 0" }}>
        {[{ v: "₹24.8k", l: "Revenue", c: "#0d9488" }, { v: "12", l: "Orders", c: "#6366f1" }, { v: "7", l: "Chats", c: "#f59e0b" }].map(s => (
          <div key={s.l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: s.c, fontFamily: "'Outfit',sans-serif" }}>{s.v}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* chart */}
      <div style={{ padding: "8px 10px 4px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 8px 4px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>Revenue this week</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 42 }}>
            {bars.map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: "#0d9488", opacity: 0.25 + (h / 160), borderRadius: "2px 2px 0 0" }} />
            ))}
          </div>
        </div>
      </div>
      {/* live messages */}
      <div style={{ padding: "6px 10px 10px" }}>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".5px" }}>Live conversations</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{
              background: i === step ? "rgba(13,148,136,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${i === step ? "rgba(13,148,136,0.3)" : "rgba(255,255,255,0.05)"}`,
              borderRadius: 7, padding: "6px 8px", display: "flex", alignItems: "center", gap: 7,
              transition: "all 0.4s ease",
            }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: m.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: m.color, flexShrink: 0 }}>{m.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{m.name}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.text}</div>
              </div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{m.time}</div>
              {i === step && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#0d9488", flexShrink: 0, animation: "lp-pulse 1s ease-in-out infinite" }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Left panel feature pill ─────────────────────────────────────────────── */
const FeaturePill: React.FC<{ icon: React.ReactNode; text: string; delay: number }> = ({ icon, text, delay }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 100, padding: "7px 14px",
    animation: `lp-fadeup 0.6s ease ${delay}ms both`,
  }}>
    <div style={{ color: "#0d9488", display: "flex", alignItems: "center" }}>{icon}</div>
    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{text}</span>
  </div>
);

/* ─── Input component ─────────────────────────────────────────────────────── */
const Field: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}> = ({ label, value, onChange, type = "text", placeholder }) => (
  <div>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
    <input
      type={type} required value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "11px 14px",
        borderRadius: 10, border: "1.5px solid #e5e7eb",
        fontSize: 14, color: "#111827", background: "#fff",
        outline: "none", transition: "border-color 0.2s",
        boxSizing: "border-box",
      }}
      onFocus={e => (e.target.style.borderColor = "#0d9488")}
      onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
    />
  </div>
);

/* ─── Main component ─────────────────────────────────────────────────────── */
export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useAuthStore(s => s.login);
  const signup = useAuthStore(s => s.signup);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isSignup = location.pathname === "/signup";
  const API = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isSignup) {
        await signup(name, email, password, businessName, phone);
        navigate("/onboarding");
      } else {
        await login(email, password);
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!API) { setError("API not configured"); return; }
    window.location.href = `${API}/auth/google`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        @keyframes lp-fadeup { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes lp-fadein { from { opacity:0; } to { opacity:1; } }
        @keyframes lp-pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @keyframes lp-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .lp-input-focus:focus { border-color: #0d9488 !important; box-shadow: 0 0 0 3px rgba(13,148,136,0.12); }
        .lp-btn-google:hover  { background: #f9fafb !important; border-color: #d1d5db !important; }
        .lp-link:hover        { color: #0f766e !important; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", width: "100%", fontFamily: "'Outfit', sans-serif" }}>

        {/* ── BACK BUTTON ── */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "fixed", top: 18, left: 18, zIndex: 50,
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(255,255,255,0.9)", border: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            transition: "all 0.15s",
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={16} color="#374151" />
        </button>

        {/* ══ LEFT PANEL — dark brand ══════════════════════════════════════ */}
        <div style={{
          display: "none",
          width: "50%", background: "#07111e",
          flexDirection: "column", justifyContent: "space-between",
          padding: "52px 48px", position: "relative", overflow: "hidden",
        }}
          className="lg-left-panel"
        >
          {/* background blobs */}
          <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(13,148,136,0.18) 0%,transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -100, left: -100, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(234,88,12,0.08) 0%,transparent 65%)", pointerEvents: "none" }} />
          {/* dot grid */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

          {/* Logo */}
          <div style={{ position: "relative", animation: "lp-fadeup 0.6s ease both" }}>
            <img src="/assets/logo.svg" alt="Hypnate" style={{ height: 48 }} />
          </div>

          {/* Headline + mockup */}
          <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 32, padding: "40px 0" }}>
            <div style={{ animation: "lp-fadeup 0.6s 0.1s ease both" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(13,148,136,0.12)", border: "1px solid rgba(13,148,136,0.25)",
                borderRadius: 100, padding: "5px 14px", marginBottom: 16,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0d9488", display: "block", animation: "lp-pulse 1.5s ease-in-out infinite" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: ".6px" }}>Built for Indian D2C brands</span>
              </div>
              <h1 style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-1.2px", margin: 0 }}>
                Sell smarter.<br />
                <span style={{ color: "#0d9488" }}>Grow faster.</span>
              </h1>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 14, lineHeight: 1.65, maxWidth: 360 }}>
                Your AI agent handles WhatsApp orders, tracks inventory and collects payments — while you focus on your products.
              </p>
            </div>

            {/* Dashboard mockup */}
            <div style={{ animation: "lp-fadeup 0.7s 0.2s ease both, lp-float 5s 1s ease-in-out infinite" }}>
              <DashboardMockup />
            </div>
          </div>

          {/* Feature pills */}
          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 8 }}>
            <FeaturePill icon={<ShoppingBag size={13} />} text="Order management" delay={300} />
            <FeaturePill icon={<MessageCircle size={13} />} text="Unified inbox" delay={400} />
            <FeaturePill icon={<TrendingUp size={13} />} text="Live analytics" delay={500} />
            <FeaturePill icon={<Zap size={13} />} text="AI automation" delay={600} />
          </div>
        </div>

        {/* ══ RIGHT PANEL — auth form ══════════════════════════════════════ */}
        <div style={{
          flex: 1, background: "#f8fafc",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "32px 20px", minHeight: "100vh",
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "36px 36px",
            width: "100%", maxWidth: 420,
            border: "1px solid #f1f5f9",
            boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
            animation: "lp-fadeup 0.5s ease both",
          }}>

            {/* Mobile logo */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }} className="mobile-logo">
              <img src="/assets/logo.svg" alt="Hypnate" style={{ height: 36 }} />
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
                {isSignup ? "Create your account" : "Welcome back"}
              </h2>
              <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
                {isSignup
                  ? "Start your free store — no credit card needed."
                  : "Sign in to manage your store."}
              </p>
            </div>

            {/* Google button — login only */}
            {!isSignup && (
              <>
                <button
                  onClick={handleGoogleLogin}
                  className="lp-btn-google"
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 10, border: "1.5px solid #e5e7eb", borderRadius: 11, height: 46,
                    background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600,
                    color: "#374151", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s",
                    marginBottom: 16,
                  }}
                >
                  <Chrome size={17} color="#4285f4" />
                  Continue with Google
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
                  <span style={{ fontSize: 11, color: "#cbd5e1", fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 16, padding: "10px 14px", borderRadius: 10,
                background: "#fef2f2", border: "1px solid #fecaca",
                fontSize: 13, color: "#dc2626",
              }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {isSignup && (
                <>
                  <Field label="Full Name" value={name} onChange={setName} placeholder="e.g. Rahul Sharma" />
                  <Field label="Business Name" value={businessName} onChange={setBusinessName} placeholder="e.g. Rahul Fashion House" />
                  <Field label="Mobile No." value={phone} onChange={setPhone} placeholder="+91 98XXX XXXXX" type="tel" />
                </>
              )}

              <Field label="Email address" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />

              {/* Password field */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: "100%", padding: "11px 42px 11px 14px",
                      borderRadius: 10, border: "1.5px solid #e5e7eb",
                      fontSize: 14, color: "#111827", background: "#fff",
                      outline: "none", boxSizing: "border-box",
                      fontFamily: "'Outfit',sans-serif",
                    }}
                    onFocus={e => { e.target.style.borderColor = "#0d9488"; e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.12)"; }}
                    onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0,
                      display: "flex", alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {isSignup && (
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 5 }}>
                    Min 8 chars with uppercase, number &amp; special character
                  </p>
                )}
              </div>

              {/* Forgot password */}
              {!isSignup && (
                <div style={{ textAlign: "right", marginTop: -6 }}>
                  <Link to="/forgot-password" style={{ fontSize: 13, color: "#0d9488", textDecoration: "none", fontWeight: 600 }}
                    className="lp-link">
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%", height: 48, marginTop: 4,
                  background: isLoading ? "#94a3b8" : "#0d9488",
                  color: "#fff", border: "none", borderRadius: 12,
                  fontSize: 15, fontWeight: 800, cursor: isLoading ? "not-allowed" : "pointer",
                  fontFamily: "'Outfit',sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.15s, transform 0.1s",
                  letterSpacing: "-0.2px",
                }}
                onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = "#0f766e"; }}
                onMouseLeave={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = "#0d9488"; }}
                onMouseDown={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
              >
                {isLoading ? (
                  <div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "lp-spin 0.7s linear infinite" }} />
                ) : (
                  isSignup ? "Create My Store →" : "Sign In →"
                )}
              </button>
            </form>

            {/* Founding member badge for signup */}
            {isSignup && (
              <div style={{
                marginTop: 14, background: "#f0fdfa", border: "1px solid #ccfbf1",
                borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <Check size={11} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>Founding Member — Free Forever</div>
                  <div style={{ fontSize: 11, color: "#0f766e", marginTop: 1 }}>First 50 stores get lifetime free access. No credit card required.</div>
                </div>
              </div>
            )}

            {/* Toggle link */}
            <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
              {isSignup ? (
                <>Already have an account?{" "}
                  <Link to="/login" style={{ color: "#0d9488", fontWeight: 700, textDecoration: "none" }} className="lp-link">
                    Sign in
                  </Link>
                </>
              ) : (
                <>Don&apos;t have an account?{" "}
                  <Link to="/signup" style={{ color: "#0d9488", fontWeight: 700, textDecoration: "none" }} className="lp-link">
                    Create one free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Global styles for responsive left panel + spinner */}
      <style>{`
        @keyframes lp-spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          .lg-left-panel { display: flex !important; }
          .mobile-logo   { display: none !important; }
        }
      `}</style>
    </>
  );
};