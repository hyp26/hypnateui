import React from "react";
import { Building2, ChevronRight } from "lucide-react";
import { StepField } from "./StepField";
import { ErrorBanner } from "./ErrorBanner";
import { inputStyle, selectStyle, fi, fo } from "./formStyles";
import type { BusinessForm } from "../../types/onboarding";

interface BusinessStepProps {
    form: BusinessForm;
    onChange: (form: BusinessForm) => void;
    error: string;
    onClear: () => void;
}

const INDUSTRIES: [string, string][] = [
    ["retail", "Retail"],
    ["food", "Food & Beverage"],
    ["fashion", "Fashion"],
    ["electronics", "Electronics"],
    ["beauty", "Beauty & Wellness"],
    ["furniture", "Furniture & Home"],
    ["services", "Services"],
    ["other", "Other"],
];

const SIZES: [string, string][] = [
    ["1-10", "1–10 employees"],
    ["11-50", "11–50 employees"],
    ["51-200", "51–200 employees"],
    ["200+", "200+ employees"],
];

export const BusinessStep: React.FC<BusinessStepProps> = ({ form, onChange, error, onClear }) => {
    // Clearing the error on every edit stops a stale message from a failed
    // save lingering after the person has already corrected the field.
    const set = (k: keyof BusinessForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (error) onClear();
        onChange({ ...form, [k]: e.target.value });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#0d9488,#34d399)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 24px rgba(13,148,136,0.25)" }}>
                    <Building2 size={22} color="#fff" />
                </div>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.3px" }}>Tell us about your business</h2>
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>We personalise your store experience based on your details.</p>
                </div>
            </div>

            {error && <ErrorBanner error={error} onClear={onClear} />}

            <StepField label="Business Name" required>
                <input value={form.businessName} onChange={set("businessName")} style={inputStyle} placeholder="e.g. Rahul Fashion House" onFocus={fi} onBlur={fo} />
            </StepField>

            <div className="ob-form-grid">
                <StepField label="Industry" required>
                    <div style={{ position: "relative" }}>
                        <select value={form.industry} onChange={set("industry")} style={selectStyle} onFocus={fi} onBlur={fo}>
                            {INDUSTRIES.map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                            ))}
                        </select>
                        <ChevronRight size={13} color="#94a3b8" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none" }} />
                    </div>
                </StepField>
                <StepField label="Business Size" required>
                    <div style={{ position: "relative" }}>
                        <select value={form.size} onChange={set("size")} style={selectStyle} onFocus={fi} onBlur={fo}>
                            {SIZES.map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                            ))}
                        </select>
                        <ChevronRight size={13} color="#94a3b8" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none" }} />
                    </div>
                </StepField>
                <StepField label="Mobile Number" required>
                    <input value={form.mobileNo} onChange={set("mobileNo")} style={inputStyle} placeholder="+91 98765 43210" onFocus={fi} onBlur={fo} />
                </StepField>
                <StepField label="GST Number" hint="(optional)">
                    <input
                        value={form.gstNumber}
                        onChange={set("gstNumber")}
                        style={{ ...inputStyle, fontFamily: "monospace", textTransform: "uppercase" }}
                        placeholder="27AAPFU0939F1ZV"
                        maxLength={15}
                        onFocus={fi}
                        onBlur={fo}
                    />
                </StepField>
            </div>
        </div>
    );
};