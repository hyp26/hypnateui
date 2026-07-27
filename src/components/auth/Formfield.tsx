import React from "react";

interface FormFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    error?: string;
    name?: string;
    autoComplete?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    error,
    name,
    autoComplete,
}) => (
    <div>
        <label
            htmlFor={name}
            style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}
        >
            {label}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            autoComplete={autoComplete}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-invalid={!!error}
            className="auth-input"
            style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: `1.5px solid ${error ? "#fca5a5" : "#e5e7eb"}`,
                fontSize: 14,
                color: "#111827",
                background: "#fff",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "'Outfit',sans-serif",
            }}
        />
        {error && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 5 }}>{error}</p>}
    </div>
);