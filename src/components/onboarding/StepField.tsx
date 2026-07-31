import React from "react";

interface StepFieldProps {
    label: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
}

export const StepField: React.FC<StepFieldProps> = ({ label, required, hint, children }) => (
    <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
            {hint && <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: 12, marginLeft: 4 }}>{hint}</span>}
        </label>
        {children}
    </div>
);