import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import api from "../lib/api";
import { useAuthStore } from "../stores/useAuthStore";
import { hasPlanChannel, type PlanChannel } from "../config/planEntitlements";
import { OnboardingStepper } from "../components/onboarding/Onboardingstepper";
import { OnboardingFooter } from "../components/onboarding/OnboardingFooter";
import { BusinessStep } from "../components/onboarding/BusinessStep";
import { CatalogStep } from "../components/onboarding/CatalogStep";
import { PaymentsStep } from "../components/onboarding/PaymentsStep";
import { ChannelsStep } from "../components/onboarding/ChannelsStep";
import { ChannelModal } from "../components/onboarding/ChannelModal";
import { SummaryStep } from "../components/onboarding/SummaryStep";
import { SkipConfirmPopup } from "../components/onboarding/SkipConfirmPopup";
import "../styles/onboarding.css";
import "../styles/onboarding-compact.css";
import type {
  AutoTask, BusinessForm, ChannelData, ModalType, PaymentForm, Step,
} from "../types/onboarding";

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  // All new merchants receive the same 7-day Starter trial.
  // There is no paid-plan selection during onboarding.
  const effectivePlan = "starter" as const;

  const [currentStep, setCurrentStepRaw] = useState<Step>(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSkipPopup, setShowSkipPopup] = useState(false);

  // Prefilled from what was captured at signup, so the person never has to
  // retype their business name or mobile number.
  // NOTE: adjust these two field paths if your `/api/auth/profile` response
  // shapes them differently (e.g. `user.phone` vs `user.seller.phone`).
  const [businessForm, setBusinessForm] = useState<BusinessForm>({
    businessName: (user as any)?.seller?.businessName || "",
    industry: "retail",
    size: "1-10",
    mobileNo: (user as any)?.phone || (user as any)?.seller?.phone || "",
    gstNumber: "",
  });

  const [catalogFile, setCatalogFile] = useState<File | null>(null);
  const [catalogName, setCatalogName] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({ gateway: null, keyId: "", keySecret: "", merchantId: "", salt: "" });
  const [channels, setChannels] = useState<ChannelData>({
    whatsapp: { connected: false, phone: "", apiKey: "" },
    instagram: { connected: false },
    facebook: { connected: false },
    telegram: { connected: false, botToken: "" },
  });
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [autoProgress, setAutoProgress] = useState(0);
  const [autoTasks, setAutoTasks] = useState<AutoTask[]>([
    { id: 1, label: "Syncing Product Catalog...", done: false },
    { id: 2, label: "Configuring AI Chatbots...", done: false },
    { id: 3, label: "Verifying Payment Keys...", done: false },
    { id: 4, label: "Generating Store Links...", done: false },
  ]);

  // Clearing the error whenever the step changes (in either direction) stops
  // a stale banner from one step following the person into the next.
  const setCurrentStep = (updater: Step | ((c: Step) => Step)) => {
    setError("");
    setCurrentStepRaw(updater);
  };

  useEffect(() => {
    if (currentStep !== 5) return;
    const prog = setInterval(() => setAutoProgress((p) => { if (p >= 100) { clearInterval(prog); return 100; } return p + 1; }), 50);
    const tasks = setInterval(() => setAutoTasks((prev) => {
      const i = prev.findIndex((t) => !t.done);
      if (i === -1) { clearInterval(tasks); return prev; }
      const next = [...prev];
      next[i] = { ...next[i], done: true };
      return next;
    }), 1200);
    return () => { clearInterval(prog); clearInterval(tasks); };
  }, [currentStep]);

  const markCompleted = (step: number) => {
    setCompleted((s) => new Set(s).add(step));
    setSkipped((s) => { const n = new Set(s); n.delete(step); return n; });
  };

  const markSkipped = (step: number) => {
    setSkipped((s) => new Set(s).add(step));
    setCompleted((s) => { const n = new Set(s); n.delete(step); return n; });
  };

  const handleNext = async () => {
    setError("");
    setLoading(true);
    try {
      if (currentStep === 1) {
        if (!businessForm.businessName.trim()) { setError("Business name is required"); return; }
        if (!businessForm.mobileNo.trim()) { setError("Mobile number is required"); return; }
        await api.post("/api/onboarding/business", {
          ...businessForm,
          phone: businessForm.mobileNo,
          selectedPlan: "starter",
        });

        if (user) {
          setUser({
            ...user,
            seller: { ...user.seller, selectedPlan: "starter" },
          });
        }

        markCompleted(1);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        if (catalogFile) {
          const fd = new FormData();
          fd.append("file", catalogFile);
          await api.post("/api/onboarding/catalog-file", fd, { headers: { "Content-Type": "multipart/form-data" } });
        }
        markCompleted(2);
        setCurrentStep(3);
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
        markCompleted(3);
        setCurrentStep(4);
      } else if (currentStep === 4) {
        const connected: any = {};
        if (channels.whatsapp.connected) connected.whatsapp = { phone: channels.whatsapp.phone, apiKey: channels.whatsapp.apiKey };
        if (channels.telegram.connected) connected.telegram = { botToken: channels.telegram.botToken };
        if (channels.instagram.connected && hasPlanChannel(effectivePlan, "instagram")) connected.instagram = {};
        if (channels.facebook.connected && hasPlanChannel(effectivePlan, "facebook")) connected.facebook = {};
        if (Object.keys(connected).length > 0) await api.post("/api/onboarding/channels", { channels: connected });
        markCompleted(4);
        setCurrentStep(5);
      } else if (currentStep === 5) {
        if (skipped.size > 0) { setShowSkipPopup(true); return; }
        await api.post("/api/onboarding/complete");
        await useAuthStore.getState().loadProfile();
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => { markSkipped(currentStep); setCurrentStep((c) => Math.min(c + 1, 5) as Step); };
  const handlePopupContinue = async () => { setShowSkipPopup(false); await api.post("/api/onboarding/complete"); await useAuthStore.getState().loadProfile(); navigate("/dashboard", { replace: true }); };
  const handlePopupComplete = () => {
    setShowSkipPopup(false);
    const first = [1, 2, 3, 4].find((s) => skipped.has(s));
    if (first) setCurrentStep(first as Step);
  };

  return (
    <>
      <div className="ob-root ob-single-screen" style={{ background: "linear-gradient(160deg,#f0fdfa 0%,#f8fafc 40%,#f5f3ff 100%)" }}>
        <div className="ob-wrap">
          <div className="ob-inner">
            <div className="ob-page-header">
              <div>
                <h1 style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.5px" }}>Store Setup</h1>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Complete all steps to launch your Hypnate store</p>
              </div>
              <div style={{ padding: "5px 12px", background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.2)", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#0d9488", whiteSpace: "nowrap", flexShrink: 0 }}>
                Step {currentStep} of 5
              </div>
            </div>

            <section className="ob-trial-banner" aria-label="Free trial information">
              <div>
                <strong>Start your 7-day free trial</strong>
                <p>No charges and no credit card are required during the trial.</p>
              </div>
              <span>7 DAYS FREE</span>
            </section>

            <OnboardingStepper current={currentStep} completed={completed} skipped={skipped} />

            <div className="ob-card">
              <div className="ob-step-content">
              {currentStep === 1 && (
                <BusinessStep form={businessForm} onChange={setBusinessForm} error={error} onClear={() => setError("")} />
              )}
              {currentStep === 2 && (
                <CatalogStep
                  fileName={catalogName}
                  onFile={(name, file) => { setCatalogName(name); setCatalogFile(file); }}
                  onClear={() => { setCatalogName(null); setCatalogFile(null); }}
                  error={error}
                  onErrorClear={() => setError("")}
                />
              )}
              {currentStep === 3 && (
                <PaymentsStep form={paymentForm} onChange={setPaymentForm} error={error} onClear={() => setError("")} />
              )}
              {currentStep === 4 && (
                <ChannelsStep channels={channels} error={error} onClear={() => setError("")} onOpenChannel={(channel) => {
                  const plan = effectivePlan;

                  if (channel && plan && !hasPlanChannel(plan, channel as PlanChannel)) {
                    const channelName =
                      channel.charAt(0).toUpperCase() + channel.slice(1);

                    setError(`${channelName} requires the Pro plan or above.`);
                    return;
                  }

                  setActiveModal(channel);
                }} />
              )}
              {currentStep === 5 && (
                <SummaryStep completed={completed} skipped={skipped} autoProgress={autoProgress} autoTasks={autoTasks} />
              )}
              </div>

              {currentStep < 5 ? (
                <OnboardingFooter
                  onBack={currentStep > 1 ? () => setCurrentStep((c) => (c - 1) as Step) : undefined}
                  onSkip={currentStep > 1 ? handleSkip : undefined}
                  onNext={handleNext}
                  loading={loading}
                  showBack={currentStep > 1}
                  showSkip={currentStep > 1}
                />
              ) : (
                <div className="ob-launch-footer" style={{ display: "flex", justifyContent: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={autoProgress < 100 || loading}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "14px 40px",
                      background: autoProgress < 100 ? "#cbd5e1" : "linear-gradient(135deg,#0d9488,#0f766e)",
                      color: "#fff", borderRadius: 14, fontWeight: 800, fontSize: 15, border: "none",
                      cursor: autoProgress < 100 ? "not-allowed" : "pointer", transition: "all 0.3s",
                      boxShadow: autoProgress >= 100 ? "0 8px 28px rgba(13,148,136,0.35)" : "none",
                      fontFamily: "inherit", letterSpacing: "-0.2px",
                    }}
                  >
                    {loading ? (
                      <Loader2 size={17} style={{ animation: "spin 0.7s linear infinite" }} />
                    ) : autoProgress < 100 ? (
                      "Please wait..."
                    ) : (
                      <>
                        <Sparkles size={17} /> Launch Dashboard
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {activeModal && (
        <div
          className="ob-modal-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
        >
          <ChannelModal
            type={activeModal}
            onClose={() => setActiveModal(null)}
            onConnect={(type, data) => setChannels((prev) => ({ ...prev, [type]: { ...prev[type as keyof ChannelData], connected: true, ...data } }))}
          />
        </div>
      )}

      {showSkipPopup && (
        <SkipConfirmPopup
          skippedSteps={[1, 2, 3, 4].filter((s) => skipped.has(s))}
          onContinue={handlePopupContinue}
          onComplete={handlePopupComplete}
        />
      )}
    </>
  );
};