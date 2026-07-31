import React, { useState } from "react";
import {
    ChevronRight, CreditCard, ExternalLink, Eye, EyeOff, ArrowRight, Check, Lock, Truck,
} from "lucide-react";
import { StepField } from "./StepField";
import { ErrorBanner } from "./ErrorBanner";
import { inputStyle, fi, fo } from "./formStyles";
import { GATEWAYS } from "../../data/gateways";
import type { PaymentForm } from "../../types/onboarding";

interface PaymentsStepProps {
    form: PaymentForm;
    onChange: (form: PaymentForm) => void;
    error: string;
    onClear: () => void;
}

export const PaymentsStep: React.FC<PaymentsStepProps> = ({ form, onChange, error, onClear }) => {
    const [showGuide, setShowGuide] = useState(false);
    const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
    const selectedGw = GATEWAYS.find((g) => g.id === form.gateway);

    // Same stale-error fix as the other steps: picking a gateway or editing a
    // key/secret field clears any leftover error from a previous save attempt.
    const selectGateway = (gatewayId: PaymentForm["gateway"]) => {
        if (error) onClear();
        onChange({ gateway: gatewayId, keyId: "", keySecret: "", merchantId: "", salt: "" });
    };

    const setField = (key: string, value: string) => {
        if (error) onClear();
        onChange({ ...form, [key]: value });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 24px rgba(245,158,11,0.25)" }}>
                    <CreditCard size={22} color="#fff" />
                </div>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.3px" }}>Setup Payments</h2>
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Choose how you want to accept payments from customers.</p>
                </div>
            </div>

            {error && <ErrorBanner error={error} onClear={onClear} />}

            {!form.gateway ? (
                <div className="ob-gw-grid">
                    {GATEWAYS.map((gw) => (
                        <button
                            key={String(gw.id)}
                            onClick={() => selectGateway(gw.id)}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px", borderRadius: 14, border: "1.5px solid #f1f5f9", background: "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", fontFamily: "inherit", width: "100%" }}
                            onMouseEnter={(e) => { const b = e.currentTarget; b.style.borderColor = "#0d9488"; b.style.boxShadow = "0 8px 24px rgba(13,148,136,0.12)"; b.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={(e) => { const b = e.currentTarget; b.style.borderColor = "#f1f5f9"; b.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; b.style.transform = "translateY(0)"; }}
                        >
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: gw.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                                {gw.logo}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 13, margin: "0 0 2px" }}>{gw.name}</p>
                                <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{gw.tagline}</p>
                                <p style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", margin: 0 }}>{gw.fees}</p>
                            </div>
                            <ArrowRight size={13} color="#cbd5e1" style={{ flexShrink: 0 }} />
                        </button>
                    ))}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <button onClick={() => selectGateway(null)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 500 }}>
                        ← Change payment method
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, background: "linear-gradient(135deg,#f0fdfa,#ecfdf5)", border: "2px solid #6ee7b7", flexWrap: "wrap" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: selectedGw!.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                            {selectedGw!.logo}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 800, color: "#0f172a", fontSize: 14, margin: "0 0 2px" }}>{selectedGw!.name}</p>
                            <p style={{ fontSize: 12, color: "#0d9488", margin: 0 }}>{selectedGw!.fees}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "5px 10px", borderRadius: 20, border: "1px solid #bbf7d0", flexShrink: 0 }}>
                            <Check size={11} /> Selected
                        </div>
                    </div>

                    {form.gateway === "cod" ? (
                        <div style={{ display: "flex", gap: 12, padding: 16, background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)", border: "1.5px solid #bbf7d0", borderRadius: 14, alignItems: "flex-start" }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#16a34a,#15803d)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Truck size={18} color="#fff" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: "#166534", margin: "0 0 4px", fontSize: 14 }}>Cash on Delivery enabled</p>
                                <p style={{ fontSize: 13, color: "#16a34a", margin: 0, lineHeight: 1.6 }}>Customers pay when they receive their order. No gateway or technical setup required.</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: 12, overflow: "hidden" }}>
                                <button onClick={() => setShowGuide((s) => !s)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "11px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>How to get your {selectedGw!.name} API keys</span>
                                    <ChevronRight size={13} color="#d97706" style={{ transform: showGuide ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
                                </button>
                                {showGuide && (
                                    <div style={{ padding: "0 14px 14px" }}>
                                        {selectedGw!.setupSteps.map((step, i) => (
                                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fcd34d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                                    <span style={{ fontSize: 10, fontWeight: 800, color: "#78350f" }}>{i + 1}</span>
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

                            <div style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, alignItems: "flex-start" }}>
                                <Lock size={13} color="#64748b" style={{ flexShrink: 0, marginTop: 1 }} />
                                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Your keys are encrypted before storage. We never expose them in plain text.</p>
                            </div>

                            {selectedGw!.fields.map((field) => (
                                <StepField key={field.key} label={field.label}>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            type={field.secret && !showSecret[field.key] ? "password" : "text"}
                                            value={(form as any)[field.key]}
                                            onChange={(e) => setField(field.key, e.target.value)}
                                            style={{ ...inputStyle, fontFamily: field.mono ? "monospace" : "inherit", paddingRight: field.secret ? 44 : 16 }}
                                            placeholder={field.placeholder}
                                            onFocus={fi}
                                            onBlur={fo}
                                        />
                                        {field.secret && (
                                            <button type="button" onClick={() => setShowSecret((s) => ({ ...s, [field.key]: !s[field.key] }))} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                                                {showSecret[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        )}
                                    </div>
                                </StepField>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};